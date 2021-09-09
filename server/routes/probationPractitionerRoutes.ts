import { Router } from 'express'
import { Services, get, post } from './index'
import ProbationPractitionerReferralsController from './probationPractitionerReferrals/probationPractitionerReferralsController'

export const probationPractitionerUrlPrefix = '/probation-practitioner'

export default function probationPractitionerRoutes(router: Router, services: Services): Router {
  const probationPractitionerReferralsController = new ProbationPractitionerReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService,
    services.draftsService,
    services.referenceDataService
  )

  get(router, '/dashboard', (req, res) => probationPractitionerReferralsController.showMyCases(req, res))
  get(router, '/find', (req, res) => probationPractitionerReferralsController.showFindStartPage(req, res))

  get(router, '/referrals/:id/progress', (req, res) =>
    probationPractitionerReferralsController.showInterventionProgress(req, res)
  )
  get(router, '/referrals/:id/details', (req, res) => probationPractitionerReferralsController.showReferral(req, res))
  get(router, '/referrals/:referralId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
    probationPractitionerReferralsController.viewSubmittedPostSessionFeedback(req, res)
  )
  get(router, '/end-of-service-report/:id', (req, res) =>
    probationPractitionerReferralsController.viewEndOfServiceReport(req, res)
  )

  get(router, '/referrals/:id/cancellation/start', (req, res) =>
    probationPractitionerReferralsController.startCancellation(req, res)
  )
  get(router, '/referrals/:id/cancellation/:draftCancellationId/reason', (req, res) =>
    probationPractitionerReferralsController.editCancellationReason(req, res)
  )
  post(router, '/referrals/:id/cancellation/:draftCancellationId/reason', (req, res) =>
    probationPractitionerReferralsController.editCancellationReason(req, res)
  )
  get(router, '/referrals/:id/cancellation/:draftCancellationId/check-your-answers', (req, res) =>
    probationPractitionerReferralsController.cancellationCheckAnswers(req, res)
  )
  post(router, '/referrals/:id/cancellation/:draftCancellationId/submit', (req, res) =>
    probationPractitionerReferralsController.submitCancellation(req, res)
  )
  get(router, '/referrals/:id/cancellation/confirmation', (req, res) =>
    probationPractitionerReferralsController.showCancellationConfirmationPage(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment', (req, res) =>
    probationPractitionerReferralsController.showSupplierAssessmentAppointment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback', (req, res) =>
    probationPractitionerReferralsController.viewSubmittedPostAssessmentFeedback(req, res)
  )
  get(router, '/referrals/:id/action-plan', (req, res) =>
    probationPractitionerReferralsController.viewActionPlan(req, res)
  )
  post(router, '/referrals/:id/action-plan/approve', (req, res) =>
    probationPractitionerReferralsController.approveActionPlan(req, res)
  )
  get(router, '/referrals/:id/action-plan/approved', (req, res) =>
    probationPractitionerReferralsController.actionPlanApproved(req, res)
  )

  return router
}
