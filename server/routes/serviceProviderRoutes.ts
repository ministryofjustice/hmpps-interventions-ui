import { Router } from 'express'
import { Services, get, post } from './index'
import ServiceProviderReferralsController from './serviceProviderReferrals/serviceProviderReferralsController'
import config from '../config'
import CaseNotesController from './caseNotes/caseNotesController'
import ReportingController from './reporting/reportingController'
import AppointmentsController from './appointments/appointmentsController'

export const serviceProviderUrlPrefix = '/service-provider'
export default function serviceProviderRoutes(router: Router, services: Services): Router {
  const serviceProviderReferralsController = new ServiceProviderReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService,
    services.draftsService,
    services.referenceDataService
  )
  const appointmentsController = new AppointmentsController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.draftsService,
    services.referenceDataService
  )

  get(router, '/dashboard', (req, res) => serviceProviderReferralsController.showMyCasesDashboard(req, res))
  get(router, '/dashboard/my-cases', (req, res) => serviceProviderReferralsController.showMyCasesDashboard(req, res))
  get(router, '/dashboard/all-open-cases', (req, res) =>
    serviceProviderReferralsController.showAllOpenCasesDashboard(req, res)
  )
  get(router, '/dashboard/unassigned-cases', (req, res) =>
    serviceProviderReferralsController.showUnassignedCasesDashboard(req, res)
  )
  get(router, '/dashboard/completed-cases', (req, res) =>
    serviceProviderReferralsController.showCompletedCasesDashboard(req, res)
  )

  get(router, '/referrals/:id/details', (req, res) => serviceProviderReferralsController.showReferral(req, res))
  get(router, '/referrals/:id/progress', (req, res) =>
    serviceProviderReferralsController.showInterventionProgress(req, res)
  )
  post(router, '/referrals/:id/assignment/start', (req, res) =>
    serviceProviderReferralsController.startAssignment(req, res)
  )
  get(router, '/referrals/:id/assignment/:draftAssignmentId/check', (req, res) =>
    serviceProviderReferralsController.checkAssignment(req, res)
  )
  post(router, '/referrals/:id/assignment/:draftAssignmentId/submit', (req, res) =>
    serviceProviderReferralsController.submitAssignment(req, res)
  )
  get(router, '/referrals/:id/assignment/confirmation', (req, res) =>
    serviceProviderReferralsController.confirmAssignment(req, res)
  )
  post(router, '/referrals/:id/action-plan', (req, res) =>
    serviceProviderReferralsController.createDraftActionPlan(req, res)
  )
  get(router, '/action-plan/:id/add-activity/:number', (req, res) =>
    serviceProviderReferralsController.showActionPlanAddActivitiesForm(req, res)
  )
  post(router, '/action-plan/:id/add-activity/:number', (req, res) =>
    serviceProviderReferralsController.addOrUpdateActionPlanActivity(req, res)
  )
  post(router, '/action-plan/:id/add-activities', (req, res) =>
    serviceProviderReferralsController.finaliseActionPlanActivities(req, res)
  )
  get(router, '/action-plan/:id/review', (req, res) => serviceProviderReferralsController.reviewActionPlan(req, res))
  post(router, '/action-plan/:id/submit', (req, res) => serviceProviderReferralsController.submitActionPlan(req, res))
  get(router, '/action-plan/:id/confirmation', (req, res) =>
    serviceProviderReferralsController.showActionPlanConfirmation(req, res)
  )
  get(router, '/action-plan/:id/number-of-sessions', (req, res) =>
    serviceProviderReferralsController.addNumberOfSessionsToActionPlan(req, res)
  )
  post(router, '/action-plan/:id/number-of-sessions', (req, res) =>
    serviceProviderReferralsController.addNumberOfSessionsToActionPlan(req, res)
  )
  get(router, '/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/start', (req, res) =>
    appointmentsController.startEditingDeliverySessionAppointment(req, res)
  )
  get(
    router,
    '/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/details',
    (req, res) => appointmentsController.editDeliverySessionAppointment(req, res)
  )
  post(
    router,
    '/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/details',
    (req, res) => appointmentsController.editDeliverySessionAppointment(req, res)
  )
  get(
    router,
    '/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/check-answers',
    (req, res) => appointmentsController.checkDeliverySessionAppointmentAnswers(req, res)
  )
  post(
    router,
    '/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/submit',
    (req, res) => appointmentsController.submitDeliverySessionAppointment(req, res)
  )

  // Deprecated
  get(router, '/action-plan/:id/sessions/:sessionNumber/edit/start', (req, res) =>
    appointmentsController.startEditingActionPlanSessionAppointment(req, res)
  )
  // Deprecated
  get(router, '/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/details', (req, res) =>
    appointmentsController.editActionPlanSessionAppointment(req, res)
  )
  // Deprecated
  post(router, '/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/details', (req, res) =>
    appointmentsController.editActionPlanSessionAppointment(req, res)
  )
  // Deprecated
  get(router, '/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/check-answers', (req, res) =>
    appointmentsController.checkActionPlanSessionAppointmentAnswers(req, res)
  )
  // Deprecated
  post(router, '/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/submit', (req, res) =>
    appointmentsController.submitActionPlanSessionAppointment(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', (req, res) =>
    appointmentsController.addPostSessionAttendanceFeedback(req, res)
  )
  get(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/attendance',
    (req, res) => appointmentsController.addPostSessionAttendanceFeedback(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', (req, res) =>
    appointmentsController.addPostSessionAttendanceFeedback(req, res)
  )

  post(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/attendance',
    (req, res) => appointmentsController.addPostSessionAttendanceFeedback(req, res)
  )

  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', (req, res) =>
    appointmentsController.addPostSessionBehaviourFeedback(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', (req, res) =>
    appointmentsController.addPostSessionBehaviourFeedback(req, res)
  )
  get(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/behaviour',
    (req, res) => appointmentsController.addPostSessionBehaviourFeedback(req, res)
  )
  post(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/behaviour',
    (req, res) => appointmentsController.addPostSessionBehaviourFeedback(req, res)
  )
  get(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/check-your-answers',
    (req, res) => appointmentsController.checkPostSessionFeedbackAnswers(req, res)
  )
  get(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/check-your-answers',
    (req, res) => appointmentsController.checkPostSessionFeedbackAnswers(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/submit', (req, res) =>
    appointmentsController.submitPostSessionFeedback(req, res)
  )
  post(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/submit',
    (req, res) => appointmentsController.submitPostSessionFeedback(req, res)
  )

  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/confirmation', (req, res) =>
    appointmentsController.showPostSessionFeedbackConfirmation(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
    appointmentsController.viewSubmittedPostSessionFeedback(req, res, 'service-provider')
  )
  get(router, '/end-of-service-report/:id', (req, res) =>
    serviceProviderReferralsController.viewEndOfServiceReport(req, res)
  )
  post(router, '/referrals/:id/end-of-service-report', (req, res) =>
    serviceProviderReferralsController.createDraftEndOfServiceReport(req, res)
  )
  get(router, '/end-of-service-report/:id/outcomes/:number', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportOutcome(req, res)
  )
  post(router, '/end-of-service-report/:id/outcomes/:number', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportOutcome(req, res)
  )
  get(router, '/end-of-service-report/:id/further-information', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportFurtherInformation(req, res)
  )
  post(router, '/end-of-service-report/:id/further-information', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportFurtherInformation(req, res)
  )
  get(router, '/end-of-service-report/:id/check-answers', (req, res) =>
    serviceProviderReferralsController.endOfServiceReportCheckAnswers(req, res)
  )
  post(router, '/end-of-service-report/:id/submit', (req, res) =>
    serviceProviderReferralsController.submitEndOfServiceReport(req, res)
  )
  get(router, '/end-of-service-report/:id/confirmation', (req, res) =>
    serviceProviderReferralsController.showEndOfServiceReportConfirmation(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/schedule/start', (req, res) =>
    appointmentsController.startSupplierAssessmentAppointmentScheduling(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', (req, res) =>
    appointmentsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', (req, res) =>
    appointmentsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/check-answers', (req, res) =>
    appointmentsController.checkSupplierAssessmentAnswers(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/submit', (req, res) =>
    appointmentsController.submitSupplierAssessmentAppointment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment', (req, res) =>
    appointmentsController.showSupplierAssessmentAppointment(req, res, 'service-provider')
  )
  get(router, '/referrals/:id/supplier-assessment/scheduled-confirmation', (req, res) =>
    appointmentsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: false })
  )
  get(router, '/referrals/:id/supplier-assessment/rescheduled-confirmation', (req, res) =>
    appointmentsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: true })
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', (req, res) =>
    appointmentsController.addSupplierAssessmentAttendanceFeedback(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', (req, res) =>
    appointmentsController.addSupplierAssessmentAttendanceFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', (req, res) =>
    appointmentsController.addSupplierAssessmentBehaviourFeedback(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', (req, res) =>
    appointmentsController.addSupplierAssessmentBehaviourFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/check-your-answers', (req, res) =>
    appointmentsController.checkSupplierAssessmentFeedbackAnswers(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/submit', (req, res) =>
    appointmentsController.submitSupplierAssessmentFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/confirmation', (req, res) =>
    appointmentsController.showSupplierAssessmentFeedbackConfirmation(req, res)
  )
  get(router, '/referrals/:referralId/supplier-assessment/post-assessment-feedback', (req, res) =>
    appointmentsController.viewSupplierAssessmentFeedback(req, res, 'service-provider')
  )
  // This needs to go last in the `/post-assessment-feedback` urls to prevent clashes between the :appointmentId and other suffixes.
  get(router, '/referrals/:referralId/supplier-assessment/post-assessment-feedback/:appointmentId', (req, res) =>
    appointmentsController.viewSupplierAssessmentFeedback(req, res, 'service-provider')
  )

  get(router, '/referrals/:id/action-plan', (req, res) => serviceProviderReferralsController.viewActionPlan(req, res))

  get(router, '/referrals/:id/action-plan/edit', (req, res) =>
    serviceProviderReferralsController.actionPlanEditConfirmation(req, res)
  )

  post(router, '/referrals/:id/action-plan/edit', (req, res) =>
    serviceProviderReferralsController.createNewDraftActionPlan(req, res)
  )

  const caseNotesController = new CaseNotesController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.draftsService
  )
  get(router, '/referrals/:id/case-notes', (req, res) =>
    caseNotesController.showCaseNotes(req, res, 'service-provider')
  )

  post(router, '/referrals/:id/add-case-note/start', (req, res) =>
    caseNotesController.startAddCaseNote(req, res, 'service-provider')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'service-provider')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'service-provider')
  )

  get(router, '/case-note/:caseNoteId', (req, res) => caseNotesController.viewCaseNote(req, res, 'service-provider'))

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/check-answers', (req, res) =>
    caseNotesController.checkCaseNoteAnswers(req, res, 'service-provider')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/submit', (req, res) =>
    caseNotesController.submitCaseNote(req, res, 'service-provider')
  )

  get(router, '/referrals/:id/add-case-note/confirmation', (req, res) =>
    caseNotesController.addCaseNoteConfirmation(req, res, 'service-provider')
  )

  if (config.features.serviceProviderReporting) {
    const reportingController = new ReportingController(services.interventionsService)

    get(router, '/performance-report', (req, res) => reportingController.viewReporting(req, res))
    post(router, '/performance-report', (req, res) => reportingController.createReport(req, res))
    get(router, '/performance-report/confirmation', (req, res) =>
      reportingController.showPerformanceReportConfirmation(req, res)
    )
    get(router, '/performance-report/download', (req, res) => reportingController.downloadPerformanceReport(req, res))
  }

  return router
}
