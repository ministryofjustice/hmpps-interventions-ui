import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import InterventionsService from '../services/interventionsService'
import HmppsAuthService from '../services/hmppsAuthService'
import StaticContentController from './staticContent/staticContentController'
import CommonController from './common/commonController'
import AssessRisksAndNeedsService from '../services/assessRisksAndNeedsService'
import ReferralsController from './referrals/referralsController'
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
  const referralsController = new ReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.assessRisksAndNeedsService
  )
  const findInterventionsController = new FindInterventionsController(services.interventionsService)

  get(router, '/intervention/:interventionId/refer', (req, res) => referralsController.startReferral(req, res))
  post(router, '/intervention/:interventionId/refer', (req, res) => referralsController.createReferral(req, res))
  get(router, '/referrals/:id/form', (req, res) => referralsController.viewReferralForm(req, res))
  get(router, '/referrals/:id/service-user-details', (req, res) => referralsController.viewServiceUserDetails(req, res))
  post(router, '/referrals/:id/service-user-details', (req, res) =>
    referralsController.confirmServiceUserDetails(req, res)
  )
  get(router, '/referrals/:id/service-categories', (req, res) => referralsController.updateServiceCategories(req, res))
  post(router, '/referrals/:id/service-categories', (req, res) => referralsController.updateServiceCategories(req, res))
  get(router, '/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    referralsController.viewOrUpdateComplexityLevel(req, res)
  )
  post(router, '/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    referralsController.viewOrUpdateComplexityLevel(req, res)
  )
  get(router, '/referrals/:id/completion-deadline', (req, res) => referralsController.viewCompletionDeadline(req, res))
  post(router, '/referrals/:id/completion-deadline', (req, res) =>
    referralsController.updateCompletionDeadline(req, res)
  )
  get(router, '/referrals/:id/further-information', (req, res) => referralsController.viewFurtherInformation(req, res))
  post(router, '/referrals/:id/further-information', (req, res) =>
    referralsController.updateFurtherInformation(req, res)
  )
  get(router, '/referrals/:id/relevant-sentence', (req, res) => referralsController.viewRelevantSentence(req, res))
  post(router, '/referrals/:id/relevant-sentence', (req, res) => referralsController.updateRelevantSentence(req, res))
  get(router, '/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    referralsController.viewOrUpdateDesiredOutcomes(req, res)
  )
  post(router, '/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    referralsController.viewOrUpdateDesiredOutcomes(req, res)
  )
  get(router, '/referrals/:id/needs-and-requirements', (req, res) =>
    referralsController.viewNeedsAndRequirements(req, res)
  )
  post(router, '/referrals/:id/needs-and-requirements', (req, res) =>
    referralsController.updateNeedsAndRequirements(req, res)
  )
  get(router, '/referrals/:id/risk-information', (req, res) => referralsController.viewRiskInformation(req, res))
  post(router, '/referrals/:id/risk-information', (req, res) => referralsController.updateRiskInformation(req, res))
  get(router, '/referrals/:id/enforceable-days', (req, res) => referralsController.viewEnforceableDays(req, res))
  post(router, '/referrals/:id/enforceable-days', (req, res) => referralsController.updateEnforceableDays(req, res))
  get(router, '/referrals/:id/check-answers', (req, res) => referralsController.checkAnswers(req, res))
  post(router, '/referrals/:id/send', (req, res) => referralsController.sendDraftReferral(req, res))
  get(router, '/referrals/:id/confirmation', (req, res) => referralsController.viewConfirmation(req, res))

  get(router, '/find-interventions', (req, res) => findInterventionsController.search(req, res))
  get(router, '/find-interventions/intervention/:id', (req, res) =>
    findInterventionsController.viewInterventionDetails(req, res)
  )

  return router
}
