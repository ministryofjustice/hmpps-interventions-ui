import { Router } from 'express'
import { Services, get, post } from './index'
import ServiceProviderReferralsController from './serviceProviderReferrals/serviceProviderReferralsController'
import config from '../config'
import CaseNotesController from './caseNotes/caseNotesController'

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

  get(router, '/dashboard', (req, res) => serviceProviderReferralsController.showDashboard(req, res))
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
  get(router, '/action-plan/:id/sessions/:sessionNumber/edit', (req, res) =>
    serviceProviderReferralsController.editActionPlanSession(req, res)
  )
  post(router, '/action-plan/:id/sessions/:sessionNumber/edit', (req, res) =>
    serviceProviderReferralsController.editActionPlanSession(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', (req, res) =>
    serviceProviderReferralsController.addPostSessionAttendanceFeedback(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', (req, res) =>
    serviceProviderReferralsController.addPostSessionAttendanceFeedback(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', (req, res) =>
    serviceProviderReferralsController.addPostSessionBehaviourFeedback(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', (req, res) =>
    serviceProviderReferralsController.addPostSessionBehaviourFeedback(req, res)
  )
  get(
    router,
    '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/check-your-answers',
    (req, res) => serviceProviderReferralsController.checkPostSessionFeedbackAnswers(req, res)
  )
  post(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/submit', (req, res) =>
    serviceProviderReferralsController.submitPostSessionFeedback(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/confirmation', (req, res) =>
    serviceProviderReferralsController.showPostSessionFeedbackConfirmation(req, res)
  )
  get(router, '/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
    serviceProviderReferralsController.viewSubmittedPostSessionFeedback(req, res)
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
    serviceProviderReferralsController.startSupplierAssessmentAppointmentScheduling(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', (req, res) =>
    serviceProviderReferralsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', (req, res) =>
    serviceProviderReferralsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/check-answers', (req, res) =>
    serviceProviderReferralsController.checkSupplierAssessmentAnswers(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/schedule/:draftBookingId/submit', (req, res) =>
    serviceProviderReferralsController.submitSupplierAssessment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointment(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/scheduled-confirmation', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: false })
  )
  get(router, '/referrals/:id/supplier-assessment/rescheduled-confirmation', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: true })
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback', (req, res) =>
    serviceProviderReferralsController.viewSubmittedPostAssessmentFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', (req, res) =>
    serviceProviderReferralsController.addInitialAssessmentAttendanceFeedback(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', (req, res) =>
    serviceProviderReferralsController.addInitialAssessmentAttendanceFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', (req, res) =>
    serviceProviderReferralsController.addInitialAssessmentBehaviourFeedback(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', (req, res) =>
    serviceProviderReferralsController.addInitialAssessmentBehaviourFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/check-your-answers', (req, res) =>
    serviceProviderReferralsController.checkInitialAssessmentFeedbackAnswers(req, res)
  )
  post(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/submit', (req, res) =>
    serviceProviderReferralsController.submitPostAssessmentFeedback(req, res)
  )
  get(router, '/referrals/:id/supplier-assessment/post-assessment-feedback/confirmation', (req, res) =>
    serviceProviderReferralsController.showPostAssessmentFeedbackConfirmation(req, res)
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
  get(router, '/referrals/:id/case-notes', (req, res) => caseNotesController.showCaseNotes(req, res))

  post(router, '/referrals/:id/add-case-note/start', (req, res) =>
    caseNotesController.startAddCaseNote(req, res, 'service-provider')
  )

  get(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'service-provider')
  )

  post(router, '/referrals/:id/add-case-note/:draftCaseNoteId/details', (req, res) =>
    caseNotesController.addCaseNote(req, res, 'service-provider')
  )

  if (config.features.serviceProviderReporting.enabled) {
    get(router, '/performance-report', (req, res) => serviceProviderReferralsController.viewReporting(req, res))
    post(router, '/performance-report', (req, res) => serviceProviderReferralsController.createReport(req, res))
    get(router, '/performance-report/confirmation', (req, res) =>
      serviceProviderReferralsController.showPerformanceReportConfirmation(req, res)
    )
    get(router, '/performance-report/download', (req, res) =>
      serviceProviderReferralsController.downloadPerformanceReport(req, res)
    )
  }

  return router
}
