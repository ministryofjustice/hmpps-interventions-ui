import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService from './interventionsService'
import config from '../config'
import oauth2TokenFactory from '../../testutils/factories/oauth2Token'

jest.mock('../data/hmppsAuthClient')

pactWith({ consumer: 'Interventions UI', provider: 'Interventions Service' }, provider => {
  let interventionsService: InterventionsService
  let token: string

  beforeEach(() => {
    const testConfig = { ...config.apis.interventionsService, url: provider.mockService.baseUrl }
    interventionsService = new InterventionsService(testConfig)
    token = oauth2TokenFactory.deliusToken().build()
  })

  describe('getDraftReferral', () => {
    it('returns a referral for the given ID', async () => {
      await provider.addInteraction({
        state: 'There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5',
        uponReceiving: 'a request for that referral',
        withRequest: {
          method: 'GET',
          path: '/draft-referral/ac386c25-52c8-41fa-9213-fcf42e24b0b5',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: 'ac386c25-52c8-41fa-9213-fcf42e24b0b5',
            created: '2020-12-07T18:02:01Z',
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      const referral = await interventionsService.getDraftReferral(token, 'ac386c25-52c8-41fa-9213-fcf42e24b0b5')
      expect(referral.id).toBe('ac386c25-52c8-41fa-9213-fcf42e24b0b5')
    })

    describe('for a referral that has had a service category selected', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state:
            'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected',
          uponReceiving: 'a request for that referral',
          withRequest: {
            method: 'GET',
            path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
              serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
              complexityLevelId: null,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the service category id field populated', async () => {
        const referral = await interventionsService.getDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962')

        expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
        expect(referral.serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
      })
    })

    describe('for a referral that has had desired outcomes selected', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state:
            'There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had desired outcomes selected',
          uponReceiving: 'a request for that referral',
          withRequest: {
            method: 'GET',
            path: '/draft-referral/037cc90b-beaa-4a32-9ab7-7f79136e1d27',
            headers: { Accept: 'application/json', Authorization: 'Bearer token' },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              id: '037cc90b-beaa-4a32-9ab7-7f79136e1d27',
              serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
              desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
              complexityLevelId: null,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the desired outcomes selected', async () => {
        const referral = await interventionsService.getDraftReferral('token', '037cc90b-beaa-4a32-9ab7-7f79136e1d27')

        expect(referral.id).toBe('037cc90b-beaa-4a32-9ab7-7f79136e1d27')
        expect(referral.desiredOutcomesIds).toEqual([
          '301ead30-30a4-4c7c-8296-2768abfb59b5',
          '65924ac6-9724-455b-ad30-906936291421',
        ])
      })
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
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            created: '2020-12-07T20:45:21Z',
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
      const referral = await interventionsService.createDraftReferral(token)
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
    })
  })

  describe('patchDraftReferral', () => {
    it('returns the updated referral when setting the completion date', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update the completion deadline',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { completionDeadline: '2021-04-01' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            created: '2020-12-07T20:45:21Z',
            completionDeadline: '2021-04-01',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        completionDeadline: '2021-04-01',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.completionDeadline).toBe('2021-04-01')
    })

    it('returns the updated referral when selecting the complexity level', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update the complexity level ID',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.complexityLevelId).toBe('d0db50b0-4a50-4fc7-a006-9c97530e38b2')
    })

    it('returns the updated referral adding further information', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update further information',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: { furtherInformation: 'Some information about the service user' },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            furtherInformation: 'Some information about the service user',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral('token', 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        furtherInformation: 'Some information about the service user',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.furtherInformation).toBe('Some information about the service user')
    })

    it('returns the updated referral when selecting desired outcomes', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update desired outcomes IDs',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer token',
          },
          body: {
            desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral('token', 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.desiredOutcomesIds).toEqual([
        '3415a6f2-38ef-4613-bb95-33355deff17e',
        '5352cfb6-c9ee-468c-b539-434a3e9b506e',
      ])
    })
  })

  describe('getServiceCategory', () => {
    const complexityLevels = [
      {
        id: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        title: 'Low complexity',
        description:
          'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
      },
      {
        id: '110f2405-d944-4c15-836c-0c6684e2aa78',
        title: 'Medium complexity',
        description:
          'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.',
      },
      {
        id: 'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
        title: 'High complexity',
        description:
          'Service User is homeless or in temporary/unstable accommodation, or will be on release from prison. Service User has poor accommodation history, complex needs and limited skills to secure or sustain a tenancy.',
      },
    ]
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service User makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service User is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
      },
      {
        id: '19d5ef58-5cfc-41fe-894c-acd705dc1325',
        description: 'Service User is helped to sustain existing accommodation',
      },
      {
        id: 'f6f70273-16a2-4dc7-aafc-9bc74215e713',
        description: 'Service User is prevented from becoming homeless',
      },
      {
        id: '449a93d7-e705-4340-9936-c859644abd52',
        description:
          'Settled accommodation is sustained for a period of at least 6 months or until the end of sentence, whichever occurs first (including for those serving custodial sentences of less than 6 months)',
      },
      {
        id: '55a9cf76-428d-4409-8a57-aaa523f3b631',
        description: 'Service User at risk of losing their tenancy are successfully helped to retain it',
      },
    ]

    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a service category with ID 428ee70f-3001-4399-95a6-ad25eaaede16 exists',
        uponReceiving: 'a GET request to fetch the service category',
        withRequest: {
          method: 'GET',
          path: '/service-category/428ee70f-3001-4399-95a6-ad25eaaede16',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: '428ee70f-3001-4399-95a6-ad25eaaede16',
            name: 'accommodation',
            complexityLevels,
            desiredOutcomes,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns a service category', async () => {
      const serviceCategory = await interventionsService.getServiceCategory(
        token,
        '428ee70f-3001-4399-95a6-ad25eaaede16'
      )

      expect(serviceCategory.id).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
      expect(serviceCategory.name).toEqual('accommodation')
      expect(serviceCategory.complexityLevels).toEqual(complexityLevels)
      expect(serviceCategory.desiredOutcomes).toEqual(desiredOutcomes)
    })
  })
})
