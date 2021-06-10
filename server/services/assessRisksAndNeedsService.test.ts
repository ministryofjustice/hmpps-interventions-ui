import AssessRisksAndNeedsService from './assessRisksAndNeedsService'

import RestClient from '../data/restClient'
import MockedHmppsAuthService from './testutils/hmppsAuthServiceSetup'
import HmppsAuthService from './hmppsAuthService'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import MockRestClient from '../data/testutils/mockRestClient'

// wraps mocking API around the class exported by the module
jest.mock('../data/restClient')

describe(AssessRisksAndNeedsService, () => {
  describe('getSupplementaryRiskInformation', () => {
    const hmppsAuthServiceMock = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>

    const assessRisksAndNeedsService = new AssessRisksAndNeedsService(hmppsAuthServiceMock, restClientMock)

    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()

    it('makes a request to the Assess Risks and Needs API', async () => {
      hmppsAuthServiceMock.getApiClientToken.mockResolvedValue('testToken')
      restClientMock.get.mockResolvedValue(supplementaryRiskInformation)
      await assessRisksAndNeedsService.getSupplementaryRiskInformation('riskId')

      expect(restClientMock.get).toHaveBeenCalledWith({ path: `/risks/supplementary/riskId`, token: 'testToken' })
    })
  })
})
