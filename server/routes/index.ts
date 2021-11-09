import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import InterventionsService from '../services/interventionsService'
import HmppsAuthService from '../services/hmppsAuthService'
import StaticContentController from './staticContent/staticContentController'
import CommonController from './common/commonController'
import AssessRisksAndNeedsService from '../services/assessRisksAndNeedsService'
import MakeAReferralController from './makeAReferral/makeAReferralController'
import FindInterventionsController from './findInterventions/findInterventionsController'
import DraftsService from '../services/draftsService'
import ReferenceDataService from '../services/referenceDataService'

export interface Services {
  communityApiService: CommunityApiService
  interventionsService: InterventionsService
  hmppsAuthService: HmppsAuthService
  assessRisksAndNeedsService: AssessRisksAndNeedsService
  draftsService: DraftsService
  referenceDataService: ReferenceDataService
}

export const get = (router: Router, path: string, handler: RequestHandler): Router =>
  router.get(path, asyncMiddleware(handler))

export const post = (router: Router, path: string, handler: RequestHandler): Router =>
  router.post(path, asyncMiddleware(handler))

export default function routes(router: Router, services: Services): Router {
  const staticContentController = new StaticContentController()
  const commonController = new CommonController()

  // fixme: we can't put these behind their own router yet because they do not share a common prefix
  probationPractitionerRoutesWithoutPrefix(router, services)

  get(router, '/', (req, res, next) => {
    const { authSource } = res.locals.user
    if (authSource === 'delius') {
      res.redirect('/probation-practitioner/dashboard')
    } else {
      res.redirect('/service-provider/dashboard')
    }
  })

  get(router, '/report-a-problem', (req, res) => {
    return commonController.reportAProblem(req, res)
  })

  get(router, '/delivery-schedule', (req, res) => {
    return commonController.deliverySchedule(req, res)
  })

  get(router, '/accessibility-statement', (req, res) => {
    return commonController.accessibilityStatement(req, res)
  })

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    get(router, '/static-pages', (req, res) => {
      return staticContentController.index(req, res)
    })

    StaticContentController.allPaths.forEach(path => {
      get(router, path, (req, res) => {
        return staticContentController.renderStaticPage(req, res)
      })
    })
  }

  return router
}

function probationPractitionerRoutesWithoutPrefix(router: Router, services: Services): Router {
  const findInterventionsController = new FindInterventionsController(services.interventionsService)
  get(router, '/find-interventions', (req, res) => findInterventionsController.search(req, res))
  get(router, '/find-interventions/intervention/:id', (req, res) =>
    findInterventionsController.viewInterventionDetails(req, res)
  )

  const makeAReferralController = new MakeAReferralController(
    services.interventionsService,
    services.communityApiService,
    services.assessRisksAndNeedsService
  )
  get(router, '/intervention/:interventionId/refer', (req, res) => makeAReferralController.startReferral(req, res))
  post(router, '/intervention/:interventionId/refer', (req, res) => makeAReferralController.createReferral(req, res))
  get(router, '/referrals/:id/form', (req, res) => makeAReferralController.viewReferralForm(req, res))
  get(router, '/referrals/:id/service-user-details', (req, res) =>
    makeAReferralController.viewServiceUserDetails(req, res)
  )
  post(router, '/referrals/:id/service-user-details', (req, res) =>
    makeAReferralController.confirmServiceUserDetails(req, res)
  )
  get(router, '/referrals/:id/service-categories', (req, res) =>
    makeAReferralController.updateServiceCategories(req, res)
  )
  post(router, '/referrals/:id/service-categories', (req, res) =>
    makeAReferralController.updateServiceCategories(req, res)
  )
  get(router, '/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    makeAReferralController.viewOrUpdateComplexityLevel(req, res)
  )
  post(router, '/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    makeAReferralController.viewOrUpdateComplexityLevel(req, res)
  )
  get(router, '/referrals/:id/completion-deadline', (req, res) =>
    makeAReferralController.viewCompletionDeadline(req, res)
  )
  post(router, '/referrals/:id/completion-deadline', (req, res) =>
    makeAReferralController.updateCompletionDeadline(req, res)
  )
  get(router, '/referrals/:id/further-information', (req, res) =>
    makeAReferralController.viewFurtherInformation(req, res)
  )
  post(router, '/referrals/:id/further-information', (req, res) =>
    makeAReferralController.updateFurtherInformation(req, res)
  )
  get(router, '/referrals/:id/relevant-sentence', (req, res) => makeAReferralController.viewRelevantSentence(req, res))
  post(router, '/referrals/:id/relevant-sentence', (req, res) =>
    makeAReferralController.updateRelevantSentence(req, res)
  )
  get(router, '/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    makeAReferralController.viewOrUpdateDesiredOutcomes(req, res)
  )
  post(router, '/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    makeAReferralController.viewOrUpdateDesiredOutcomes(req, res)
  )
  get(router, '/referrals/:id/needs-and-requirements', (req, res) =>
    makeAReferralController.viewNeedsAndRequirements(req, res)
  )
  post(router, '/referrals/:id/needs-and-requirements', (req, res) =>
    makeAReferralController.updateNeedsAndRequirements(req, res)
  )
  get(router, '/referrals/:id/risk-information', (req, res) => makeAReferralController.viewRiskInformation(req, res))
  post(router, '/referrals/:id/risk-information', (req, res) => makeAReferralController.updateRiskInformation(req, res))

  get(router, '/referrals/:id/edit-oasys-risk-information', (req, res) =>
    makeAReferralController.editOasysRiskInformation(req, res)
  )

  get(router, '/referrals/:id/enforceable-days', (req, res) => makeAReferralController.viewEnforceableDays(req, res))
  post(router, '/referrals/:id/enforceable-days', (req, res) => makeAReferralController.updateEnforceableDays(req, res))
  get(router, '/referrals/:id/check-answers', (req, res) => makeAReferralController.checkAnswers(req, res))
  post(router, '/referrals/:id/send', (req, res) => makeAReferralController.sendDraftReferral(req, res))
  get(router, '/referrals/:id/confirmation', (req, res) => makeAReferralController.viewConfirmation(req, res))

  return router
}
