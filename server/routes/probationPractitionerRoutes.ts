import { Router } from 'express'
import { Services, get, post } from './index'
import ProbationPractitionerReferralsController from './probationPractitionerReferrals/probationPractitionerReferralsController'
import CaseNotesController from './caseNotes/caseNotesController'

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
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
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

  const caseNotesController = new CaseNotesController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.draftsService
  )
  get(router, '/referrals/:id/case-notes', (req, res) => caseNotesController.showCaseNotes(req, res))

  post(router, '/referrals/:id/add-case-note/start', (req, res) =>
    caseNotesController.startAddCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'probation-practitioner')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/check-answers', (req, res) =>
    caseNotesController.checkCaseNoteAnswers(req, res, 'probation-practitioner')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/submit', (req, res) =>
    caseNotesController.submitCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/confirmation', (req, res) =>
    caseNotesController.newCaseNoteConfirmation(req, res, 'probation-practitioner')
  )

  return router
}
