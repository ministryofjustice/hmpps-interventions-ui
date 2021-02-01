import Wiremock from './wiremock'

export default class TokenVerificationMocks {
  constructor(private readonly wiremock: Wiremock) {}

  stubPing = async (): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: '/verification/health/ping',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { status: 'UP' },
      },
    })
  }

  stubVerifyToken = async (): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: '/verification/token/verify',
      },
      response: {
        status: 200,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        jsonBody: { active: 'true' },
      },
    })
  }
}
