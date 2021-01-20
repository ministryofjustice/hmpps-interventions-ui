const jwt = require('jsonwebtoken')

const { stubFor, getRequests } = require('./wiremock')
const tokenVerification = require('./tokenVerification')

const createToken = authSource => {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: authSource,
    authorities: [],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'interventions',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getLoginUrl = () =>
  getRequests().then(data => {
    const { requests } = data.body
    const stateParam = requests[0].request.queryParams.state
    const stateValue = stateParam ? stateParam.values[0] : requests[1].request.queryParams.state.values[0]
    return `/login/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=interventions',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const logout = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/logout.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const token = authSource =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(authSource),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const stubUser = authSource =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        staffId: 231232,
        username: 'USER1',
        active: true,
        name: 'john smith',
        authSource,
      },
    },
  })

const stubUserRoles = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me/roles',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ roleId: 'SOME_USER_ROLE' }],
    },
  })

const stubAuthUserGroups = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/authuser/\\w+/groups',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ groupCode: 'INT_SP_EXAMPLE_1', groupName: 'Example Service Provider' }],
    },
  })

const stubToken = authSource => Promise.all([token(authSource), tokenVerification.stubVerifyToken()])

const stubUserAndRoles = authSource => Promise.all([stubUser(authSource), stubUserRoles()])

module.exports = {
  getLoginUrl,
  stubPing: () => Promise.all([ping(), tokenVerification.stubPing()]),
  stubLogin: () => Promise.all([favicon(), redirect(), logout()]),
  stubServiceProviderToken: () => stubToken('delius'),
  stubProbationPractitionerToken: () => stubToken('auth'),
  stubServiceProviderUser: () => Promise.all([stubUserAndRoles('auth'), stubAuthUserGroups()]),
  stubProbationPractitionerUser: () => stubUserAndRoles('delius'),
}
