import { pactWith } from 'jest-pact'
import InterventionsService from './interventionsService'
import config from '../config'

pactWith({ consumer: 'Interventions UI', provider: 'Interventions Service' }, provider => {
  let interventionsService: InterventionsService

  beforeEach(() => {
    const testConfig = { ...config.apis.interventionsService, url: provider.mockService.baseUrl }
    interventionsService = new InterventionsService(testConfig)
  })

  describe('getReferral', () => {
    beforeEach(async () => {
      // This is just an example for getting Pact set up; we’ll properly design this endpoint later
      await provider.addInteraction({
        state: 'There is an existing referral with ID of 1',
        uponReceiving: 'a request for that referral',
        withRequest: {
          method: 'GET',
          path: '/referrals/1',
          headers: { Accept: 'application/json' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: '1',
            desiredOutcomes: [
              {
                id: '1',
                text: 'Desired outcome text 1',
              },
              {
                id: '2',
                text: 'Desired outcome text 2',
              },
            ],
          },
          headers: { 'Content-Type': 'application/json' },
        },
      })
    })

    it('returns a referral for the given ID', async () => {
      const referral = await interventionsService.getReferral('1')
      expect(referral.id).toBe('1')
      expect(referral.desiredOutcomes).toContainEqual({ id: '1', text: 'Desired outcome text 1' })
    })
  })
})
