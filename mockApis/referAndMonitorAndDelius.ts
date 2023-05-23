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

  stubGetResponsibleOfficerForServiceUser = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/probation-case/([a-zA-Z0-9]*)/responsible-officer`,
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
