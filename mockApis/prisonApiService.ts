import Wiremock from './wiremock'

export default class PrisonApiServiceMocks {
  constructor(
    private readonly wiremock: Wiremock,
    private readonly mockPrefix: string
  ) {}

  stubGetSecuredChildAgencies = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `${this.mockPrefix}/api/agencies/type/SCH`,
        queryParameters: {
          activeOnly: {
            equalTo: 'true',
          },
        },
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
