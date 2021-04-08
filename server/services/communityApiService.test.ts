import CommunityApiService from './communityApiService'
import RestClient from '../data/restClient'
import MockRestClient from '../data/testutils/mockRestClient'
import HmppsAuthService from './hmppsAuthService'
import MockedHmppsAuthService from './testutils/hmppsAuthServiceSetup'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusConviction from '../../testutils/factories/deliusConviction'

jest.mock('../data/restClient')

describe(CommunityApiService, () => {
  const hmppsAuthClientMock = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

  describe('getUserByUsername', () => {
    it('makes a request to the communityAPI and casts the response as an Delius User', async () => {
      const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
      const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
      const deliusUser = deliusUserFactory.build({ username: 'p.practitioner' })

      restClientMock.get.mockResolvedValue(deliusUser)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getUserByUsername('p.practitioner')

      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/users/p.practitioner/details`,
        token: 'token',
      })
      expect(result).toMatchObject(deliusUser)
    })
  })

  describe('getServiceUserByCRN', () => {
    it('makes a request to the Community API and casts the response as a Delius Service User', async () => {
      const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
      const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
      const serviceUser = deliusServiceUser.build({ otherIds: { crn: 'X123456' } })

      restClientMock.get.mockResolvedValue(serviceUser)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getServiceUserByCRN('X123456')

      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/offenders/crn/X123456`,
        token: 'token',
      })
      expect(result).toMatchObject(serviceUser)
    })
  })

  describe('getActiveConvictionsByCRN', () => {
    it('makes a request to the Community API and casts the response as an array of Delius Convictions', async () => {
      const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
      const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
      const convictions = deliusConviction.buildList(2)

      restClientMock.get.mockResolvedValue(convictions)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getActiveConvictionsByCRN('X123456')
      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/offenders/crn/X123456/convictions`,
        token: 'token',
      })

      expect(result).toMatchObject(convictions)
    })
  })

  describe('getConvictionById', () => {
    it('makes a request to the Community API and casts the response as single Delius Conviction', async () => {
      const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
      const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
      const conviction = deliusConviction.build({ convictionId: 1 })

      restClientMock.get.mockResolvedValue(conviction)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getConvictionById('X123456', 1)
      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/offenders/crn/X123456/convictions/1`,
        token: 'token',
      })

      expect(result).toMatchObject(conviction)
    })
  })
})
