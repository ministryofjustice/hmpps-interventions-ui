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
        urlPattern: `${this.mockPrefix}/prisons/names?active=true`,
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
