import { Router } from 'express'
import { get, post } from './index'
import ProbationPractitionerReferralsController from './probationPractitionerReferrals/probationPractitionerReferralsController'
import CaseNotesController from './caseNotes/caseNotesController'
import ReferralCancellationController from './referral/cancellation/referralCancellationController'
import AppointmentsController from './appointments/appointmentsController'
import AmendAReferralController from './amendAReferral/amendAReferralController'
import ChangeLogController from './amendAReferral/changeLogController'
import InterventionsService from '../services/interventionsService'
import MockRamDeliusApiService from './testutils/mocks/mockRamDeliusApiService'
import RamDeliusApiService from '../services/ramDeliusApiService'
import ReferenceDataService from '../services/referenceDataService'
import DraftsService from '../services/draftsService'
import PrisonRegisterService from '../services/prisonRegisterService'
import AssessRisksAndNeedsService from '../services/assessRisksAndNeedsService'
import UserDataService from '../services/userDataService'
import HmppsAuthService from '../services/hmppsAuthService'

export const probationPractitionerUrlPrefix = '/probation-practitioner'

export default function probationPractitionerRoutes(
  router: Router,
  services: {
    interventionsService: InterventionsService
    ramDeliusApiService: MockRamDeliusApiService | RamDeliusApiService
    referenceDataService: ReferenceDataService
    draftsService: DraftsService
    prisonRegisterService: PrisonRegisterService
    assessRisksAndNeedsService: AssessRisksAndNeedsService
    userDataService: UserDataService
    hmppsAuthService: HmppsAuthService
  }
): Router {
  const probationPractitionerReferralsController = new ProbationPractitionerReferralsController(
    services.interventionsService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService,
    services.draftsService,
    services.referenceDataService,
    services.userDataService,
    services.prisonRegisterService,
    services.ramDeliusApiService
  )
  const appointmentsController = new AppointmentsController(
    services.interventionsService,
    services.ramDeliusApiService,
    services.hmppsAuthService,
    services.draftsService,
    services.referenceDataService
  )
  const amendAReferralController = new AmendAReferralController(
    services.interventionsService,
    services.ramDeliusApiService
  )
  const changeLogController = new ChangeLogController(services.interventionsService, services.ramDeliusApiService)

  get(router, '/dashboard', (req, res) => probationPractitionerReferralsController.showOpenCases(req, res))
  get(router, '/dashboard/open-cases', (req, res) => probationPractitionerReferralsController.showOpenCases(req, res))
  get(router, '/dashboard/unassigned-cases', (req, res) =>
    probationPractitionerReferralsController.showUnassignedCases(req, res)
  )
  get(router, '/dashboard/completed-cases', (req, res) =>
    probationPractitionerReferralsController.showCompletedCases(req, res)
  )
  get(router, '/dashboard/cancelled-cases', (req, res) =>
    probationPractitionerReferralsController.showCancelledCases(req, res)
  )

  get(router, '/find', (req, res) => probationPractitionerReferralsController.showFindStartPage(req, res))

  get(router, '/referrals/:id/progress', (req, res) =>
    probationPractitionerReferralsController.showInterventionProgress(req, res)
  )
  get(router, '/referrals/:id/details', (req, res) => probationPractitionerReferralsController.showReferral(req, res))

  get(router, '/referrals/:id/update-maximum-enforceable-days', (req, res) =>
    amendAReferralController.updateMaximumEnforceableDays(req, res)
  )
  post(router, '/referrals/:id/update-maximum-enforceable-days', (req, res) =>
    amendAReferralController.updateMaximumEnforceableDays(req, res)
  )

  get(router, '/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', (req, res) =>
    amendAReferralController.updateDesiredOutcomes(req, res)
  )
  post(router, '/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', (req, res) =>
    amendAReferralController.updateDesiredOutcomes(req, res)
  )

  get(router, '/referrals/:referralId/update-additional-information', (req, res) =>
    amendAReferralController.updateAdditionalInformation(req, res)
  )
  post(router, '/referrals/:referralId/update-additional-information', (req, res) =>
    amendAReferralController.updateAdditionalInformation(req, res)
  )

  get(router, '/referrals/:referralId/service-category/:serviceCategoryId/update-complexity-level', (req, res) =>
    amendAReferralController.updateComplexityLevel(req, res)
  )
  post(router, '/referrals/:referralId/service-category/:serviceCategoryId/update-complexity-level', (req, res) =>
    amendAReferralController.updateComplexityLevel(req, res)
  )
  get(router, '/referrals/:referralId/changelog/:changelogId/details', (req, res) =>
    changeLogController.getChangelogDetails(req, res, 'probation-practitioner')
  )
  get(router, '/referrals/:referralId/update-accessibility-needs', (req, res) =>
    amendAReferralController.amendAccessibilityNeeds(req, res)
  )
  post(router, '/referrals/:referralId/update-accessibility-needs', (req, res) =>
    amendAReferralController.amendAccessibilityNeeds(req, res)
  )
  get(router, '/referrals/:referralId/changelog', (req, res) =>
    changeLogController.getChangelog(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:referralId/employment-responsibilities', (req, res) =>
    amendAReferralController.updateEmploymentResponsibilities(req, res)
  )
  post(router, '/referrals/:referralId/employment-responsibilities', (req, res) =>
    amendAReferralController.updateEmploymentResponsibilities(req, res)
  )

  // Legacy route to keep links in old emails still working. We'll monitor and remove once traffic drops off
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
    appointmentsController.viewLegacySubmittedPostSessionFeedbackAsProbationPractitioner(req, res)
  )
  get(
    router,
    '/referrals/:referralId/session/:sessionNumber/appointment/:appointmentId/post-session-feedback',
    (req, res) => appointmentsController.viewSubmittedActionPlanSessionFeedback(req, res, 'probation-practitioner')
  )
  get(router, '/action-plan/:actionPlanId', (req, res) =>
    probationPractitionerReferralsController.viewActionPlanById(req, res)
  )
  get(router, '/end-of-service-report/:id', (req, res) =>
    probationPractitionerReferralsController.viewEndOfServiceReport(req, res)
  )

  const referralCancellationController = new ReferralCancellationController(
    services.interventionsService,
    services.ramDeliusApiService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService,
    services.draftsService
  )

  get(router, '/referrals/:id/cancellation/start', (req, res) =>
    referralCancellationController.startCancellation(req, res)
  )
  get(router, '/referrals/:id/cancellation/:draftCancellationId/reason', (req, res) =>
    referralCancellationController.editCancellationReason(req, res)
  )
  post(router, '/referrals/:id/cancellation/:draftCancellationId/reason', (req, res) =>
    referralCancellationController.editCancellationReason(req, res)
  )
  get(router, '/referrals/:id/cancellation/:draftCancellationId/check-your-answers', (req, res) =>
    referralCancellationController.cancellationCheckAnswers(req, res)
  )
  post(router, '/referrals/:id/cancellation/:draftCancellationId/submit', (req, res) =>
    referralCancellationController.submitCancellation(req, res)
  )
  get(router, '/referrals/:id/cancellation/confirmation', (req, res) =>
    referralCancellationController.showCancellationConfirmationPage(req, res)
  )

  get(router, '/referrals/:id/supplier-assessment', (req, res) =>
    appointmentsController.showSupplierAssessmentAppointment(req, res, 'probation-practitioner')
  )
  get(router, '/referrals/:referralId/supplier-assessment/post-assessment-feedback', (req, res) =>
    appointmentsController.viewSupplierAssessmentFeedback(req, res, 'probation-practitioner')
  )
  get(router, '/referrals/:id/action-plan', (req, res) =>
    probationPractitionerReferralsController.viewLatestActionPlan(req, res)
  )
  post(router, '/referrals/:id/action-plan/approve', (req, res) =>
    probationPractitionerReferralsController.approveActionPlan(req, res)
  )
  get(router, '/referrals/:id/action-plan/approved', (req, res) =>
    probationPractitionerReferralsController.actionPlanApproved(req, res)
  )

  const caseNotesController = new CaseNotesController(
    services.interventionsService,
    services.ramDeliusApiService,
    services.hmppsAuthService,
    services.draftsService
  )
  get(router, '/referrals/:id/case-notes', (req, res) =>
    caseNotesController.showCaseNotes(req, res, 'probation-practitioner')
  )

  post(router, '/referrals/:id/add-case-note/start', (req, res) =>
    caseNotesController.startAddCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'probation-practitioner')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/case-note/:caseNoteId', (req, res) =>
    caseNotesController.viewCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/check-answers', (req, res) =>
    caseNotesController.checkCaseNoteAnswers(req, res, 'probation-practitioner')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/submit', (req, res) =>
    caseNotesController.submitCaseNote(req, res, 'probation-practitioner')
  )

  get(router, '/referrals/:id/add-case-note/confirmation', (req, res) =>
    caseNotesController.addCaseNoteConfirmation(req, res, 'probation-practitioner')
  )
  get(router, '/referrals/:referralId/interpreter-needs', (req, res) =>
    amendAReferralController.updateInterpreterNeeds(req, res)
  )
  post(router, '/referrals/:referralId/interpreter-needs', (req, res) =>
    amendAReferralController.updateInterpreterNeeds(req, res)
  )

  return router
}
