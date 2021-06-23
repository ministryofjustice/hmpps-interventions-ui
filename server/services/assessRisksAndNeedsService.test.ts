import createError from 'http-errors'
import AssessRisksAndNeedsService from './assessRisksAndNeedsService'

import RestClient from '../data/restClient'
import MockedHmppsAuthService from './testutils/hmppsAuthServiceSetup'
import HmppsAuthService from './hmppsAuthService'
import supplementaryRiskInformationFactory from '../../testutils/factories/supplementaryRiskInformation'
import MockRestClient from '../data/testutils/mockRestClient'
import riskSummaryFactory from '../../testutils/factories/riskSummary'

// wraps mocking API around the class exported by the module
jest.mock('../data/restClient')

describe(AssessRisksAndNeedsService, () => {
  describe('getSupplementaryRiskInformation', () => {
    const hmppsAuthServiceMock = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>

    const assessRisksAndNeedsService = new AssessRisksAndNeedsService(hmppsAuthServiceMock, restClientMock, true)

    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()

    it('makes a request to the Assess Risks and Needs API', async () => {
      hmppsAuthServiceMock.getApiClientToken.mockResolvedValue('testToken')
      restClientMock.get.mockResolvedValue(supplementaryRiskInformation)
      await assessRisksAndNeedsService.getSupplementaryRiskInformation('riskId')

      expect(restClientMock.get).toHaveBeenCalledWith({ path: `/risks/supplementary/riskId`, token: 'testToken' })
    })
  })

  describe('getRiskSummary', () => {
    const hmppsAuthServiceMock = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>

    const assessRisksAndNeedsService = new AssessRisksAndNeedsService(hmppsAuthServiceMock, restClientMock, true)

    const riskSummary = riskSummaryFactory.build()

    it('makes a request to the Assess Risks and Needs API', async () => {
      restClientMock.get.mockResolvedValue(riskSummary)
      await assessRisksAndNeedsService.getRiskSummary('crn123', 'token')

      expect(restClientMock.get).toHaveBeenCalledWith({ path: `/risks/crn/crn123`, token: 'token' })
    })

    it('provides a userMessage on failure', async () => {
      restClientMock.get.mockRejectedValue(createError(404))
      try {
        await assessRisksAndNeedsService.getRiskSummary('crn123', 'token')
      } catch (err) {
        expect(err.status).toBe(404)
        expect(err.userMessage).toBe('Could not get service user risk scores from OASys.')
      }
    })
  })

  describe('getRiskSummary when riskSummaryEnabled is false', () => {
    const hmppsAuthServiceMock = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>

    const assessRisksAndNeedsService = new AssessRisksAndNeedsService(hmppsAuthServiceMock, restClientMock, false)

    it('returns null and does not call Assess Risks and Needs API', async () => {
      const result = await assessRisksAndNeedsService.getRiskSummary('crn123', 'token')

      expect(restClientMock.get).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })
  })
})
