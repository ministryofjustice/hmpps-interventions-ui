import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService, { SentReferral, ServiceUser } from './interventionsService'
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
            createdAt: '2020-12-07T18:02:01.599803Z',
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

    describe('for a referral that has had a service provider selected', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state:
            'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service provider selected',
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
              serviceProviderId: '674b47a0-39bf-4514-82ae-61885b9c0cb4',
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the serviceProviderId field populated', async () => {
        const referral = await interventionsService.getDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962')

        expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
        expect(referral.serviceProviderId).toEqual('674b47a0-39bf-4514-82ae-61885b9c0cb4')
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
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
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
        const referral = await interventionsService.getDraftReferral(token, '037cc90b-beaa-4a32-9ab7-7f79136e1d27')

        expect(referral.id).toBe('037cc90b-beaa-4a32-9ab7-7f79136e1d27')
        expect(referral.desiredOutcomesIds).toEqual([
          '301ead30-30a4-4c7c-8296-2768abfb59b5',
          '65924ac6-9724-455b-ad30-906936291421',
        ])
      })
    })

    describe('for a referral that has had a service user selected', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state:
            'There is an existing draft referral with ID of 1219a064-709b-4b6c-a11e-10b8cb3966f6, and it has had a service user selected',
          uponReceiving: 'a request for that referral',
          withRequest: {
            method: 'GET',
            path: '/draft-referral/1219a064-709b-4b6c-a11e-10b8cb3966f6',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              id: '1219a064-709b-4b6c-a11e-10b8cb3966f6',
              serviceUser: {
                firstName: 'Alex',
              },
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the service category id field populated', async () => {
        const referral = await interventionsService.getDraftReferral(token, '1219a064-709b-4b6c-a11e-10b8cb3966f6')

        expect(referral.id).toBe('1219a064-709b-4b6c-a11e-10b8cb3966f6')
        expect(referral.serviceUser!.firstName).toEqual('Alex')
      })
    })
  })

  describe('createDraftReferral', () => {
    it('returns a newly created draft referral', async () => {
      await provider.addInteraction({
        // We're not sure what is an appropriate state here
        state: 'a draft referral can be created',
        uponReceiving: 'a POST request to create a draft referral',
        withRequest: {
          method: 'POST',
          path: '/draft-referral',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: { serviceUserCrn: 'X862134' },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            createdAt: '2020-12-07T20:45:21.986389Z',
            serviceUser: { crn: 'X862134' },
          }),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed'
            ),
          },
        },
      })

      const referral = await interventionsService.createDraftReferral(token, 'X862134')
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.serviceUser.crn).toBe('X862134')
    })
  })

  describe('patchDraftReferral', () => {
    it('throws a validation error when submitting invalid data', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update the completion deadline to a date in the past',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { completionDeadline: '2020-04-01' },
        },
        willRespondWith: {
          status: 400,
          body: {
            status: 400,
            message: Matchers.like('Validation error'),
            validationErrors: [
              {
                field: 'completionDeadline',
                error: 'DATE_MUST_BE_IN_THE_FUTURE',
              },
            ],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      await expect(
        interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
          completionDeadline: '2020-04-01',
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Bad Request',
        validationErrors: [
          {
            field: 'completionDeadline',
            error: 'DATE_MUST_BE_IN_THE_FUTURE',
          },
        ],
      })
    })

    it('returns the updated referral when setting the service user details', async () => {
      const serviceUser = {
        crn: 'X862134',
        title: 'Mr',
        firstName: 'Alex',
        lastName: 'River',
        dateOfBirth: '1980-01-01',
        gender: 'Male',
        ethnicity: 'British',
        preferredLanguage: 'English',
        religionOrBelief: 'Agnostic',
        disabilities: 'Autism spectrum condition, sciatica',
      } as ServiceUser

      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update service user',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceUser,
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            createdAt: '2020-12-07T20:45:21.986389Z',
            serviceUser,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        serviceUser,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.serviceUser).toEqual(serviceUser)
    })

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
            createdAt: '2020-12-07T20:45:21.986389Z',
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
            Authorization: `Bearer ${token}`,
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

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
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
            Authorization: `Bearer ${token}`,
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

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.desiredOutcomesIds).toEqual([
        '3415a6f2-38ef-4613-bb95-33355deff17e',
        '5352cfb6-c9ee-468c-b539-434a3e9b506e',
      ])
    })

    it('returns the updated referral when setting additionalNeedsInformation and accessibilityNeeds', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set additionalNeedsInformation and accessibilityNeeds',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            accessibilityNeeds: 'She uses a wheelchair',
            additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            accessibilityNeeds: 'She uses a wheelchair',
            additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        accessibilityNeeds: 'She uses a wheelchair',
        additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.accessibilityNeeds).toBe('She uses a wheelchair')
      expect(referral.additionalNeedsInformation).toBe('Alex is currently sleeping on her aunt’s sofa')
    })

    it('returns the updated referral when setting needsInterpreter to true', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set needsInterpreter to true',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { needsInterpreter: true, interpreterLanguage: 'Spanish' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            needsInterpreter: true,
            interpreterLanguage: 'Spanish',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        needsInterpreter: true,
        interpreterLanguage: 'Spanish',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.needsInterpreter).toBe(true)
      expect(referral.interpreterLanguage).toEqual('Spanish')
    })

    it('returns the updated referral when setting needsInterpreter to false', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set needsInterpreter to false',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { needsInterpreter: false, interpreterLanguage: null },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            needsInterpreter: false,
            interpreterLanguage: null,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        needsInterpreter: false,
        interpreterLanguage: null,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.needsInterpreter).toBe(false)
      expect(referral.interpreterLanguage).toBeNull()
    })

    it('returns the updated referral when setting hasAdditionalResponsibilities to true', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set hasAdditionalResponsibilities to true',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { hasAdditionalResponsibilities: true, whenUnavailable: 'She works Mondays 9am - midday' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            hasAdditionalResponsibilities: true,
            whenUnavailable: 'She works Mondays 9am - midday',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        hasAdditionalResponsibilities: true,
        whenUnavailable: 'She works Mondays 9am - midday',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.hasAdditionalResponsibilities).toBe(true)
      expect(referral.whenUnavailable).toEqual('She works Mondays 9am - midday')
    })

    it('returns the updated referral when setting hasAdditionalResponsibilities to false', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set hasAdditionalResponsibilities to false',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { hasAdditionalResponsibilities: false, whenUnavailable: null },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            hasAdditionalResponsibilities: false,
            whenUnavailable: null,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        hasAdditionalResponsibilities: false,
        whenUnavailable: null,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.hasAdditionalResponsibilities).toBe(false)
      expect(referral.whenUnavailable).toBeNull()
    })

    it('returns the updated referral when setting additionalRiskInformation', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update additionalRiskInformation',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { additionalRiskInformation: 'A danger to the elderly' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            additionalRiskInformation: 'A danger to the elderly',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        additionalRiskInformation: 'A danger to the elderly',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.additionalRiskInformation).toEqual('A danger to the elderly')
    })

    it('returns the updated referral when setting the service category ID', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to update the service category ID',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            createdAt: '2020-12-07T20:45:21.986389Z',
            serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.serviceCategoryId).toBe('428ee70f-3001-4399-95a6-ad25eaaede16')
    })

    it('returns the updated referral when setting usingRarDays to true', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set usingRarDays to true',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { usingRarDays: true, maximumRarDays: 10 },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            usingRarDays: true,
            maximumRarDays: 10,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        usingRarDays: true,
        maximumRarDays: 10,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.usingRarDays).toBe(true)
      expect(referral.maximumRarDays).toEqual(10)
    })

    it('returns the updated referral when setting usingRarDays to false', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set usingRarDays to false',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { usingRarDays: false, maximumRarDays: null },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            usingRarDays: false,
            maximumRarDays: null,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        usingRarDays: false,
        maximumRarDays: null,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.usingRarDays).toBe(false)
      expect(referral.maximumRarDays).toBeNull()
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

  describe('getDraftReferralsForUser', () => {
    it('returns a list of draft referrals for a given userID', async () => {
      await provider.addInteraction({
        state: 'a single referral for user with ID 8751622134 exists',
        uponReceiving: 'a GET request to return the referrals for that user ID',
        withRequest: {
          method: 'GET',
          path: '/draft-referrals',
          query: 'userID=8751622134',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: [
            {
              id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
              createdAt: '2020-12-07T20:45:21.986389Z',
              createdByUserId: '8751622134',
            },
          ],
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referrals = await interventionsService.getDraftReferralsForUser(token, '8751622134')
      expect(referrals.length).toBe(1)
      expect(referrals[0].id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
    })

    it('returns an empty list for an unknown user ID', async () => {
      await provider.addInteraction({
        state: 'a referral does not exist for user with ID 123344556',
        uponReceiving: 'a GET request to return the referrals for that user ID',
        withRequest: {
          method: 'GET',
          path: '/draft-referrals',
          query: 'userID=123344556',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: [],
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referrals = await interventionsService.getDraftReferralsForUser(token, '123344556')
      expect(referrals.length).toBe(0)
    })
  })

  describe('getServiceProvider', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a service provider with ID 674b47a0-39bf-4514-82ae-61885b9c0cb4 exists',
        uponReceiving: 'a GET request to fetch the service provider',
        withRequest: {
          method: 'GET',
          path: '/service-provider/674b47a0-39bf-4514-82ae-61885b9c0cb4',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: '674b47a0-39bf-4514-82ae-61885b9c0cb4',
            name: 'Harmony Living',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns a service provider', async () => {
      const serviceProvider = await interventionsService.getServiceProvider(
        token,
        '674b47a0-39bf-4514-82ae-61885b9c0cb4'
      )

      expect(serviceProvider.id).toEqual('674b47a0-39bf-4514-82ae-61885b9c0cb4')
      expect(serviceProvider.name).toEqual('Harmony Living')
    })
  })

  const serviceUser = {
    crn: 'X862134',
    title: 'Mr',
    firstName: 'Alex',
    lastName: 'River',
    dateOfBirth: '1980-01-01',
    gender: 'Male',
    ethnicity: 'British',
    preferredLanguage: 'English',
    religionOrBelief: 'Agnostic',
    disabilities: ['Autism spectrum condition', 'sciatica'],
  } as ServiceUser

  const sentReferral: SentReferral = {
    id: '81d754aa-d868-4347-9c0f-50690773014e',
    sentAt: '2021-01-14T15:56:45.382884Z',
    referenceNumber: 'HDJ2123F',
    referral: {
      createdAt: '2021-01-11T10:32:12.382884Z',
      completionDeadline: '2021-04-01',
      serviceProviderId: '674b47a0-39bf-4514-82ae-61885b9c0cb4',
      serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
      complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      furtherInformation: 'Some information about the service user',
      desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
      additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
      accessibilityNeeds: 'She uses a wheelchair',
      needsInterpreter: true,
      interpreterLanguage: 'Spanish',
      hasAdditionalResponsibilities: true,
      whenUnavailable: 'She works Mondays 9am - midday',
      serviceUser,
      additionalRiskInformation: 'A danger to the elderly',
      usingRarDays: true,
      maximumRarDays: 10,
    },
  }

  describe('sendDraftReferral', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists and is ready to be sent',
        uponReceiving: 'a POST request to send the draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed',
        withRequest: {
          method: 'POST',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed/send',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like(sentReferral),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/referral/81d754aa-d868-4347-9c0f-50690773014e'
            ),
          },
        },
      })
    })

    it('returns a sent referral', async () => {
      expect(await interventionsService.sendDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed')).toEqual(
        sentReferral
      )
    })
  })

  describe('getSentReferral', () => {
    it('returns a referral for the given ID', async () => {
      await provider.addInteraction({
        state: 'There is an existing sent referral with ID of 81d754aa-d868-4347-9c0f-50690773014e',
        uponReceiving: 'a request for the sent referral with ID of 81d754aa-d868-4347-9c0f-50690773014e',
        withRequest: {
          method: 'GET',
          path: '/sent-referral/81d754aa-d868-4347-9c0f-50690773014e',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(sentReferral),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getSentReferral(token, '81d754aa-d868-4347-9c0f-50690773014e')).toEqual(
        sentReferral
      )
    })
  })
})
