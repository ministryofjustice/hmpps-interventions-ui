import Wiremock from './wiremock'

export default class PrisonRegisterServiceMocks {
  constructor(
    private readonly wiremock: Wiremock,
    private readonly mockPrefix: string
  ) {}

  stubGetPrisons = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `${this.mockPrefix}/prisons/names`,
        queryParameters: {
          active: {
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
