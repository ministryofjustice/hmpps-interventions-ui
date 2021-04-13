import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService, { SentReferral, ServiceUser } from './interventionsService'
import config from '../config'
import oauth2TokenFactory from '../../testutils/factories/oauth2Token'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import serviceProviderFactory from '../../testutils/factories/serviceProvider'
import eligibilityFactory from '../../testutils/factories/eligibility'
import interventionFactory from '../../testutils/factories/intervention'
import { DeliusServiceUser } from './communityApiService'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'

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
              serviceProvider: {
                name: 'Harmony Living',
              },
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the serviceProviderId field populated', async () => {
        const referral = await interventionsService.getDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962')

        expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
        expect(referral.serviceProvider!.name).toEqual('Harmony Living')
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
                crn: 'X862134',
                title: 'Mr',
                firstName: 'Alex',
                lastName: 'River',
                dateOfBirth: '1980-01-01',
                gender: 'Male',
                preferredLanguage: 'English',
                ethnicity: 'British',
                religionOrBelief: 'Agnostic',
                disabilities: ['Autism spectrum condition'],
              },
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the service user details', async () => {
        const referral = await interventionsService.getDraftReferral(token, '1219a064-709b-4b6c-a11e-10b8cb3966f6')

        expect(referral.id).toBe('1219a064-709b-4b6c-a11e-10b8cb3966f6')
        expect(referral.serviceUser.crn).toEqual('X862134')
        expect(referral.serviceUser.title).toEqual('Mr')
        expect(referral.serviceUser.firstName).toEqual('Alex')
        expect(referral.serviceUser.lastName).toEqual('River')
        expect(referral.serviceUser.dateOfBirth).toEqual('1980-01-01')
        expect(referral.serviceUser.gender).toEqual('Male')
        expect(referral.serviceUser.ethnicity).toEqual('British')
        expect(referral.serviceUser.preferredLanguage).toEqual('English')
        expect(referral.serviceUser.religionOrBelief).toEqual('Agnostic')
        expect(referral.serviceUser.disabilities).toEqual(['Autism spectrum condition'])
      })
    })
  })

  describe('createDraftReferral', () => {
    it('returns a newly created draft referral', async () => {
      const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
      const serviceUserCrn = 'X862134'

      await provider.addInteraction({
        state: 'an intervention has been selected and a draft referral can be created',
        uponReceiving: 'a POST request to create a draft referral',
        withRequest: {
          method: 'POST',
          path: '/draft-referral',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            serviceUserCrn,
            interventionId,
          },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            createdAt: '2020-12-07T20:45:21.986389Z',
            serviceUser: { crn: serviceUserCrn },
          }),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed'
            ),
          },
        },
      })

      const referral = await interventionsService.createDraftReferral(token, serviceUserCrn, interventionId)
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.serviceUser.crn).toBe(serviceUserCrn)
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
        disabilities: ['Autism spectrum condition', 'sciatica'],
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
          body: { completionDeadline: '2045-04-01' },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            createdAt: '2020-12-07T20:45:21.986389Z',
            completionDeadline: '2045-04-01',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        completionDeadline: '2045-04-01',
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.completionDeadline).toBe('2045-04-01')
    })

    it('returns the updated referral when selecting the complexity level', async () => {
      await provider.addInteraction({
        state:
          'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected',
        uponReceiving: 'a PATCH request to update the complexity level ID',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962',
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
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962', {
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
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

    it('returns the updated referral when selecting the relevant sentence', async () => {
      await provider.addInteraction({
        state: 'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962',
        uponReceiving: 'a PATCH request to update the sentence ID',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            relevantSentenceId: 2600295124,
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            relevantSentenceId: 2600295124,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962', {
        relevantSentenceId: 2600295124,
      })
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
      expect(referral.relevantSentenceId).toEqual(2600295124)
    })

    it('returns the updated referral when selecting desired outcomes', async () => {
      await provider.addInteraction({
        state:
          'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected',
        uponReceiving: 'a PATCH request to update desired outcomes IDs',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962', {
        desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
      })
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
      expect(referral.desiredOutcomesIds).toEqual([
        '301ead30-30a4-4c7c-8296-2768abfb59b5',
        '65924ac6-9724-455b-ad30-906936291421',
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
            name: 'Accommodation',
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
      expect(serviceCategory.name).toEqual('Accommodation')
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
    sentBy: {
      username: 'BERNARD.BEAKS',
      userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
      authSource: 'delius',
    },
    assignedTo: null,
    actionPlanId: null,
    referenceNumber: 'HDJ2123F',
    referral: {
      createdAt: '2021-01-11T10:32:12.382884Z',
      completionDeadline: '2021-04-01',
      serviceProvider: {
        name: 'Harmony Living',
      },
      serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
      complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      furtherInformation: 'Some information about the service user',
      relevantSentenceId: 2600295124,
      desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
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
        state: 'a draft referral with ID 2a67075a-9c77-4103-9de0-63c4cfe3e8d6 exists and is ready to be sent',
        uponReceiving: 'a POST request to send the draft referral with ID 2a67075a-9c77-4103-9de0-63c4cfe3e8d6',
        withRequest: {
          method: 'POST',
          path: '/draft-referral/2a67075a-9c77-4103-9de0-63c4cfe3e8d6/send',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like(sentReferral),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/sent-referral/2a67075a-9c77-4103-9de0-63c4cfe3e8d6'
            ),
          },
        },
      })
    })

    it('returns a sent referral', async () => {
      expect(await interventionsService.sendDraftReferral(token, '2a67075a-9c77-4103-9de0-63c4cfe3e8d6')).toEqual(
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

    describe('for a referral that has had a caseworker assigned', () => {
      it('populates the assignedTo property', async () => {
        await provider.addInteraction({
          state:
            'There is an existing sent referral with ID of 2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e, and it has a caseworker assigned',
          uponReceiving: 'a request for the sent referral with ID of 2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e',
          withRequest: {
            method: 'GET',
            path: '/sent-referral/2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              assignedTo: { username: 'UserABC', userId: '555224b3-865c-4b56-97dd-c3e817592ba3', authSource: 'auth' },
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getSentReferral(token, '2f4e91bf-5f73-4ca8-ad84-afee3f12ed8e')).toMatchObject(
          {
            assignedTo: { username: 'UserABC', userId: '555224b3-865c-4b56-97dd-c3e817592ba3', authSource: 'auth' },
          }
        )
      })
    })

    describe('for a referral that has an action plan', () => {
      it('populates the actionPlanId property', async () => {
        await provider.addInteraction({
          state:
            'There is an existing sent referral with ID of 8b423e17-9b60-4cc2-a927-8941ac76fdf9, and it has an action plan',
          uponReceiving: 'a request for the sent referral with ID of 8b423e17-9b60-4cc2-a927-8941ac76fdf9',
          withRequest: {
            method: 'GET',
            path: '/sent-referral/8b423e17-9b60-4cc2-a927-8941ac76fdf9',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              actionPlanId: '8b423e17-9b60-4cc2-a927-8941ac76fdf9',
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getSentReferral(token, '8b423e17-9b60-4cc2-a927-8941ac76fdf9')).toMatchObject(
          {
            actionPlanId: '8b423e17-9b60-4cc2-a927-8941ac76fdf9',
          }
        )
      })
    })
  })

  describe('getSentReferrals', () => {
    it('returns a list of all sent referrals', async () => {
      await provider.addInteraction({
        state: 'There are some existing sent referrals',
        uponReceiving: 'a request for all sent referrals',
        withRequest: {
          method: 'GET',
          path: '/sent-referrals',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like([sentReferral, sentReferral]),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getSentReferrals(token)).toEqual([sentReferral, sentReferral])
    })
  })

  describe('assignSentReferral', () => {
    it('returns the sent referral, with the assignedTo property populated', async () => {
      await provider.addInteraction({
        state: 'There is an existing sent referral with ID of 400be4c6-1aa4-4f52-ae86-cbd5d23309bf',
        uponReceiving:
          'a request to assign the sent referral with ID of 400be4c6-1aa4-4f52-ae86-cbd5d23309bf to a caseworker',
        withRequest: {
          method: 'POST',
          path: '/sent-referral/400be4c6-1aa4-4f52-ae86-cbd5d23309bf/assign',
          body: {
            assignedTo: { username: 'UserABC', userId: '555224b3-865c-4b56-97dd-c3e817592ba3', authSource: 'auth' },
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            assignedTo: { username: 'UserABC', userId: '555224b3-865c-4b56-97dd-c3e817592ba3', authSource: 'auth' },
          }),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(
        await interventionsService.assignSentReferral(token, '400be4c6-1aa4-4f52-ae86-cbd5d23309bf', {
          username: 'UserABC',
          userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
          authSource: 'auth',
        })
      ).toMatchObject({
        assignedTo: { username: 'UserABC', userId: '555224b3-865c-4b56-97dd-c3e817592ba3', authSource: 'auth' },
      })
    })
  })

  describe('getInterventions', () => {
    it('returns a list of all interventions', async () => {
      const intervention = {
        id: '15237ae5-a017-4de6-a033-abf350f14d99',
        title: 'Better solutions (anger management)',
        description:
          'To provide service users with key tools and strategies to address issues of anger management and temper control and explore the link between thoughts, emotions and behaviour. It provides the opportunity for service users to practice these strategies in a safe and closed environment.',
        pccRegions: [
          { id: 'cheshire', name: 'Cheshire' },
          { id: 'cumbria', name: 'Cumbria' },
          { id: 'lancashire', name: 'Lancashire' },
          { id: 'merseyside', name: 'Merseyside' },
        ],
        serviceCategory: serviceCategoryFactory.build(),
        serviceProvider: serviceProviderFactory.build(),
        eligibility: eligibilityFactory.allAdults().build(),
      }

      await provider.addInteraction({
        state: 'There are some interventions',
        uponReceiving: 'a request for all interventions',
        withRequest: {
          method: 'GET',
          path: '/interventions',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like([intervention, intervention]),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getInterventions(token, {})).toEqual([intervention, intervention])
    })

    describe('allowsMale filter', () => {
      it.each([[true], [false]])('accepts a value of %s', async value => {
        const interventions = interventionFactory.buildList(2)

        await provider.addInteraction({
          state: 'There are some interventions',
          uponReceiving: `a request to get all interventions, filtered by allowsMale == ${value}`,
          withRequest: {
            method: 'GET',
            path: '/interventions',
            query: { allowsMale: value ? 'true' : 'false' },
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like(interventions),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getInterventions(token, { allowsMale: value })).toEqual(interventions)
      })
    })

    describe('allowsFemale filter', () => {
      it.each([[true], [false]])('accepts a value of %s', async value => {
        const interventions = interventionFactory.buildList(2)

        await provider.addInteraction({
          state: 'There are some interventions',
          uponReceiving: `a request to get all interventions, filtered by allowsFemale == ${value}`,
          withRequest: {
            method: 'GET',
            path: '/interventions',
            query: { allowsFemale: value ? 'true' : 'false' },
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like(interventions),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getInterventions(token, { allowsFemale: value })).toEqual(interventions)
      })
    })

    describe('pccRegionIds filter', () => {
      it('accepts a list of PCC region IDs', async () => {
        const intervention = interventionFactory.build()

        await provider.addInteraction({
          state: 'There are some interventions',
          uponReceiving: `a request to get all interventions, filtered by a non-empty list of pccRegions`,
          withRequest: {
            method: 'GET',
            path: '/interventions',
            query: { pccRegionIds: 'cheshire,cumbria,merseyside' },
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like([intervention, intervention]),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(
          await interventionsService.getInterventions(token, { pccRegionIds: ['cheshire', 'cumbria', 'merseyside'] })
        ).toEqual([intervention, intervention])
      })
    })

    describe('maximumAge filter', () => {
      it('accepts a positive integer', async () => {
        const interventions = interventionFactory.buildList(2)

        await provider.addInteraction({
          state: 'There are some interventions',
          uponReceiving: `a request to get all interventions, filtered by maximumAge`,
          withRequest: {
            method: 'GET',
            path: '/interventions',
            query: { maximumAge: '25' },
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like(interventions),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getInterventions(token, { maximumAge: 25 })).toEqual(interventions)
      })
    })
  })

  describe('getIntervention', () => {
    it('returns a single intervention', async () => {
      const interventionId = '15237ae5-a017-4de6-a033-abf350f14d99'
      const intervention = interventionFactory.build({ id: interventionId })

      await provider.addInteraction({
        state: 'There is an existing intervention with ID 15237ae5-a017-4de6-a033-abf350f14d99',
        uponReceiving: 'a request for that intervention',
        withRequest: {
          method: 'GET',
          path: `/intervention/${interventionId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(intervention),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getIntervention(token, interventionId)).toEqual(intervention)
    })
  })

  describe('getPccRegions', () => {
    it('returns a list of PCC regions', async () => {
      const pccRegions = [
        { id: 'cheshire', name: 'Cheshire' },
        { id: 'cumbria', name: 'Cumbria' },
        { id: 'lancashire', name: 'Lancashire' },
        { id: 'merseyside', name: 'Merseyside' },
      ]

      await provider.addInteraction({
        state: 'There are some PCC regions',
        uponReceiving: 'a request for all the PCC regions',
        withRequest: {
          method: 'GET',
          path: `/pcc-regions`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(pccRegions),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getPccRegions(token)).toEqual(pccRegions)
    })
  })

  describe('createDraftActionPlan', () => {
    it('returns a newly created draft action plan', async () => {
      const referralId = '81d754aa-d868-4347-9c0f-50690773014e'
      await provider.addInteraction({
        state: 'a caseworker has been assigned to a sent referral and an action plan can be created',
        uponReceiving: 'a POST request to create a draft action plan',
        withRequest: {
          method: 'POST',
          path: '/draft-action-plan',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            referralId,
          },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            referralId: '81d754aa-d868-4347-9c0f-50690773014e',
            numberOfSessions: null,
            activities: [],
          }),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/draft-action-plan/dfb64747-f658-40e0-a827-87b4b0bdcfed'
            ),
          },
        },
      })

      const draftActionPlan = await interventionsService.createDraftActionPlan(token, referralId)
      expect(draftActionPlan.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(draftActionPlan.referralId).toBe('81d754aa-d868-4347-9c0f-50690773014e')
    })
  })

  describe('getActionPlan', () => {
    it('returns an existing draft action plan', async () => {
      const actionPlanId = 'dfb64747-f658-40e0-a827-87b4b0bdcfed'
      const referralId = '1BE9F8E5-535F-4836-9B00-4D64C96784FD'

      await provider.addInteraction({
        state: `an action plan exists with ID ${actionPlanId}, and it has not been submitted`,
        uponReceiving: `a GET request to view the action plan with ID ${actionPlanId}`,
        withRequest: {
          method: 'GET',
          path: `/action-plan/${actionPlanId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: actionPlanId,
            referralId,
            activities: [],
            numberOfSessions: null,
            submittedAt: null,
            submittedBy: null,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const actionPlan = await interventionsService.getActionPlan(token, actionPlanId)
      expect(actionPlan).toMatchObject({
        id: actionPlanId,
        referralId,
        activities: [],
        numberOfSessions: null,
        submittedAt: null,
        submittedBy: null,
      })
    })

    it('returns an existing submitted action plan', async () => {
      const actionPlanId = '7a165933-d851-48c1-9ab0-ff5b8da12695'
      const referralId = '1BE9F8E5-535F-4836-9B00-4D64C96784FD'
      const user = {
        authSource: 'auth',
        userId: 'BB9C99F7-13EA-43D0-960A-768DC8FA0D91',
        username: 'SP_USER_1',
      }
      const activities = [
        {
          id: '91e7ceab-74fd-45d8-97c8-ec58844618dd',
          description: 'Attend training course',
          desiredOutcome: {
            id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
            description:
              'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
          },
          createdAt: '2020-12-07T20:45:21.986389Z',
        },
      ]

      await provider.addInteraction({
        state: `an action plan exists with ID ${actionPlanId}, and it has been submitted`,
        uponReceiving: `a GET request to view the action plan with ID ${actionPlanId}`,
        withRequest: {
          method: 'GET',
          path: `/action-plan/${actionPlanId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: actionPlanId,
            referralId,
            activities,
            submittedAt: '2021-03-09T15:08:38Z',
            submittedBy: user,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const actionPlan = await interventionsService.getActionPlan(token, actionPlanId)
      expect(actionPlan).toMatchObject({
        id: actionPlanId,
        referralId,
        activities,
        submittedAt: '2021-03-09T15:08:38Z',
        submittedBy: user,
      })
    })
  })

  describe('updateDraftActionPlan', () => {
    it('updates and returns the newly-updated draft action plan when adding an activity', async () => {
      const draftActionPlanId = 'dfb64747-f658-40e0-a827-87b4b0bdcfed'

      await provider.addInteraction({
        state: `an action plan exists with id ${draftActionPlanId}`,
        uponReceiving: 'a PATCH request to set the activities on the action plan',
        withRequest: {
          method: 'PATCH',
          path: `/draft-action-plan/${draftActionPlanId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            newActivity: {
              description: 'Attend training course',
              desiredOutcomeId: '301ead30-30a4-4c7c-8296-2768abfb59b5',
            },
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: draftActionPlanId,
            referralId: '81d754aa-d868-4347-9c0f-50690773014e',
            numberOfSessions: null,
            activities: [
              {
                id: '91e7ceab-74fd-45d8-97c8-ec58844618dd',
                description: 'Attend training course',
                desiredOutcome: {
                  id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
                  description:
                    'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
                },
                createdAt: '2020-12-07T20:45:21.986389Z',
              },
            ],
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const draftActionPlan = await interventionsService.updateDraftActionPlan(token, draftActionPlanId, {
        newActivity: {
          description: 'Attend training course',
          desiredOutcomeId: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        },
      })

      expect(draftActionPlan.id).toBe(draftActionPlanId)
      expect(draftActionPlan.referralId).toBe('81d754aa-d868-4347-9c0f-50690773014e')
      expect(draftActionPlan.numberOfSessions).toBe(null)
      expect(draftActionPlan.activities[0].id).toEqual('91e7ceab-74fd-45d8-97c8-ec58844618dd')
      expect(draftActionPlan.activities[0].description).toEqual('Attend training course')
      expect(draftActionPlan.activities[0].desiredOutcome.id).toEqual('301ead30-30a4-4c7c-8296-2768abfb59b5')
      expect(draftActionPlan.activities[0].desiredOutcome.description).toEqual(
        'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed'
      )
      expect(draftActionPlan.activities[0].createdAt).toEqual('2020-12-07T20:45:21.986389Z')
    })

    it('updates and returns the newly-updated draft action plan when setting number of sessions', async () => {
      const draftActionPlanId = 'dfb64747-f658-40e0-a827-87b4b0bdcfed'

      await provider.addInteraction({
        state: `an action plan exists with id ${draftActionPlanId}`,
        uponReceiving: 'a PATCH request to set the number of sessions on the action plan',
        withRequest: {
          method: 'PATCH',
          path: `/draft-action-plan/${draftActionPlanId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            numberOfSessions: 4,
          },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            id: draftActionPlanId,
            referralId: '81d754aa-d868-4347-9c0f-50690773014e',
            numberOfSessions: 4,
            activities: [
              {
                id: '91e7ceab-74fd-45d8-97c8-ec58844618dd',
                description: 'Attend training course',
                desiredOutcome: {
                  id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
                  description:
                    'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
                },
                createdAt: '2020-12-07T20:45:21.986389Z',
              },
            ],
            createdBy: {
              username: 'BERNARD.BEAKS',
              userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
              authSource: 'delius',
            },
            createdAt: '2020-12-07T20:45:21.986389Z',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const draftActionPlan = await interventionsService.updateDraftActionPlan(token, draftActionPlanId, {
        numberOfSessions: 4,
      })
      expect(draftActionPlan.id).toBe(draftActionPlanId)
      expect(draftActionPlan.referralId).toBe('81d754aa-d868-4347-9c0f-50690773014e')
      expect(draftActionPlan.numberOfSessions).toBe(4)
      expect(draftActionPlan.activities[0].id).toEqual('91e7ceab-74fd-45d8-97c8-ec58844618dd')
      expect(draftActionPlan.activities[0].description).toEqual('Attend training course')
      expect(draftActionPlan.activities[0].desiredOutcome.id).toEqual('301ead30-30a4-4c7c-8296-2768abfb59b5')
      expect(draftActionPlan.activities[0].desiredOutcome.description).toEqual(
        'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed'
      )
      expect(draftActionPlan.activities[0].createdAt).toEqual('2020-12-07T20:45:21.986389Z')
    })
  })

  describe('submitDraftActionPlan', () => {
    const submittedActionPlan = {
      id: '486ba46a-0b57-46ab-82c0-d8c5c43710c6',
      referralId: '81d754aa-d868-4347-9c0f-50690773014e',
      numberOfSessions: 4,
      activities: [
        {
          id: '91e7ceab-74fd-45d8-97c8-ec58844618dd',
          description: 'Attend training course',
          desiredOutcome: {
            id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
            description:
              'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
          },
          createdAt: '2020-12-07T20:45:21.986389Z',
        },
        {
          id: 'e5755c27-2c85-448b-9f6d-e3959ec9c2d0',
          description: 'Attend session',
          desiredOutcome: {
            id: '65924ac6-9724-455b-ad30-906936291421',
            description: 'Service User makes progress in obtaining accommodation.',
          },
          createdAt: '2020-12-07T20:47:21.986389Z',
        },
      ],
      submittedBy: {
        username: 'BERNARD.BEAKS',
        userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
        authSource: 'delius',
      },
      submittedAt: '2020-12-08T20:47:21.986389Z',
    }

    beforeEach(async () => {
      await provider.addInteraction({
        state: 'a draft action plan with ID 6e8dfb5c-127f-46ea-9846-f82b5fd60d27 exists and is ready to be submitted',
        uponReceiving: 'a POST request to send the draft action plan with ID 6e8dfb5c-127f-46ea-9846-f82b5fd60d27',
        withRequest: {
          method: 'POST',
          path: '/draft-action-plan/6e8dfb5c-127f-46ea-9846-f82b5fd60d27/submit',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like(submittedActionPlan),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/action-plan/6e8dfb5c-127f-46ea-9846-f82b5fd60d27'
            ),
          },
        },
      })
    })

    it('returns a sent referral', async () => {
      expect(await interventionsService.submitActionPlan(token, '6e8dfb5c-127f-46ea-9846-f82b5fd60d27')).toMatchObject(
        submittedActionPlan
      )
    })
  })

  describe('getActionPlanAppointments', () => {
    const actionPlanAppointments = [
      {
        sessionNumber: 1,
        appointmentTime: '2021-05-13T12:30:00Z',
        durationInMinutes: 120,
      },
      {
        sessionNumber: 2,
        appointmentTime: '2021-05-20T12:30:00Z',
        durationInMinutes: 120,
      },
      {
        sessionNumber: 3,
        appointmentTime: '2021-05-27T12:30:00Z',
        durationInMinutes: 120,
      },
    ]

    beforeEach(async () => {
      await provider.addInteraction({
        state: 'an action plan with ID e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d exists and it has 3 scheduled appointments',
        uponReceiving: 'a GET request for the appointments on action plan with ID e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d',
        withRequest: {
          method: 'GET',
          path: '/action-plan/e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d/appointments',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(actionPlanAppointments),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns action plan appointments', async () => {
      expect(
        await interventionsService.getActionPlanAppointments(token, 'e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d')
      ).toMatchObject(actionPlanAppointments)
    })
  })

  describe('getActionPlanAppointment', () => {
    const actionPlanAppointment = {
      sessionNumber: 1,
      appointmentTime: '2021-05-13T12:30:00Z',
      durationInMinutes: 120,
    }

    beforeEach(async () => {
      await provider.addInteraction({
        state:
          'an action plan with ID e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d exists and has an appointment for session 1',
        uponReceiving:
          'a GET request for the appointment for session 1 on action plan with ID e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d',
        withRequest: {
          method: 'GET',
          path: '/action-plan/e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d/appointments/1',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(actionPlanAppointment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })
    })

    it('returns the requested action plan appointment', async () => {
      const appointment = await interventionsService.getActionPlanAppointment(
        token,
        'e5ed2f80-dfe2-4bf3-b5c4-d8d4486e963d',
        1
      )
      expect(appointment.sessionNumber).toEqual(1)
      expect(appointment.appointmentTime).toEqual('2021-05-13T12:30:00Z')
      expect(appointment.durationInMinutes).toEqual(120)
    })
  })

  describe('getSubsequentActionPlanAppointment', () => {
    describe('when the current appointment is not the final one', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })

      it('fetches the subsequent action plan appointment', async () => {
        interventionsService.getActionPlanAppointment = jest.fn()
        await interventionsService.getSubsequentActionPlanAppointment(token, actionPlan, appointment)

        expect(interventionsService.getActionPlanAppointment).toHaveBeenCalledWith(token, actionPlan.id, 2)
      })
    })

    describe('when the current appointment is the final one', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })
      const actionPlan = actionPlanFactory.build({ numberOfSessions: 2 })

      it('does not fetch the subsequent action plan appointment', async () => {
        interventionsService.getActionPlanAppointment = jest.fn()

        const subsequentAppointment = await interventionsService.getSubsequentActionPlanAppointment(
          token,
          actionPlan,
          appointment
        )

        expect(subsequentAppointment).toBeNull()
        expect(interventionsService.getActionPlanAppointment).not.toHaveBeenCalled()
      })
    })

    afterEach(() => {
      jest.clearAllMocks()
    })
  })

  describe('updateActionPlanAppointment', () => {
    describe('with non-null values', () => {
      it('returns an updated action plan appointment', async () => {
        const actionPlanAppointment = {
          sessionNumber: 2,
          appointmentTime: '2021-05-13T12:30:00Z',
          durationInMinutes: 60,
        }

        await provider.addInteraction({
          state:
            'an action plan with ID 345059d4-1697-467b-8914-fedec9957279 exists and has 2 2-hour appointments already',
          uponReceiving:
            'a PATCH request to update the appointment for session 2 to change the duration to an hour on action plan with ID 345059d4-1697-467b-8914-fedec9957279',
          withRequest: {
            method: 'PATCH',
            path: '/action-plan/345059d4-1697-467b-8914-fedec9957279/appointment/2',
            body: {
              durationInMinutes: 60,
            },
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          // note - this is an exact match
          willRespondWith: {
            status: 200,
            body: actionPlanAppointment,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })

        expect(
          await interventionsService.updateActionPlanAppointment(token, '345059d4-1697-467b-8914-fedec9957279', 2, {
            durationInMinutes: 60,
          })
        ).toMatchObject(actionPlanAppointment)
      })
    })
  })

  describe('recordAppointmentAttendance', () => {
    it('returns an updated action plan appointment with the service user‘s attendance', async () => {
      await provider.addInteraction({
        state:
          'an action plan with ID 345059d4-1697-467b-8914-fedec9957279 exists and has 2 2-hour appointments already',
        uponReceiving:
          'a POST request to set the attendance for session 2 on action plan with ID 345059d4-1697-467b-8914-fedec9957279',
        withRequest: {
          method: 'POST',
          path: '/action-plan/345059d4-1697-467b-8914-fedec9957279/appointment/2/record-attendance',
          body: {
            attended: 'late',
            additionalAttendanceInformation: 'Alex missed the bus',
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            sessionNumber: 2,
            appointmentTime: '2021-05-13T12:30:00Z',
            durationInMinutes: 60,
            sessionFeedback: {
              attendance: {
                attended: 'late',
                additionalAttendanceInformation: 'Alex missed the bus',
              },
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const appointment = await interventionsService.recordAppointmentAttendance(
        token,
        '345059d4-1697-467b-8914-fedec9957279',
        2,
        {
          attended: 'late',
          additionalAttendanceInformation: 'Alex missed the bus',
        }
      )
      expect(appointment.sessionFeedback!.attendance!.attended).toEqual('late')
      expect(appointment.sessionFeedback!.attendance!.additionalAttendanceInformation).toEqual('Alex missed the bus')
    })
  })

  describe('recordAppointmentBehaviour', () => {
    it('returns an updated action plan appointment with the service user‘s behaviour', async () => {
      await provider.addInteraction({
        state:
          'an action plan with ID 81987e8b-aeb9-4fbf-8ecb-1a054ad74b2d exists with 1 appointment with recorded attendance',
        uponReceiving:
          'a POST request to set the behaviour for the appointment on action plan with ID 81987e8b-aeb9-4fbf-8ecb-1a054ad74b2d',
        withRequest: {
          method: 'POST',
          path: '/action-plan/81987e8b-aeb9-4fbf-8ecb-1a054ad74b2d/appointment/1/record-behaviour',
          body: {
            behaviourDescription: 'Alex was well behaved',
            notifyProbationPractitioner: false,
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            sessionNumber: 1,
            appointmentTime: '2021-05-13T12:30:00Z',
            durationInMinutes: 120,
            sessionFeedback: {
              attendance: {
                attended: 'late',
                additionalAttendanceInformation: 'Alex missed the bus',
              },
              behaviour: {
                behaviourDescription: 'Alex was well behaved',
                notifyProbationPractitioner: false,
              },
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const appointment = await interventionsService.recordAppointmentBehaviour(
        token,
        '81987e8b-aeb9-4fbf-8ecb-1a054ad74b2d',
        1,
        {
          behaviourDescription: 'Alex was well behaved',
          notifyProbationPractitioner: false,
        }
      )
      expect(appointment.sessionFeedback!.behaviour!.behaviourDescription).toEqual('Alex was well behaved')
      expect(appointment.sessionFeedback!.behaviour!.notifyProbationPractitioner).toEqual(false)
    })
  })

  describe('submitSessionFeedback', () => {
    it('submits attendance and behaviour feedback to the PP', async () => {
      await provider.addInteraction({
        state:
          'an action plan with ID 0f5afe04-e323-4699-9423-fb6122580638 exists with 1 appointment with recorded attendance and behaviour',
        uponReceiving:
          'a POST request to submit the feedback for appointment 1 on action plan with ID 0f5afe04-e323-4699-9423-fb6122580638',
        withRequest: {
          method: 'POST',
          path: '/action-plan/0f5afe04-e323-4699-9423-fb6122580638/appointment/1/submit',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like({
            sessionNumber: 1,
            appointmentTime: '2021-05-13T12:30:00Z',
            durationInMinutes: 120,
            sessionFeedback: {
              attendance: {
                attended: 'late',
                additionalAttendanceInformation: 'Alex missed the bus',
              },
              behaviour: {
                behaviourDescription: 'Alex was well behaved',
                notifyProbationPractitioner: false,
              },
              submitted: true,
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const appointment = await interventionsService.submitSessionFeedback(
        token,
        '0f5afe04-e323-4699-9423-fb6122580638',
        1
      )
      expect(appointment.sessionFeedback!.submitted).toEqual(true)
    })
  })
})

describe('serializeDeliusServiceUser', () => {
  const interventionsService = new InterventionsService(config.apis.interventionsService)

  it('transforms a DeliusServiceUser into a format expected by the Interventions Service, removing "expired" disabilities', () => {
    const currentDisabilityEndDate = new Date()
    currentDisabilityEndDate.setDate(currentDisabilityEndDate.getDate() + 1)

    const deliusServiceUser = {
      otherIds: {
        crn: 'X123456',
      },
      offenderProfile: {
        ethnicity: 'British',
        religion: 'Agnostic',
        offenderLanguages: {
          primaryLanguage: 'English',
        },
        disabilities: [
          {
            disabilityType: {
              description: 'Autism',
            },
            endDate: '',
            notes: 'Some notes',
            startDate: '2019-01-22',
          },
          {
            disabilityType: {
              description: 'Sciatica',
            },
            endDate: currentDisabilityEndDate.toString(),
            notes: 'Some notes',
            startDate: '2020-01-01',
          },
          {
            disabilityType: {
              description: 'An old disability',
            },
            endDate: '2020-01-22',
            notes: 'Some notes',
            startDate: '2020-01-22',
          },
        ],
      },
      title: 'Mr',
      firstName: 'Alex',
      surname: 'River',
      dateOfBirth: '1980-01-01',
      gender: 'Male',
    } as DeliusServiceUser

    const serviceUser = interventionsService.serializeDeliusServiceUser(deliusServiceUser)

    expect(serviceUser.crn).toEqual('X123456')
    expect(serviceUser.title).toEqual('Mr')
    expect(serviceUser.firstName).toEqual('Alex')
    expect(serviceUser.lastName).toEqual('River')
    expect(serviceUser.dateOfBirth).toEqual('1980-01-01')
    expect(serviceUser.gender).toEqual('Male')
    expect(serviceUser.ethnicity).toEqual('British')
    expect(serviceUser.religionOrBelief).toEqual('Agnostic')
    expect(serviceUser.preferredLanguage).toEqual('English')
    expect(serviceUser.disabilities).toEqual(['Autism', 'Sciatica'])
  })

  describe('when there are fields missing in the response', () => {
    // this is the current response when running the Community API locally
    const incompleteDeliusServiceUser = {
      firstName: 'Aadland',
      surname: 'Bertrand',
      dateOfBirth: '2065-07-19',
      gender: 'Male',
      otherIds: {
        crn: 'X320741',
      },
      offenderProfile: {
        offenderLanguages: {},
      },
    } as DeliusServiceUser

    it('sets null values on the serialized user for the missing values', () => {
      const serviceUser = interventionsService.serializeDeliusServiceUser(incompleteDeliusServiceUser)

      expect(serviceUser.crn).toEqual('X320741')
      expect(serviceUser.title).toEqual(null)
      expect(serviceUser.firstName).toEqual('Aadland')
      expect(serviceUser.lastName).toEqual('Bertrand')
      expect(serviceUser.dateOfBirth).toEqual('2065-07-19')
      expect(serviceUser.gender).toEqual('Male')
      expect(serviceUser.ethnicity).toEqual(null)
      expect(serviceUser.religionOrBelief).toEqual(null)
      expect(serviceUser.preferredLanguage).toEqual(null)
      expect(serviceUser.disabilities).toEqual(null)
    })
  })
})
