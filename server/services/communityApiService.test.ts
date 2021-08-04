import createError from 'http-errors'
import CommunityApiService from './communityApiService'
import RestClient from '../data/restClient'
import MockRestClient from '../data/testutils/mockRestClient'
import HmppsAuthService from './hmppsAuthService'
import MockedHmppsAuthService from './testutils/hmppsAuthServiceSetup'
import deliusServiceUser from '../../testutils/factories/deliusServiceUser'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusConviction from '../../testutils/factories/deliusConviction'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import deliusStaffDetails from '../../testutils/factories/deliusStaffDetails'
import deliusOffenderManagerFactory from '../../testutils/factories/deliusOffenderManager'
import { DeliusOffenderManager } from '../models/delius/deliusOffenderManager'

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

  describe('getExpandedServiceUserByCRN', () => {
    it('makes a request to the Community API and casts the response as an Expanded Delius Service User', async () => {
      const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
      const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
      const serviceUser = expandedDeliusServiceUserFactory.build({ otherIds: { crn: 'X123456' } })

      restClientMock.get.mockResolvedValue(serviceUser)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getExpandedServiceUserByCRN('X123456')

      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/offenders/crn/X123456/all`,
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

  describe('getStaffDetails', () => {
    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
    const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)
    const staffDetails = deliusStaffDetails.build()
    it('makes a request to the Community API and casts the response as Delius Staff Details', async () => {
      restClientMock.get.mockResolvedValue(staffDetails)

      hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

      const result = await service.getStaffDetails('BERNARD.BEAKS')
      expect(restClientMock.get).toHaveBeenCalledWith({
        path: `/secure/staff/username/BERNARD.BEAKS`,
        token: 'token',
      })

      expect(result).toMatchObject(staffDetails)
    })
    describe('when user can not be found', () => {
      it('makes a request to Community API and returns null', async () => {
        restClientMock.get.mockRejectedValue(createError(404))
        const result = await service.getStaffDetails('UNKNOWN_USER')
        expect(result).toEqual(null)
      })
    })
    describe('when Community API has unexpected behaviour', () => {
      it('makes a request to Community API and returns a user message', async () => {
        restClientMock.get.mockRejectedValue(createError(500))
        try {
          await service.getStaffDetails('BERNARD.BEAKS')
        } catch (err) {
          expect(err.status).toBe(500)
          expect(err.userMessage).toBe('Could retrieve staff details from nDelius.')
        }
      })
    })
  })

  describe('getResponsibleOfficer', () => {
    const restClientMock = new MockRestClient() as jest.Mocked<RestClient>
    const service = new CommunityApiService(hmppsAuthClientMock, restClientMock)

    describe('when at least one Responsible Officer is assigned to the service user in Delius', () => {
      it('makes a request to the Community API, retrieves the Responsible Officers and casts them as a DeliusResponsibleOfficer', async () => {
        const deliusOffenderManagers = [
          deliusOffenderManagerFactory.responsibleOfficer().build({ staff: { forenames: 'Jerry' } }),
          deliusOffenderManagerFactory.responsibleOfficer().build({ staff: { forenames: 'Linda' } }),
          deliusOffenderManagerFactory.notResponsibleOfficer().build({ staff: { forenames: 'Roger' } }),
        ]

        restClientMock.get.mockResolvedValue(deliusOffenderManagers)

        hmppsAuthClientMock.getApiClientToken.mockResolvedValue('token')

        const responsibleOfficers = await service.getResponsibleOfficersForServiceUser('X123456')

        expect(restClientMock.get).toHaveBeenCalledWith({
          path: '/secure/offenders/crn/X123456/allOffenderManagers',
          token: 'token',
        })

        const names = responsibleOfficers!.map((officer: DeliusOffenderManager) => officer.staff!.forenames)

        expect(names).toEqual(['Jerry', 'Linda'])
        expect(names).not.toContainEqual('Roger')
      })
    })

    describe('when Community API throws an error', () => {
      it('makes a request to Community API and returns a user-facing error message', async () => {
        restClientMock.get.mockRejectedValue(createError(500))

        try {
          await service.getResponsibleOfficersForServiceUser('X123456')
        } catch (err) {
          expect(err.status).toBe(500)
          expect(err.userMessage).toBe('Could retrieve Responsible Officer from nDelius.')
        }
      })
    })
  })
})
