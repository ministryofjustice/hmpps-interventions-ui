import { randomUUID } from 'crypto'
import { getCorrelationContext } from 'applicationinsights'
import HmppsAuditClient, { AuditEvent } from '../data/hmppsAuditClient'

// Event type prefixes and suffixes as defined by HMPPS Audit ("What should our service send to HMPPS Audit?")
export enum AuditAction {
  VIEW = 'VIEW',
  SEARCH = 'SEARCH',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  DOWNLOAD = 'DOWNLOAD',
}

export enum AuditOutcome {
  ATTEMPT = 'ATTEMPT',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

export enum AuditSubjectType {
  CRN = 'CRN',
  SEARCH_TERM = 'SEARCH_TERM',
  USER_ID = 'USER_ID',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export const NO_SUBJECT_ID = 'NONE'

export type InteractionEventDetails = Omit<AuditEvent, 'what'>

export function newAuditRequestIds(): { correlationId: string; operationId?: string } {
  return { correlationId: randomUUID(), operationId: getCorrelationContext()?.operation?.id }
}

export default class AuditService {
  constructor(private readonly hmppsAuditClient: HmppsAuditClient) {}

  async logAuditEvent(event: AuditEvent) {
    await this.hmppsAuditClient.sendMessage(event)
  }

  // Sends a `<ACTION>_<ENTITY>_<OUTCOME>` event, e.g. VIEW_REFERRAL_DETAILS_SUCCESS.
  // Send failures are logged rather than thrown so that auditing never breaks a user's journey.
  async logInteraction(
    action: AuditAction,
    entity: string,
    outcome: AuditOutcome,
    eventDetails: InteractionEventDetails
  ): Promise<void> {
    await this.hmppsAuditClient.sendMessage({ ...eventDetails, what: `${action}_${entity}_${outcome}` }, false)
  }

  async logSearchServiceUser(outcome: AuditOutcome, eventDetails: InteractionEventDetails): Promise<void> {
    await this.logInteraction(AuditAction.SEARCH, 'SERVICE_USER', outcome, eventDetails)
  }
}
