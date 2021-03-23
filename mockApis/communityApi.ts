import Wiremock from './wiremock'

export default class CommunityApiMocks {
  constructor(private readonly wiremock: Wiremock) {}

  stubGetServiceUserByCRN = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/community-api/secure/offenders/crn/${crn}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetUserByUsername = async (username: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/community-api/secure/users/${username}/details`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }

  stubGetActiveConvictionsByCRN = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/community-api/secure/offenders/crn/${crn}/convictions`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: responseJson,
      },
    })
  }
}
