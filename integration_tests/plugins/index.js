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

    stubGetInterventions: arg => {
      return interventionsService.stubGetInterventions(arg.responseJson)
    },

    stubGetIntervention: arg => {
      return interventionsService.stubGetIntervention(arg.id, arg.responseJson)
    },

    stubGetPccRegions: arg => {
      return interventionsService.stubGetPccRegions(arg.id, arg.responseJson)
    },
  })
}
