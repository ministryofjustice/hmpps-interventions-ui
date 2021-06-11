import Wiremock from './wiremock'

export default class AssessRisksAndNeedsServiceMocks {
  constructor(private readonly wiremock: Wiremock) {}

  stubGetSupplementaryRiskInformation = async (riskId: string, responseJson: unknown): Promise<unknown> => {
    return this.wiremock.stubFor({
      request: {
        method: 'GET',
        urlPattern: `/assess-risks-and-needs/risks/supplementary/${riskId}`,
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
