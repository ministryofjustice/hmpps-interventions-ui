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
import ProbationPractitionerReferralsController from './probationPractitionerReferrals/probationPractitionerReferralsController'

export interface Services {
  communityApiService: CommunityApiService
  interventionsService: InterventionsService
  hmppsAuthService: HmppsAuthService
  assessRisksAndNeedsService: AssessRisksAndNeedsService
}

export const get = (router: Router, path: string, handler: RequestHandler): Router =>
  router.get(path, asyncMiddleware(handler))

export const post = (router: Router, path: string, handler: RequestHandler): Router =>
  router.post(path, asyncMiddleware(handler))

export default function routes(router: Router, services: Services): Router {
  const staticContentController = new StaticContentController()
  const commonController = new CommonController()

  // fixme: we can't put these behind their own router yet because they do not share a common prefix
  probationPractitionerRoutes(router, services)

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

function probationPractitionerRoutes(router: Router, services: Services): Router {
  const probationPractitionerReferralsController = new ProbationPractitionerReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService
  )
  const referralsController = new ReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.assessRisksAndNeedsService
  )
  const findInterventionsController = new FindInterventionsController(services.interventionsService)

  get(router, '/probation-practitioner/dashboard', (req, res) =>
    probationPractitionerReferralsController.showMyCases(req, res)
  )
  get(router, '/probation-practitioner/find', (req, res) =>
    probationPractitionerReferralsController.showFindStartPage(req, res)
  )

  get(router, '/probation-practitioner/referrals/:id/progress', (req, res) =>
    probationPractitionerReferralsController.showInterventionProgress(req, res)
  )
  get(router, '/probation-practitioner/referrals/:id/details', (req, res) =>
    probationPractitionerReferralsController.showReferral(req, res)
  )
  get(
    router,
    '/probation-practitioner/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback',
    (req, res) => probationPractitionerReferralsController.viewSubmittedPostSessionFeedback(req, res)
  )
  get(router, '/probation-practitioner/end-of-service-report/:id', (req, res) =>
    probationPractitionerReferralsController.viewEndOfServiceReport(req, res)
  )

  get(router, '/probation-practitioner/referrals/:id/cancellation/reason', (req, res) =>
    probationPractitionerReferralsController.showReferralCancellationReasonPage(req, res)
  )
  post(router, '/probation-practitioner/referrals/:id/cancellation/check-your-answers', (req, res) =>
    probationPractitionerReferralsController.submitFormAndShowCancellationCheckAnswersPage(req, res)
  )
  post(router, '/probation-practitioner/referrals/:id/cancellation/submit', (req, res) =>
    probationPractitionerReferralsController.cancelReferral(req, res)
  )
  get(router, '/probation-practitioner/referrals/:id/cancellation/confirmation', (req, res) =>
    probationPractitionerReferralsController.showCancellationConfirmationPage(req, res)
  )
  get(router, '/probation-practitioner/referrals/:id/supplier-assessment', (req, res) =>
    probationPractitionerReferralsController.showSupplierAssessmentAppointment(req, res)
  )

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

  get(router, '/probation-practitioner/referrals/:id/action-plan', (req, res) =>
    probationPractitionerReferralsController.viewActionPlan(req, res)
  )
  post(router, '/probation-practitioner/referrals/:id/action-plan/approve', (req, res) =>
    probationPractitionerReferralsController.approveActionPlan(req, res)
  )
  get(router, '/probation-practitioner/referrals/:id/action-plan/approved', (req, res) =>
    probationPractitionerReferralsController.actionPlanApproved(req, res)
  )

  return router
}
