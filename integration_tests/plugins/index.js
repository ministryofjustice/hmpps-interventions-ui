const { stubFor, resetStubs } = require('../mockApis/wiremock')

const auth = require('../mockApis/auth')
const tokenVerification = require('../mockApis/tokenVerification')

module.exports = on => {
  on('task', {
    reset: resetStubs,

    getLoginUrl: auth.getLoginUrl,
    stubLogin: auth.stubLogin,
    stubServiceProviderToken: auth.stubServiceProviderToken,
    stubProbationPractitionerToken: auth.stubProbationPractitionerToken,

    stubServiceProviderAuthUser: auth.stubServiceProviderUser,
    stubProbationPractitionerAuthUser: auth.stubProbationPractitionerUser,
    stubAuthPing: auth.stubPing,

    stubTokenVerificationPing: tokenVerification.stubPing,

    stubFor,
  })
}
