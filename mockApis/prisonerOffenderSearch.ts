import Wiremock from './wiremock'

export default class PrisonerOffenderSearchMocks {
  constructor(private readonly wiremock: Wiremock, private readonly mockPrefix: string) {}

  stubGetPrisonerById = async (responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `${this.mockPrefix}/prisoner/([a-zA-Z0-9/-]*)`,
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
