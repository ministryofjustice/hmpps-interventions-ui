import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService from './interventionsService'
import HmppsAuthClient from '../data/hmppsAuthClient'
import config from '../config'
import MockedHmppsAuthClient from '../data/testutils/hmppsAuthClientSetup'

jest.mock('../data/hmppsAuthClient')

pactWith({ consumer: 'Interventions UI', provider: 'Interventions Service' }, provider => {
  let interventionsService: InterventionsService

  beforeEach(() => {
    const testConfig = { ...config.apis.interventionsService, url: provider.mockService.baseUrl }
    const hmppsAuthClient = new MockedHmppsAuthClient() as jest.Mocked<HmppsAuthClient>
    hmppsAuthClient.getApiClientToken.mockResolvedValue('mockedToken')
    interventionsService = new InterventionsService(testConfig, hmppsAuthClient)
  })

  describe('getDraftReferral', () => {
    beforeEach(async () => {
      // This is just an example for getting Pact set up; we’ll properly design this endpoint later
      await provider.addInteraction({
        state: 'There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5',
        uponReceiving: 'a request for that referral',
        withRequest: {
          method: 'GET',
          path: '/draft-referral/ac386c25-52c8-41fa-9213-fcf42e24b0b5',
          headers: { Accept: 'application/json', Authorization: 'Bearer mockedToken' },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: 'ac386c25-52c8-41fa-9213-fcf42e24b0b5',
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      })
    })

    it('returns a referral for the given ID', async () => {
      const referral = await interventionsService.getDraftReferral('ac386c25-52c8-41fa-9213-fcf42e24b0b5')
      expect(referral.id).toBe('ac386c25-52c8-41fa-9213-fcf42e24b0b5')
    })
  })

  describe('createDraftReferral', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        // We're not sure what is an appropriate state here
        state: 'a draft referral can be created',
        uponReceiving: 'a POST request to create a draft referral',
        withRequest: {
          method: 'POST',
          path: '/draft-referral',
          headers: { Accept: 'application/json', Authorization: 'Bearer mockedToken' },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
          }),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed'
            ),
          },
        },
      })
    })

    it('returns a referral', async () => {
      const referral = await interventionsService.createDraftReferral()
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
    })
  })

  describe('patchDraftReferral', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update the completion deadline',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer mockedToken',
          },
          body: { completionDeadline: '2021-04-01' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            completionDeadline: '2021-04-01',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns the updated referral', async () => {
      const referral = await interventionsService.patchDraftReferral('dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        completionDeadline: '2021-04-01',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.completionDeadline).toBe('2021-04-01')
    })
  })
})
