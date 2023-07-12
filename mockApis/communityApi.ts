import Wiremock from './wiremock'

export default class CommunityApiMocks {
  constructor(private readonly wiremock: Wiremock, private readonly mockPrefix: string) {}

  stubGetActiveConvictionsByCRN = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/secure/offenders/crn/${crn}/convictions`,
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

  stubGetConvictionById = async (crn: string, id: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/secure/offenders/crn/${crn}/convictions/${id}`,
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

  stubGetResponsibleOfficerForServiceUser = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/secure/offenders/crn/${crn}/allOffenderManagers`,
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
