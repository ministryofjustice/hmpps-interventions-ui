import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService from './interventionsService'
import config from '../config'

jest.mock('../data/hmppsAuthClient')

pactWith({ consumer: 'Interventions UI', provider: 'Interventions Service' }, provider => {
  let interventionsService: InterventionsService

  beforeEach(() => {
    const testConfig = { ...config.apis.interventionsService, url: provider.mockService.baseUrl }
    interventionsService = new InterventionsService(testConfig)
  })

  describe('getDraftReferral', () => {
    it('returns a referral for the given ID', async () => {
      await provider.addInteraction({
        state: 'There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5',
        uponReceiving: 'a request for that referral',
        withRequest: {
          method: 'GET',
          path: '/draft-referral/ac386c25-52c8-41fa-9213-fcf42e24b0b5',
          headers: { Accept: 'application/json', Authorization: 'Bearer token' },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: 'ac386c25-52c8-41fa-9213-fcf42e24b0b5',
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      const referral = await interventionsService.getDraftReferral('token', 'ac386c25-52c8-41fa-9213-fcf42e24b0b5')
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
            headers: { Accept: 'application/json', Authorization: 'Bearer token' },
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
        const referral = await interventionsService.getDraftReferral('token', 'd496e4a7-7cc1-44ea-ba67-c295084f1962')

        expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
        expect(referral.serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
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
          headers: { Accept: 'application/json', Authorization: 'Bearer token' },
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
      const referral = await interventionsService.createDraftReferral('token')
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
            Authorization: 'Bearer token',
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

      const referral = await interventionsService.patchDraftReferral('token', 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
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
            Authorization: 'Bearer token',
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

      const referral = await interventionsService.patchDraftReferral('token', 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.complexityLevelId).toBe('d0db50b0-4a50-4fc7-a006-9c97530e38b2')
    })
  })

  describe('getServiceCategory', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a service category with ID 428ee70f-3001-4399-95a6-ad25eaaede16 exists',
        uponReceiving: 'a GET request to fetch the service category',
        withRequest: {
          method: 'GET',
          path: '/service-category/428ee70f-3001-4399-95a6-ad25eaaede16',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer token',
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: '428ee70f-3001-4399-95a6-ad25eaaede16',
            name: 'accommodation',
            complexityLevels: [
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
            ],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns a service category', async () => {
      const serviceCategory = await interventionsService.getServiceCategory(
        'token',
        '428ee70f-3001-4399-95a6-ad25eaaede16'
      )

      expect(serviceCategory.id).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
      expect(serviceCategory.name).toEqual('accommodation')
      expect(serviceCategory.complexityLevels).toEqual([
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
      ])
    })
  })
})
