import Wiremock from '../../mockApis/wiremock'
import AuthServiceMocks from '../../mockApis/auth'
import TokenVerificationMocks from '../../mockApis/tokenVerification'
import CommunityApiMocks from '../../mockApis/communityApi'
import InterventionsServiceMocks from '../../mockApis/interventionsService'

const wiremock = new Wiremock('http://localhost:9091/__admin')
const auth = new AuthServiceMocks(wiremock)
const tokenVerification = new TokenVerificationMocks(wiremock)
const communityApi = new CommunityApiMocks(wiremock)
const interventionsService = new InterventionsServiceMocks(wiremock, '/interventions')

module.exports = on => {
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

    stubGetUserByUsername: arg => {
      return communityApi.stubGetUserByUsername(arg.username, arg.responseJson)
    },

    stubGetActiveConvictionsByCRN: arg => {
      return communityApi.stubGetActiveConvictionsByCRN(arg.crn, arg.responseJson)
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

    stubGetServiceCategory: arg => {
      return interventionsService.stubGetServiceCategory(arg.id, arg.responseJson)
    },

    stubGetDraftReferralsForUser: arg => {
      return interventionsService.stubGetDraftReferralsForUser(arg.responseJson)
    },

    stubSendDraftReferral: arg => {
      return interventionsService.stubSendDraftReferral(arg.id, arg.responseJson)
    },

    stubGetSentReferral: arg => {
      return interventionsService.stubGetSentReferral(arg.id, arg.responseJson)
    },

    stubGetSentReferrals: arg => {
      return interventionsService.stubGetSentReferrals(arg.responseJson)
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

    stubCreateDraftActionPlan: arg => {
      return interventionsService.stubCreateDraftActionPlan(arg.responseJson)
    },

    stubUpdateDraftActionPlan: arg => {
      return interventionsService.stubUpdateDraftActionPlan(arg.id, arg.responseJson)
    },

    stubSubmitActionPlan: arg => {
      return interventionsService.stubSubmitActionPlan(arg.id, arg.responseJson)
    },

    stubRecordAppointmentAttendance: arg => {
      return interventionsService.stubRecordAppointmentAttendance(arg.actionPlanId, arg.sessionNumber, arg.responseJson)
    },

    stubRecordAppointmentBehaviour: arg => {
      return interventionsService.stubRecordAppointmentBehaviour(arg.actionPlanId, arg.sessionNumber, arg.responseJson)
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

    stubSubmitSessionFeedback: arg => {
      return interventionsService.stubSubmitSessionFeedback(arg.actionPlanId, arg.session, arg.responseJson)
    },
  })
}
