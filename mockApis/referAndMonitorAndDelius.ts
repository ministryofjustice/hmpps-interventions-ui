import Wiremock from './wiremock'

export default class ReferAndMonitorAndDeliusMocks {
  constructor(private readonly wiremock: Wiremock, private readonly mockPrefix: string) {}

  stubSentReferral = async (): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'PUT',
        urlPattern: `${this.mockPrefix}/probation-case/([a-zA-Z0-9]*)/referrals`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        jsonBody: {},
      },
    })
  }

  stubGetResponsibleOfficer = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/probation-case/${crn}/responsible-officer`,
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

  stubGetCrnUserAccess = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'POST',
        urlPattern: `${this.mockPrefix}/users/.*/access`,
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
        urlPattern: `${this.mockPrefix}/users/${username}/details`,
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

  stubGetCaseDetailsByCrn = async (crn: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/probation-case/${crn}/details`,
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
