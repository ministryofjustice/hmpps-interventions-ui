import Wiremock from '../../mockApis/wiremock'
import AuthServiceMocks from '../../mockApis/auth'
import TokenVerificationMocks from '../../mockApis/tokenVerification'
import CommunityApiMocks from '../../mockApis/communityApi'
import InterventionsServiceMocks from '../../mockApis/interventionsService'
import AssessRisksAndNeedsServiceMocks from '../../mockApis/assessRisksAndNeedsService'

const wiremock = new Wiremock('http://localhost:9091/__admin')
const auth = new AuthServiceMocks(wiremock)
const tokenVerification = new TokenVerificationMocks(wiremock)
const communityApi = new CommunityApiMocks(wiremock, '/community-api')
const interventionsService = new InterventionsServiceMocks(wiremock, '/interventions')
const assessRisksAndNeedsService = new AssessRisksAndNeedsServiceMocks(wiremock, '/assess-risks-and-needs')

export default on => {
  on('task', {
    reset: () => {
      return wiremock.resetStubs()
    },

    getLoginUrl: auth.getLoginUrl,
    stubLogin: auth.stubLogin,
    stubServiceProviderToken: auth.stubServiceProviderToken,
    stubProbationPractitionerToken: auth.stubProbationPractitionerToken,
    stubGetAuthUserByEmailAddress: arg => {
      return auth.stubGetSPUserByEmailAddress(arg.responseJson)
    },
    stubGetAuthUserByUsername: arg => {
      return auth.stubGetSPUserByUsername(arg.username, arg.responseJson)
    },

    stubServiceProviderAuthUser: auth.stubServiceProviderUser,
    stubProbationPractitionerAuthUser: auth.stubProbationPractitionerUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubGetServiceUserByCRN: arg => {
      return communityApi.stubGetServiceUserByCRN(arg.crn, arg.responseJson)
    },

    stubGetExpandedServiceUserByCRN: arg => {
      return communityApi.stubGetExpandedServiceUserByCRN(arg.crn, arg.responseJson)
    },

    stubGetUserByUsername: arg => {
      return communityApi.stubGetUserByUsername(arg.username, arg.responseJson)
    },

    stubGetActiveConvictionsByCRN: arg => {
      return communityApi.stubGetActiveConvictionsByCRN(arg.crn, arg.responseJson)
    },

    stubGetConvictionById: arg => {
      return communityApi.stubGetConvictionById(arg.crn, arg.id, arg.responseJson)
    },

    stubGetResponsibleOfficerForServiceUser: arg => {
      return communityApi.stubGetResponsibleOfficerForServiceUser(arg.crn, arg.responseJson)
    },

    stubGetDraftReferral: arg => {
      return interventionsService.stubGetDraftReferral(arg.id, arg.responseJson)
    },

    stubCreateDraftReferral: arg => {
      return interventionsService.stubCreateDraftReferral(arg.responseJson)
    },

    stubPatchDraftReferral: arg => {
      return interventionsService.stubPatchDraftReferral(arg.id, arg.responseJson)
    },

    stubSetDesiredOutcomesForServiceCategory: arg => {
      return interventionsService.stubSetDesiredOutcomesForServiceCategory(arg.referralId, arg.responseJson)
    },

    stubSetComplexityLevelForServiceCategory: arg => {
      return interventionsService.stubSetComplexityLevelForServiceCategory(arg.referralId, arg.responseJson)
    },

    stubGetServiceCategory: arg => {
      return interventionsService.stubGetServiceCategory(arg.id, arg.responseJson)
    },

    stubGetDraftReferralsForUserToken: arg => {
      return interventionsService.stubGetDraftReferralsForUserToken(arg.responseJson)
    },

    stubSendDraftReferral: arg => {
      return interventionsService.stubSendDraftReferral(arg.id, arg.responseJson)
    },

    stubGetSentReferral: arg => {
      return interventionsService.stubGetSentReferral(arg.id, arg.responseJson)
    },

    stubGetSentReferralsForUserToken: arg => {
      return interventionsService.stubGetSentReferralsForUserToken(arg.responseJson)
    },

    stubGetServiceProviderSentReferralsSummaryForUserToken: arg => {
      return interventionsService.stubGetServiceProviderSentReferralsSummaryForUserToken(arg.responseJson)
    },

    stubAssignSentReferral: arg => {
      return interventionsService.stubAssignSentReferral(arg.id, arg.responseJson)
    },

    stubGetInterventions: arg => {
      return interventionsService.stubGetInterventions(arg.responseJson)
    },

    stubGetIntervention: arg => {
      return interventionsService.stubGetIntervention(arg.id, arg.responseJson)
    },

    stubGetPccRegions: arg => {
      return interventionsService.stubGetPccRegions(arg.responseJson)
    },

    stubGetActionPlan: arg => {
      return interventionsService.stubGetActionPlan(arg.id, arg.responseJson)
    },

    stubApproveActionPlan: arg => {
      return interventionsService.stubApproveActionPlan(arg.id, arg.responseJson)
    },

    stubGetApprovedActionPlanSummaries: arg => {
      return interventionsService.stubGetApprovedActionPlanSummaries(arg.id, arg.responseJson)
    },

    stubCreateDraftActionPlan: arg => {
      return interventionsService.stubCreateDraftActionPlan(arg.responseJson)
    },

    stubUpdateDraftActionPlan: arg => {
      return interventionsService.stubUpdateDraftActionPlan(arg.id, arg.responseJson)
    },

    stubUpdateActionPlanActivity: arg => {
      return interventionsService.stubUpdateActionPlanActivity(arg.actionPlanId, arg.activityId, arg.responseJson)
    },

    stubSubmitActionPlan: arg => {
      return interventionsService.stubSubmitActionPlan(arg.id, arg.responseJson)
    },

    stubRecordActionPlanAppointmentAttendance: arg => {
      return interventionsService.stubRecordActionPlanAppointmentAttendance(
        arg.actionPlanId,
        arg.sessionNumber,
        arg.responseJson
      )
    },

    stubRecordActionPlanAppointmentBehavior: arg => {
      return interventionsService.stubRecordActionPlanAppointmentBehavior(
        arg.actionPlanId,
        arg.sessionNumber,
        arg.responseJson
      )
    },

    stubGetActionPlanAppointments: arg => {
      return interventionsService.stubGetActionPlanAppointments(arg.id, arg.responseJson)
    },

    stubGetActionPlanAppointment: arg => {
      return interventionsService.stubGetActionPlanAppointment(arg.id, arg.session, arg.responseJson)
    },

    stubUpdateActionPlanAppointment: arg => {
      return interventionsService.stubUpdateActionPlanAppointment(arg.id, arg.session, arg.responseJson)
    },

    stubUpdateActionPlanAppointmentClash: arg => {
      return interventionsService.stubUpdateActionPlanAppointmentClash(arg.actionPlanId, arg.sessionNumber)
    },

    stubSubmitActionPlanSessionFeedback: arg => {
      return interventionsService.stubSubmitActionPlanSessionFeedback(arg.actionPlanId, arg.session, arg.responseJson)
    },

    stubGetEndOfServiceReport: arg => {
      return interventionsService.stubGetEndOfServiceReport(arg.id, arg.responseJson)
    },

    stubCreateDraftEndOfServiceReport: arg => {
      return interventionsService.stubCreateDraftEndOfServiceReport(arg.responseJson)
    },

    stubUpdateDraftEndOfServiceReport: arg => {
      return interventionsService.stubUpdateDraftEndOfServiceReport(arg.id, arg.responseJson)
    },

    stubSubmitEndOfServiceReport: arg => {
      return interventionsService.stubSubmitEndOfServiceReport(arg.id, arg.responseJson)
    },

    stubEndReferral: arg => {
      return interventionsService.stubEndReferral(arg.referralId, arg.responseJson)
    },

    stubGetReferralCancellationReasons: arg => {
      return interventionsService.stubGetReferralCancellationReasons(arg.responseJson)
    },

    stubGetSupplementaryRiskInformation: arg => {
      return assessRisksAndNeedsService.stubGetSupplementaryRiskInformation(arg.riskId, arg.responseJson)
    },

    stubGetSupplementaryRiskInformationForCrn: arg => {
      return assessRisksAndNeedsService.stubGetSupplementaryRiskInformationForCrn(arg.crn, arg.responseJson)
    },

    stubGetRiskSummary: arg => {
      return assessRisksAndNeedsService.stubGetRiskSummary(arg.crn, arg.responseJson)
    },

    stubRecordSupplierAssessmentAppointmentAttendance: arg => {
      return interventionsService.stubRecordSupplierAssessmentAppointmentAttendance(arg.referralId, arg.responseJson)
    },

    stubRecordSupplierAssessmentAppointmentBehaviour: arg => {
      return interventionsService.stubRecordSupplierAssessmentAppointmentBehaviour(arg.referralId, arg.responseJson)
    },

    stubGetSupplierAssessment: arg => {
      return interventionsService.stubGetSupplierAssessment(arg.referralId, arg.responseJson)
    },

    stubScheduleSupplierAssessmentAppointment: arg => {
      return interventionsService.stubScheduleSupplierAssessmentAppointment(arg.supplierAssessmentId, arg.responseJson)
    },

    stubScheduleSupplierAssessmentAppointmentClash: arg => {
      return interventionsService.stubScheduleSupplierAssessmentAppointmentClash(arg.supplierAssessmentId)
    },

    stubSubmitSupplierAssessmentAppointmentFeedback: arg => {
      return interventionsService.stubSubmitSupplierAssessmentAppointmentFeedback(arg.referralId, arg.responseJson)
    },

    stubGenerateServiceProviderPerformanceReport: () => {
      return interventionsService.stubGenerateServiceProviderPerformanceReport()
    },

    stubGetCaseNotes: arg => {
      return interventionsService.stubGetCaseNotes(arg.referralId, arg.responseJson)
    },

    stubAddCaseNote: arg => {
      return interventionsService.stubAddCaseNote(arg.responseJson)
    },

    stubGetCaseNote: arg => {
      return interventionsService.stubGetCaseNote(arg.caseNoteId, arg.responseJson)
    },

    stubGetMyInterventions: arg => {
      return interventionsService.stubGetMyInterventions(arg.responseJson)
    },

    stubUpdateDraftOasysRiskInformation: arg => {
      return interventionsService.stubUpdateDraftOasysRiskInformation(arg.responseJson)
    },

    stubGetDraftOasysRiskInformation: arg => {
      return interventionsService.stubGetDraftOasysRiskInformation(arg.referralId, arg.responseJson)
    },
  })
}