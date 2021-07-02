import type { RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import CommunityApiService from '../services/communityApiService'
import InterventionsService from '../services/interventionsService'
import HmppsAuthService from '../services/hmppsAuthService'
import ServiceProviderReferralsController from './serviceProviderReferrals/serviceProviderReferralsController'
import ReferralsController from './referrals/referralsController'
import StaticContentController from './staticContent/staticContentController'
import FindInterventionsController from './findInterventions/findInterventionsController'
import ProbationPractitionerReferralsController from './probationPractitionerReferrals/probationPractitionerReferralsController'
import CommonController from './common/commonController'
import AssessRisksAndNeedsService from '../services/assessRisksAndNeedsService'

export interface Services {
  communityApiService: CommunityApiService
  interventionsService: InterventionsService
  hmppsAuthService: HmppsAuthService
  assessRisksAndNeedsService: AssessRisksAndNeedsService
}

export default function routes(router: Router, services: Services): Router {
  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

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
  const staticContentController = new StaticContentController()
  const serviceProviderReferralsController = new ServiceProviderReferralsController(
    services.interventionsService,
    services.communityApiService,
    services.hmppsAuthService,
    services.assessRisksAndNeedsService
  )
  const findInterventionsController = new FindInterventionsController(services.interventionsService)
  const commonController = new CommonController()

  get('/', (req, res, next) => {
    const { authSource } = res.locals.user
    if (authSource === 'delius') {
      res.redirect('/probation-practitioner/dashboard')
    } else {
      res.redirect('/service-provider/dashboard')
    }
  })

  get('/service-provider/dashboard', (req, res) => serviceProviderReferralsController.showDashboard(req, res))
  get('/service-provider/referrals/:id/details', (req, res) =>
    serviceProviderReferralsController.showReferral(req, res)
  )
  get('/service-provider/referrals/:id/progress', (req, res) =>
    serviceProviderReferralsController.showInterventionProgress(req, res)
  )
  get('/service-provider/referrals/:id/assignment/check', (req, res) =>
    serviceProviderReferralsController.checkAssignment(req, res)
  )
  post('/service-provider/referrals/:id/assignment', (req, res) =>
    serviceProviderReferralsController.assignReferral(req, res)
  )
  get('/service-provider/referrals/:id/assignment/confirmation', (req, res) =>
    serviceProviderReferralsController.confirmAssignment(req, res)
  )
  post('/service-provider/referrals/:id/action-plan', (req, res) =>
    serviceProviderReferralsController.createDraftActionPlan(req, res)
  )
  get('/service-provider/action-plan/:id/add-activity/:number', (req, res) =>
    serviceProviderReferralsController.showActionPlanAddActivitiesForm(req, res)
  )
  post('/service-provider/action-plan/:id/add-activity/:number', (req, res) =>
    serviceProviderReferralsController.addOrUpdateActionPlanActivity(req, res)
  )
  post('/service-provider/action-plan/:id/add-activities', (req, res) =>
    serviceProviderReferralsController.finaliseActionPlanActivities(req, res)
  )
  get('/service-provider/action-plan/:id/review', (req, res) =>
    serviceProviderReferralsController.reviewActionPlan(req, res)
  )
  post('/service-provider/action-plan/:id/submit', (req, res) =>
    serviceProviderReferralsController.submitActionPlan(req, res)
  )
  get('/service-provider/action-plan/:id/confirmation', (req, res) =>
    serviceProviderReferralsController.showActionPlanConfirmation(req, res)
  )
  get('/service-provider/action-plan/:id/number-of-sessions', (req, res) =>
    serviceProviderReferralsController.addNumberOfSessionsToActionPlan(req, res)
  )
  post('/service-provider/action-plan/:id/number-of-sessions', (req, res) =>
    serviceProviderReferralsController.addNumberOfSessionsToActionPlan(req, res)
  )
  get('/service-provider/action-plan/:id/sessions/:sessionNumber/edit', (req, res) =>
    serviceProviderReferralsController.editActionPlanSession(req, res)
  )
  post('/service-provider/action-plan/:id/sessions/:sessionNumber/edit', (req, res) =>
    serviceProviderReferralsController.editActionPlanSession(req, res)
  )
  get(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance',
    (req, res) => serviceProviderReferralsController.addPostSessionAttendanceFeedback(req, res)
  )
  post(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance',
    (req, res) => serviceProviderReferralsController.addPostSessionAttendanceFeedback(req, res)
  )
  get(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour',
    (req, res) => serviceProviderReferralsController.addPostSessionBehaviourFeedback(req, res)
  )
  post(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour',
    (req, res) => serviceProviderReferralsController.addPostSessionBehaviourFeedback(req, res)
  )
  get(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/check-your-answers',
    (req, res) => serviceProviderReferralsController.checkPostSessionFeedbackAnswers(req, res)
  )
  post(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/submit',
    (req, res) => serviceProviderReferralsController.submitPostSessionFeedback(req, res)
  )
  get(
    '/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/confirmation',
    (req, res) => serviceProviderReferralsController.showPostSessionFeedbackConfirmation(req, res)
  )
  get('/service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', (req, res) =>
    serviceProviderReferralsController.viewSubmittedPostSessionFeedback(req, res)
  )
  post('/service-provider/referrals/:id/end-of-service-report', (req, res) =>
    serviceProviderReferralsController.createDraftEndOfServiceReport(req, res)
  )
  get('/service-provider/end-of-service-report/:id/outcomes/:number', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportOutcome(req, res)
  )
  post('/service-provider/end-of-service-report/:id/outcomes/:number', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportOutcome(req, res)
  )
  get('/service-provider/end-of-service-report/:id/further-information', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportFurtherInformation(req, res)
  )
  post('/service-provider/end-of-service-report/:id/further-information', (req, res) =>
    serviceProviderReferralsController.editEndOfServiceReportFurtherInformation(req, res)
  )
  get('/service-provider/end-of-service-report/:id/check-answers', (req, res) =>
    serviceProviderReferralsController.endOfServiceReportCheckAnswers(req, res)
  )
  post('/service-provider/end-of-service-report/:id/submit', (req, res) =>
    serviceProviderReferralsController.submitEndOfServiceReport(req, res)
  )
  get('/service-provider/end-of-service-report/:id/confirmation', (req, res) =>
    serviceProviderReferralsController.showEndOfServiceReportConfirmation(req, res)
  )
  get('/service-provider/referrals/:id/supplier-assessment/schedule', (req, res) =>
    serviceProviderReferralsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  post('/service-provider/referrals/:id/supplier-assessment/schedule', (req, res) =>
    serviceProviderReferralsController.scheduleSupplierAssessmentAppointment(req, res)
  )
  get('/service-provider/referrals/:id/supplier-assessment', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointment(req, res)
  )
  get('/service-provider/referrals/:id/supplier-assessment/scheduled-confirmation', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: false })
  )
  get('/service-provider/referrals/:id/supplier-assessment/rescheduled-confirmation', (req, res) =>
    serviceProviderReferralsController.showSupplierAssessmentAppointmentConfirmation(req, res, { isReschedule: true })
  )

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    get('/static-pages', (req, res) => {
      return staticContentController.index(req, res)
    })

    StaticContentController.allPaths.forEach(path => {
      get(path, (req, res) => {
        return staticContentController.renderStaticPage(req, res)
      })
    })
  }
  get('/report-a-problem', (req, res) => {
    return commonController.reportAProblem(req, res)
  })
  get('/probation-practitioner/dashboard', (req, res) => probationPractitionerReferralsController.showMyCases(req, res))
  get('/probation-practitioner/find', (req, res) =>
    probationPractitionerReferralsController.showFindStartPage(req, res)
  )

  get('/probation-practitioner/referrals/:id/progress', (req, res) =>
    probationPractitionerReferralsController.showInterventionProgress(req, res)
  )
  get('/probation-practitioner/referrals/:id/details', (req, res) =>
    probationPractitionerReferralsController.showReferral(req, res)
  )
  get(
    '/probation-practitioner/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback',
    (req, res) => probationPractitionerReferralsController.viewSubmittedPostSessionFeedback(req, res)
  )
  get('/probation-practitioner/end-of-service-report/:id', (req, res) =>
    probationPractitionerReferralsController.viewEndOfServiceReport(req, res)
  )

  get('/probation-practitioner/referrals/:id/cancellation/reason', (req, res) =>
    probationPractitionerReferralsController.showReferralCancellationReasonPage(req, res)
  )
  post('/probation-practitioner/referrals/:id/cancellation/check-your-answers', (req, res) =>
    probationPractitionerReferralsController.submitFormAndShowCancellationCheckAnswersPage(req, res)
  )
  post('/probation-practitioner/referrals/:id/cancellation/submit', (req, res) =>
    probationPractitionerReferralsController.cancelReferral(req, res)
  )
  get('/probation-practitioner/referrals/:id/cancellation/confirmation', (req, res) =>
    probationPractitionerReferralsController.showCancellationConfirmationPage(req, res)
  )
  get('/probation-practitioner/referrals/:id/supplier-assessment', (req, res) =>
    probationPractitionerReferralsController.showSupplierAssessmentAppointment(req, res)
  )

  get('/intervention/:interventionId/refer', (req, res) => referralsController.startReferral(req, res))
  post('/intervention/:interventionId/refer', (req, res) => referralsController.createReferral(req, res))
  get('/referrals/:id/form', (req, res) => referralsController.viewReferralForm(req, res))
  get('/referrals/:id/service-user-details', (req, res) => referralsController.viewServiceUserDetails(req, res))
  post('/referrals/:id/service-user-details', (req, res) => referralsController.confirmServiceUserDetails(req, res))
  get('/referrals/:id/service-categories', (req, res) => referralsController.updateServiceCategories(req, res))
  post('/referrals/:id/service-categories', (req, res) => referralsController.updateServiceCategories(req, res))
  get('/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    referralsController.viewOrUpdateComplexityLevel(req, res)
  )
  post('/referrals/:referralId/service-category/:serviceCategoryId/complexity-level', (req, res) =>
    referralsController.viewOrUpdateComplexityLevel(req, res)
  )
  get('/referrals/:id/completion-deadline', (req, res) => referralsController.viewCompletionDeadline(req, res))
  post('/referrals/:id/completion-deadline', (req, res) => referralsController.updateCompletionDeadline(req, res))
  get('/referrals/:id/further-information', (req, res) => referralsController.viewFurtherInformation(req, res))
  post('/referrals/:id/further-information', (req, res) => referralsController.updateFurtherInformation(req, res))
  get('/referrals/:id/relevant-sentence', (req, res) => referralsController.viewRelevantSentence(req, res))
  post('/referrals/:id/relevant-sentence', (req, res) => referralsController.updateRelevantSentence(req, res))
  get('/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    referralsController.viewOrUpdateDesiredOutcomes(req, res)
  )
  post('/referrals/:referralId/service-category/:serviceCategoryId/desired-outcomes', (req, res) =>
    referralsController.viewOrUpdateDesiredOutcomes(req, res)
  )
  get('/referrals/:id/needs-and-requirements', (req, res) => referralsController.viewNeedsAndRequirements(req, res))
  post('/referrals/:id/needs-and-requirements', (req, res) => referralsController.updateNeedsAndRequirements(req, res))
  get('/referrals/:id/risk-information', (req, res) => referralsController.viewRiskInformation(req, res))
  post('/referrals/:id/risk-information', (req, res) => referralsController.updateRiskInformation(req, res))
  get('/referrals/:id/enforceable-days', (req, res) => referralsController.viewEnforceableDays(req, res))
  post('/referrals/:id/enforceable-days', (req, res) => referralsController.updateEnforceableDays(req, res))
  get('/referrals/:id/check-answers', (req, res) => referralsController.checkAnswers(req, res))
  post('/referrals/:id/send', (req, res) => referralsController.sendDraftReferral(req, res))
  get('/referrals/:id/confirmation', (req, res) => referralsController.viewConfirmation(req, res))

  get('/find-interventions', (req, res) => findInterventionsController.search(req, res))
  get('/find-interventions/intervention/:id', (req, res) =>
    findInterventionsController.viewInterventionDetails(req, res)
  )

  get('/service-provider/referrals/:id/action-plan', (req, res) =>
    serviceProviderReferralsController.viewActionPlan(req, res)
  )

  get('/probation-practitioner/referrals/:id/action-plan', (req, res) =>
    probationPractitionerReferralsController.viewActionPlan(req, res)
  )
  post('/probation-practitioner/referrals/:id/action-plan/approve', (req, res) =>
    probationPractitionerReferralsController.approveActionPlan(req, res)
  )
  get('/probation-practitioner/referrals/:id/action-plan/approved', (req, res) =>
    probationPractitionerReferralsController.actionPlanApproved(req, res)
  )

  get('/service-provider/referrals/:id/action-plan/edit', (req, res) =>
    serviceProviderReferralsController.actionPlanEditConfirmation(req, res)
  )

  post('/service-provider/referrals/:id/action-plan/edit', (req, res) =>
    serviceProviderReferralsController.createNewDraftActionPlan(req, res)
  )

  return router
}
