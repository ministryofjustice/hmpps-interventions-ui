import type { Request, RequestHandler } from 'express'
import AuditService, {
  AuditAction,
  AuditOutcome,
  AuditSubjectType,
  NO_SUBJECT_ID,
  newAuditRequestIds,
} from '../services/auditService'
import AuditContext from '../utils/auditContext'

export interface RouteAuditOptions {
  // defaults to EDIT for POST and for any route with "update" in its path, otherwise VIEW
  action?: AuditAction
  // defaults to a name derived from the route path, e.g. /referrals/:id/details => REFERRAL_DETAILS
  entity?: string
  // request body field holding the search term, for SEARCH routes
  searchTermField?: string
}

const IGNORED_BODY_FIELDS = ['_csrf']

export function auditEntityFromPath(path: string): string {
  const entity = path
    .split('/')
    .filter(segment => segment !== '' && !segment.startsWith(':'))
    .map(segment => (segment === 'referrals' ? 'referral' : segment))
    .join('_')
    .replace(/-/g, '_')
    .toUpperCase()

  return entity || 'HOME'
}

export function defaultAuditAction(method: 'GET' | 'POST', path: string): AuditAction {
  const isUpdateRoute = path.split('/').some(segment => !segment.startsWith(':') && /\bupdate\b/i.test(segment))
  return method === 'POST' || isUpdateRoute ? AuditAction.EDIT : AuditAction.VIEW
}

function changedFields(req: Request): { field: string }[] {
  return Object.keys(req.body ?? {})
    .filter(field => !IGNORED_BODY_FIELDS.includes(field))
    .map(field => ({ field }))
}

// Wraps a route handler so that every request sends an ATTEMPT audit event before the handler runs,
// followed by a SUCCESS or FAILURE event once it has finished. A successful SEARCH is also followed by a
// VIEW_<ENTITY>_SEARCH_RESULTS_SUCCESS event listing the reference numbers of the referrals returned.
export default function auditedHandler(
  method: 'GET' | 'POST',
  path: string,
  handler: RequestHandler,
  options: RouteAuditOptions = {}
): RequestHandler {
  const action = options.action ?? defaultAuditAction(method, path)
  const entity = options.entity ?? auditEntityFromPath(path)
  const recordsChanges = [AuditAction.CREATE, AuditAction.EDIT, AuditAction.DELETE].includes(action)

  return async (req, res, next) => {
    const auditService = req.app.get('auditService') as AuditService | undefined
    const who = req.user?.username
    if (!auditService || !who) {
      return handler(req, res, next)
    }

    const context = new AuditContext()
    const requestIds = newAuditRequestIds()
    const rawSearchTerm = options.searchTermField ? req.body?.[options.searchTermField] : undefined
    const searchTerm = typeof rawSearchTerm === 'string' && rawSearchTerm.trim() !== '' ? rawSearchTerm.trim() : null
    const baseDetails = {
      route: `${req.baseUrl}${path}`,
      entityIds: { ...req.params },
      ...(recordsChanges ? { changes: changedFields(req) } : {}),
    }

    const log = (
      outcome: AuditOutcome,
      extraDetails: object = {},
      eventAction: AuditAction = action,
      eventEntity: string = entity
    ) => {
      const crns = [...context.crns]
      let subject = { subjectId: NO_SUBJECT_ID, subjectType: AuditSubjectType.NOT_APPLICABLE as AuditSubjectType }
      if (searchTerm !== null) {
        subject = { subjectId: searchTerm, subjectType: AuditSubjectType.SEARCH_TERM }
      } else if (crns.length === 1) {
        subject = { subjectId: crns[0], subjectType: AuditSubjectType.CRN }
      }

      return auditService.logInteraction(eventAction, eventEntity, outcome, {
        who,
        ...requestIds,
        ...subject,
        details: {
          ...baseDetails,
          ...(searchTerm === null && crns.length > 1 ? { returnedSubjectIds: crns } : {}),
          ...extraDetails,
        },
      })
    }

    return AuditContext.run(context, async () => {
      await log(AuditOutcome.ATTEMPT)
      try {
        await handler(req, res, next)
      } catch (err) {
        await log(AuditOutcome.FAILURE, { failureReason: (err as Error)?.message ?? 'unknown error' })
        throw err
      }

      if (res.statusCode >= 400) {
        await log(AuditOutcome.FAILURE, { failureReason: `HTTP ${res.statusCode}` })
      } else {
        await log(AuditOutcome.SUCCESS)
        if (action === AuditAction.SEARCH) {
          const returnedSubjectIds = [...context.referenceNumbers]
          await log(
            AuditOutcome.SUCCESS,
            { results: { resultCount: returnedSubjectIds.length, returnedSubjectIds } },
            AuditAction.VIEW,
            `${entity}_SEARCH_RESULTS`
          )
        }
      }
    })
  }
}
