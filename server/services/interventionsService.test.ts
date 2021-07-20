import { pactWith } from 'jest-pact'
import { Matchers } from '@pact-foundation/pact'

import InterventionsService, { UpdateDraftEndOfServiceReportParams } from './interventionsService'
import SentReferral from '../models/sentReferral'
import ServiceUser from '../models/serviceUser'
import config from '../config'
import oauth2TokenFactory from '../../testutils/factories/oauth2Token'
import interventionFactory from '../../testutils/factories/intervention'
import DeliusServiceUser from '../models/delius/deliusServiceUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../testutils/factories/endOfServiceReport'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import appointmentFactory from '../../testutils/factories/appointment'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'

jest.mock('../services/hmppsAuthService')

/*
 It seems that perhaps after upgrading to Jest 27.x, it’s broken something in jest-pact
 (a Jest hook?) which is responsible for increasing the Jest timeout to 30s to give the 
 mock web server time to start up. I’m basing this on the error that’s displayed below 
 when I run the tests.

 I’ve created IC-2024 to investigate this, but I think the temporary solution 
 is to set the timeout ourselves.

  ● Pact between Interventions UI and Interventions Service › with 30000 ms timeout for Pact › getDraftReferral › returns a referral for the gi
ven ID

    thrown: "Exceeded timeout of 5000 ms for a hook.
    Use jest.setTimeout(newTimeout) to increase the timeout value, if this is a long-running test."
*/
jest.setTimeout(30000)

pactWith({ consumer: 'Interventions UI', provider: 'Interventions Service' }, provider => {
  let interventionsService: InterventionsService
  let token: string
  let serviceProviderToken: string

  beforeEach(() => {
    const testConfig = { ...config.apis.interventionsService, url: provider.mockService.baseUrl }
    interventionsService = new InterventionsService(testConfig)
    token = oauth2TokenFactory.deliusToken().build()
    serviceProviderToken = oauth2TokenFactory.authToken().build()
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
              serviceCategoryIds: ['428ee70f-3001-4399-95a6-ad25eaaede16'],
              complexityLevels: null,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the service category id field populated', async () => {
        const referral = await interventionsService.getDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962')

        expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
        expect(referral.serviceCategoryIds![0]).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
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

    describe('for a single-service referral that has had desired outcomes selected', () => {
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
              serviceCategoryIds: ['428ee70f-3001-4399-95a6-ad25eaaede16'],
              desiredOutcomes: [
                {
                  serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                  desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
                },
              ],
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the desired outcomes selected', async () => {
        const referral = await interventionsService.getDraftReferral(token, '037cc90b-beaa-4a32-9ab7-7f79136e1d27')

        expect(referral.id).toBe('037cc90b-beaa-4a32-9ab7-7f79136e1d27')
        expect(referral.desiredOutcomes![0].desiredOutcomesIds).toEqual([
          '301ead30-30a4-4c7c-8296-2768abfb59b5',
          '65924ac6-9724-455b-ad30-906936291421',
        ])
      })
    })

    describe('for a cohort referral that has had desired outcomes selected', () => {
      it('returns a referral for the given ID, with the desired outcomes selected', async () => {
        await provider.addInteraction({
          state: `There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had desired outcomes selected for multiple service categories`,
          uponReceiving: 'a request for that referral',
          withRequest: {
            method: 'GET',
            path: '/draft-referral/06716f8e-f507-42d4-bdcc-44c90e18dbd7',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              id: '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
              desiredOutcomes: [
                {
                  serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                  desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
                },
                {
                  serviceCategoryId: '3c7d6bc9-540a-4aef-a3fe-dfdff7a3c124',
                  desiredOutcomesIds: ['263821e1-3ad1-44ee-8ec5-c1a925f7a828', '0694fcc9-833f-4756-8d93-28199c0ec58a'],
                },
              ],
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        const referral = await interventionsService.getDraftReferral(token, '06716f8e-f507-42d4-bdcc-44c90e18dbd7')

        expect(referral.id).toBe('06716f8e-f507-42d4-bdcc-44c90e18dbd7')
        expect(referral.desiredOutcomes![0].serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
        expect(referral.desiredOutcomes![0].desiredOutcomesIds).toEqual([
          '301ead30-30a4-4c7c-8296-2768abfb59b5',
          '65924ac6-9724-455b-ad30-906936291421',
        ])
        expect(referral.desiredOutcomes![1].serviceCategoryId).toEqual('3c7d6bc9-540a-4aef-a3fe-dfdff7a3c124')
        expect(referral.desiredOutcomes![1].desiredOutcomesIds).toEqual([
          '263821e1-3ad1-44ee-8ec5-c1a925f7a828',
          '0694fcc9-833f-4756-8d93-28199c0ec58a',
        ])
      })
    })

    describe('for a single-service referral that has had a complexity level selected', () => {
      beforeEach(async () => {
        await provider.addInteraction({
          state:
            'There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had a complexity level selected',
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
              complexityLevels: [
                {
                  serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                  complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
                },
              ],
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })
      })

      it('returns a referral for the given ID, with the desired outcomes selected', async () => {
        const referral = await interventionsService.getDraftReferral(token, '037cc90b-beaa-4a32-9ab7-7f79136e1d27')

        expect(referral.id).toBe('037cc90b-beaa-4a32-9ab7-7f79136e1d27')
        expect(referral.complexityLevels![0].complexityLevelId).toEqual('d0db50b0-4a50-4fc7-a006-9c97530e38b2')
      })
    })

    describe('for a cohort referral that has had a complexity level selected', () => {
      it('returns a referral for the given ID, with the a complexity level selected', async () => {
        await provider.addInteraction({
          state: `There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had a complexity level selected for multiple service categories`,
          uponReceiving: 'a request for that referral',
          withRequest: {
            method: 'GET',
            path: '/draft-referral/06716f8e-f507-42d4-bdcc-44c90e18dbd7',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              id: '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
              complexityLevels: [
                {
                  serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                  complexityLevelId: 'c9a7744a-8e6f-45ac-b7be-a88fea39efc0',
                },
                {
                  serviceCategoryId: '3c7d6bc9-540a-4aef-a3fe-dfdff7a3c124',
                  complexityLevelId: 'c6943b29-45e4-413d-9c5a-e8c84bcf29ec',
                },
              ],
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        const referral = await interventionsService.getDraftReferral(token, '06716f8e-f507-42d4-bdcc-44c90e18dbd7')

        expect(referral.id).toBe('06716f8e-f507-42d4-bdcc-44c90e18dbd7')
        expect(referral.complexityLevels![0].serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
        expect(referral.complexityLevels![0].complexityLevelId).toEqual('c9a7744a-8e6f-45ac-b7be-a88fea39efc0')

        expect(referral.complexityLevels![1].serviceCategoryId).toEqual('3c7d6bc9-540a-4aef-a3fe-dfdff7a3c124')
        expect(referral.complexityLevels![1].complexityLevelId).toEqual('c6943b29-45e4-413d-9c5a-e8c84bcf29ec')
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
            interventionId,
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
      expect(referral.interventionId).toBe(interventionId)
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
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962/complexity-level',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            complexityLevels: [
              {
                serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
              },
            ],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.setComplexityLevelForServiceCategory(
        token,
        'd496e4a7-7cc1-44ea-ba67-c295084f1962',
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        }
      )
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
      expect(referral.complexityLevels![0].complexityLevelId).toBe('d0db50b0-4a50-4fc7-a006-9c97530e38b2')
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

    it('returns the updated referral when selecting desired outcomes on a single-service referral', async () => {
      await provider.addInteraction({
        state:
          'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected',
        uponReceiving: 'a PATCH request to update desired outcomes IDs',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962/desired-outcomes',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            desiredOutcomes: [
              {
                serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
              },
            ],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.setDesiredOutcomesForServiceCategory(
        token,
        'd496e4a7-7cc1-44ea-ba67-c295084f1962',
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
        }
      )
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
      expect(referral.desiredOutcomes![0].desiredOutcomesIds).toEqual([
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

    it('returns the updated referral when setting the number of maximumEnforceableDays', async () => {
      await provider.addInteraction({
        state: 'a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists',
        uponReceiving: 'a PATCH request to set the number of maximumEnforceableDays to 4',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/dfb64747-f658-40e0-a827-87b4b0bdcfed',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: { maximumEnforceableDays: 4 },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: Matchers.like('dfb64747-f658-40e0-a827-87b4b0bdcfed'),
            maximumEnforceableDays: 4,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'dfb64747-f658-40e0-a827-87b4b0bdcfed', {
        maximumEnforceableDays: 4,
      })
      expect(referral.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(referral.maximumEnforceableDays).toEqual(4)
    })

    it('returns the updated referral when setting serviceCategoryIds', async () => {
      await provider.addInteraction({
        state:
          'There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962 with contract type of womens services',
        uponReceiving: 'a PATCH request to update serviceCategoryIds',
        withRequest: {
          method: 'PATCH',
          path: '/draft-referral/d496e4a7-7cc1-44ea-ba67-c295084f1962',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceCategoryIds: ['ca374ac3-84eb-4b91-bea7-9005398f426f', '428ee70f-3001-4399-95a6-ad25eaaede16'],
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: 'd496e4a7-7cc1-44ea-ba67-c295084f1962',
            serviceCategoryIds: ['ca374ac3-84eb-4b91-bea7-9005398f426f', '428ee70f-3001-4399-95a6-ad25eaaede16'],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.patchDraftReferral(token, 'd496e4a7-7cc1-44ea-ba67-c295084f1962', {
        serviceCategoryIds: ['ca374ac3-84eb-4b91-bea7-9005398f426f', '428ee70f-3001-4399-95a6-ad25eaaede16'],
      })
      expect(referral.id).toBe('d496e4a7-7cc1-44ea-ba67-c295084f1962')
      expect(referral.serviceCategoryIds).toEqual([
        'ca374ac3-84eb-4b91-bea7-9005398f426f',
        '428ee70f-3001-4399-95a6-ad25eaaede16',
      ])
    })
  })

  describe('setDesiredOutcomesForServiceCategory', () => {
    it('returns the updated referral when selecting desired outcomes on a cohort referral', async () => {
      await provider.addInteraction({
        state: `There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had multiple service categories selected`,
        uponReceiving: 'a PATCH request to set the desired outcomes for a service category on a referral',
        withRequest: {
          method: 'PATCH',
          path: `/draft-referral/06716f8e-f507-42d4-bdcc-44c90e18dbd7/desired-outcomes`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
            desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
            desiredOutcomes: Matchers.like([
              {
                serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
              },
            ]),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.setDesiredOutcomesForServiceCategory(
        token,
        '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
        }
      )

      expect(referral.id).toBe('06716f8e-f507-42d4-bdcc-44c90e18dbd7')
      expect(referral.desiredOutcomes![0].serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
      expect(referral.desiredOutcomes![0].desiredOutcomesIds).toEqual([
        '301ead30-30a4-4c7c-8296-2768abfb59b5',
        '65924ac6-9724-455b-ad30-906936291421',
      ])
    })
  })

  describe('setComplexityLevelForServiceCategory', () => {
    it('returns the updated referral when selecting a complexity level on a cohort referral', async () => {
      await provider.addInteraction({
        state: `There is an existing draft cohort referral with ID of 06716f8e-f507-42d4-bdcc-44c90e18dbd7, and it has had multiple service categories selected`,
        uponReceiving: 'a PATCH request to set the complexity level for a service category on a referral',
        withRequest: {
          method: 'PATCH',
          path: `/draft-referral/06716f8e-f507-42d4-bdcc-44c90e18dbd7/complexity-level`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: {
            serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
            complexityLevels: Matchers.like([
              {
                serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
                complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
              },
            ]),
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const referral = await interventionsService.setComplexityLevelForServiceCategory(
        token,
        '06716f8e-f507-42d4-bdcc-44c90e18dbd7',
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        }
      )

      expect(referral.id).toBe('06716f8e-f507-42d4-bdcc-44c90e18dbd7')
      expect(referral.complexityLevels![0].serviceCategoryId).toEqual('428ee70f-3001-4399-95a6-ad25eaaede16')
      expect(referral.complexityLevels![0].complexityLevelId).toEqual('d0db50b0-4a50-4fc7-a006-9c97530e38b2')
    })
  })

  describe('getServiceCategory', () => {
    const complexityLevels = [
      {
        id: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        title: 'Low complexity',
        description:
          'Service user has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
      },
      {
        id: '110f2405-d944-4c15-836c-0c6684e2aa78',
        title: 'Medium complexity',
        description:
          'Service user is at risk of homelessness/is homeless, or will be on release from prison. Service user has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.',
      },
      {
        id: 'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
        title: 'High complexity',
        description:
          'Service user is homeless or in temporary/unstable accommodation, or will be on release from prison. Service user has poor accommodation history, complex needs and limited skills to secure or sustain a tenancy.',
      },
    ]
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
      {
        id: '19d5ef58-5cfc-41fe-894c-acd705dc1325',
        description: 'Service user is helped to sustain existing accommodation',
      },
      {
        id: 'f6f70273-16a2-4dc7-aafc-9bc74215e713',
        description: 'Service user is prevented from becoming homeless',
      },
      {
        id: '449a93d7-e705-4340-9936-c859644abd52',
        description:
          'Settled accommodation is sustained for a period of at least 6 months or until the end of sentence, whichever occurs first (including for those serving custodial sentences of less than 6 months)',
      },
      {
        id: '55a9cf76-428d-4409-8a57-aaa523f3b631',
        description: 'Service user at risk of losing their tenancy are successfully helped to retain it',
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

  describe('getDraftReferralsForUserToken', () => {
    it('returns a list of draft referrals for a given userID', async () => {
      const userToken = oauth2TokenFactory.deliusToken().build('', { transient: { userID: '8751622134' } })

      await provider.addInteraction({
        state: 'a single referral for user with ID 8751622134 exists',
        uponReceiving: 'a GET request to return the referrals for that user ID',
        withRequest: {
          method: 'GET',
          path: '/draft-referrals',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${userToken}`,
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

      const referrals = await interventionsService.getDraftReferralsForUserToken(userToken)
      expect(referrals.length).toBe(1)
      expect(referrals[0].id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
    })

    it('returns an empty list for an unknown user ID', async () => {
      const unknownUserToken = oauth2TokenFactory.deliusToken().build('', { transient: { userID: '123344556' } })

      await provider.addInteraction({
        state: 'a referral does not exist for user with ID 123344556',
        uponReceiving: 'a GET request to return the referrals for that user ID',
        withRequest: {
          method: 'GET',
          path: '/draft-referrals',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${unknownUserToken}`,
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

      const referrals = await interventionsService.getDraftReferralsForUserToken(unknownUserToken)
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
    endRequestedAt: null,
    endRequestedReason: null,
    endRequestedComments: null,
    concludedAt: null,
    endOfServiceReport: null,
    referenceNumber: 'HDJ2123F',
    supplementaryRiskId: 'a1f5ce02-53a3-47c4-bc71-45f1bdbf504c',
    referral: {
      createdAt: '2021-01-11T10:32:12.382884Z',
      completionDeadline: '2021-04-01',
      serviceProvider: {
        name: 'Harmony Living',
      },
      interventionId: '000b2538-914b-4641-a1cc-a293409536bf',
      serviceCategoryIds: ['428ee70f-3001-4399-95a6-ad25eaaede16'],
      complexityLevels: [
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        },
      ],
      furtherInformation: 'Some information about the service user',
      relevantSentenceId: 2600295124,
      desiredOutcomes: [
        {
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          desiredOutcomesIds: ['301ead30-30a4-4c7c-8296-2768abfb59b5', '65924ac6-9724-455b-ad30-906936291421'],
        },
      ],
      additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
      accessibilityNeeds: 'She uses a wheelchair',
      needsInterpreter: true,
      interpreterLanguage: 'Spanish',
      hasAdditionalResponsibilities: true,
      whenUnavailable: 'She works Mondays 9am - midday',
      serviceUser,
      maximumEnforceableDays: 10,
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

    describe('for a referral that has an end of service report', () => {
      it('populates the endOfServiceReport property', async () => {
        const id = '03bf1369-00d3-4b7f-88b2-da3cc8cc35b9'
        const endOfServiceReport = endOfServiceReportFactory.build()

        await provider.addInteraction({
          state: `There is an existing sent referral with ID of ${id}, and it has an end of service report`,
          uponReceiving: `a request for the sent referral with ID of ${id}`,
          withRequest: {
            method: 'GET',
            path: `/sent-referral/${id}`,
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like({
              endOfServiceReport,
            }),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        expect(await interventionsService.getSentReferral(token, id)).toMatchObject({
          endOfServiceReport,
        })
      })
    })

    describe('for a sent referral that has had an end request', () => {
      it('populates the endRequested properties', async () => {
        const endRequestedReferral = sentReferralFactory.endRequested().build()
        await provider.addInteraction({
          state:
            'There is an existing sent referral with ID of c5554f8f-aac6-4eaf-ba70-63281de35685, and it has been requested to be ended',
          uponReceiving: 'a request for the sent referral with ID of c5554f8f-aac6-4eaf-ba70-63281de35685',
          withRequest: {
            method: 'GET',
            path: '/sent-referral/c5554f8f-aac6-4eaf-ba70-63281de35685',
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like(endRequestedReferral),
            headers: { 'Content-Type': 'application/json' },
          },
        })

        const referral = await interventionsService.getSentReferral(token, 'c5554f8f-aac6-4eaf-ba70-63281de35685')
        expect(referral.endRequestedAt).not.toBeNull()
        expect(referral.endRequestedReason).not.toBeNull()
        expect(referral.endRequestedComments).not.toBeNull()
      })
    })
  })

  describe('getReferralsForUserToken', () => {
    it('returns a list of sent referrals', async () => {
      await provider.addInteraction({
        state: 'There are some existing sent referrals sent by a probation practitioner user',
        uponReceiving: 'a request for all sent referrals for the probation practitioner user',
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

      expect(await interventionsService.getSentReferralsForUserToken(token)).toEqual([sentReferral, sentReferral])
    })
  })

  describe('getServiceProviderSentReferralsSummaryForUserToken', () => {
    it('returns a list of assigned referrals', async () => {
      await provider.addInteraction({
        state: 'There is a sent referral with ID 4afb07a0-e50b-490c-a8c1-c858d5a1e912 with an assigned user',
        uponReceiving: 'a request for all sent referrals summary for the service user',
        withRequest: {
          method: 'GET',
          path: '/sent-referrals/summary/service-provider',
          headers: { Accept: 'application/json', Authorization: `Bearer ${serviceProviderToken}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like([
            {
              referralId: '4afb07a0-e50b-490c-a8c1-c858d5a1e912',
              sentAt: '2021-01-26T13:00:00.000000Z',
              referenceNumber: 'ABCABCA1',
              interventionTitle: 'Accommodation Services - West Midlands',
              assignedToUserName: 'bernard.beaks',
              serviceUserFirstName: 'George',
              serviceUserLastName: 'Michael',
            },
          ]),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      const referralSummary = {
        referralId: '4afb07a0-e50b-490c-a8c1-c858d5a1e912',
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        interventionTitle: 'Accommodation Services - West Midlands',
        assignedToUserName: 'bernard.beaks',
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
      }
      expect(
        await interventionsService.getServiceProviderSentReferralsSummaryForUserToken(serviceProviderToken)
      ).toEqual([referralSummary])
    })
    it('returns a list of unassigned referrals', async () => {
      await provider.addInteraction({
        state: 'There is a sent referral with ID dc94fbd6-354b-4edc-863b-cffc8358f1ec without an assigned user',
        uponReceiving: 'a request for all sent referrals summary for the service user',
        withRequest: {
          method: 'GET',
          path: '/sent-referrals/summary/service-provider',
          headers: { Accept: 'application/json', Authorization: `Bearer ${serviceProviderToken}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like([
            {
              referralId: '4afb07a0-e50b-490c-a8c1-c858d5a1e912',
              sentAt: '2021-01-26T13:00:00.000000Z',
              referenceNumber: 'ABCABCA1',
              interventionTitle: 'Accommodation Services - West Midlands',
              assignedToUserName: null,
              serviceUserFirstName: 'George',
              serviceUserLastName: 'Michael',
            },
          ]),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      const referralSummary = {
        referralId: '4afb07a0-e50b-490c-a8c1-c858d5a1e912',
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        interventionTitle: 'Accommodation Services - West Midlands',
        assignedToUserName: null,
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
      }
      expect(
        await interventionsService.getServiceProviderSentReferralsSummaryForUserToken(serviceProviderToken)
      ).toEqual([referralSummary])
    })
  })

  describe('assignSentReferral', () => {
    it('returns the sent referral, with the assignedTo property populated', async () => {
      await provider.addInteraction({
        state:
          'There is an existing sent referral with ID of 400be4c6-1aa4-4f52-ae86-cbd5d23309bf and it is unassigned',
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
      const interventions = interventionFactory.buildList(2)

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
          body: Matchers.like(interventions),
          headers: { 'Content-Type': 'application/json' },
        },
      })

      expect(await interventionsService.getInterventions(token, {})).toEqual(interventions)
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

    it('returns a newly created draft action plan with number of sessions and activities', async () => {
      const referralId = '81d754aa-d868-4347-9c0f-50690773014e'
      await provider.addInteraction({
        state: 'a caseworker has been assigned to a sent referral and an action plan can be created',
        uponReceiving: 'a POST request to create a draft action plan that includes numberOfSessions and activities',
        withRequest: {
          method: 'POST',
          path: '/draft-action-plan',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            referralId,
            numberOfSessions: 5,
            activities: [{ description: 'activity 1' }, { description: 'activity 2' }],
          },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like({
            id: 'dfb64747-f658-40e0-a827-87b4b0bdcfed',
            referralId: '81d754aa-d868-4347-9c0f-50690773014e',
            numberOfSessions: 5,
            activities: [
              {
                id: '5f7ce12c-0858-4188-a6af-5c8bdd697536',
                createdAt: '2020-12-07T20:45:21.986389Z',
                description: 'activity 1',
              },
              {
                id: '5f7ce12c-0858-4188-a6af-5c8bdd697536',
                createdAt: '2020-12-07T20:45:21.986389Z',
                description: 'activity 2',
              },
            ],
          }),
          headers: {
            'Content-Type': 'application/json',
            Location: Matchers.like(
              'https://hmpps-interventions-service.com/draft-action-plan/dfb64747-f658-40e0-a827-87b4b0bdcfed'
            ),
          },
        },
      })

      const draftActionPlan = await interventionsService.createDraftActionPlan(token, referralId, 5, [
        { description: 'activity 1' },
        { description: 'activity 2' },
      ])
      expect(draftActionPlan.id).toBe('dfb64747-f658-40e0-a827-87b4b0bdcfed')
      expect(draftActionPlan.referralId).toBe('81d754aa-d868-4347-9c0f-50690773014e')
      expect(draftActionPlan.numberOfSessions).toBe(5)
      expect(draftActionPlan.activities.length).toBe(2)
    })
  })

  describe('getActionPlan', () => {
    it('returns an existing draft action plan', async () => {
      const actionPlanId = 'dfb64747-f658-40e0-a827-87b4b0bdcfed'
      const referralId = '1be9f8e5-535f-4836-9b00-4d64c96784fd'

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
            approvedAt: null,
            approvedBy: null,
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
        approvedAt: null,
        approvedBy: null,
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
            approvedAt: null,
            approvedBy: null,
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
        approvedAt: null,
        approvedBy: null,
      })
    })

    it('returns an existing approved action plan', async () => {
      const actionPlanId = 'f3ade2c5-075a-4235-9826-eed289e4d17a'
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
          createdAt: '2020-12-07T20:45:21.986389Z',
        },
      ]

      await provider.addInteraction({
        state: `an action plan exists with ID ${actionPlanId}, and it has been approved`,
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
            approvedAt: '2021-03-09T15:08:38Z',
            approvedBy: user,
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
        approvedAt: '2021-03-09T15:08:38Z',
        approvedBy: user,
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
        },
      })

      expect(draftActionPlan.id).toBe(draftActionPlanId)
      expect(draftActionPlan.referralId).toBe('81d754aa-d868-4347-9c0f-50690773014e')
      expect(draftActionPlan.numberOfSessions).toBe(null)
      expect(draftActionPlan.activities[0].id).toEqual('91e7ceab-74fd-45d8-97c8-ec58844618dd')
      expect(draftActionPlan.activities[0].description).toEqual('Attend training course')
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
      expect(draftActionPlan.activities[0].createdAt).toEqual('2020-12-07T20:45:21.986389Z')
    })
  })

  describe('updateActionPlanActivity', () => {
    it('updates and returns an updated action plan activity', async () => {
      const draftActionPlanId = '6e8dfb5c-127f-46ea-9846-f82b5fd60d27'
      const activityId = 'fd1b6653-ea7b-4e12-9d45-72ff9b1a3ea0'

      await provider.addInteraction({
        state: `a draft action plan with ID ${draftActionPlanId} exists and it has an activity with ID ${activityId}`,
        uponReceiving: `a PATCH request to update the activity with id ${activityId}`,
        withRequest: {
          method: 'PATCH',
          path: `/action-plan/${draftActionPlanId}/activities/${activityId}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          body: {
            description: 'do something totally different!',
          },
        },
        willRespondWith: {
          status: 200,
          body: {
            id: draftActionPlanId,
            activities: [
              {
                id: activityId,
                description: 'do something totally different!',
                createdAt: Matchers.like('2020-12-07T20:45:21.986389Z'),
              },
            ],
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const draftActionPlan = await interventionsService.updateActionPlanActivity(
        token,
        draftActionPlanId,
        activityId,
        'do something totally different!'
      )

      expect(draftActionPlan.id).toBe(draftActionPlanId)
      expect(draftActionPlan.activities[0].id).toEqual(activityId)
      expect(draftActionPlan.activities[0].description).toEqual('do something totally different!')
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
          createdAt: '2020-12-07T20:45:21.986389Z',
        },
        {
          id: 'e5755c27-2c85-448b-9f6d-e3959ec9c2d0',
          description: 'Attend session',
          createdAt: '2020-12-07T20:47:21.986389Z',
        },
      ],
      submittedBy: {
        username: 'BERNARD.BEAKS',
        userId: '555224b3-865c-4b56-97dd-c3e817592ba3',
        authSource: 'delius',
      },
      submittedAt: '2020-12-08T20:47:21.986389Z',
      approvedBy: null,
      approvedAt: null,
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

    it('returns a submitted action plan', async () => {
      expect(await interventionsService.submitActionPlan(token, '6e8dfb5c-127f-46ea-9846-f82b5fd60d27')).toMatchObject(
        submittedActionPlan
      )
    })
  })

  describe('approveActionPlan', () => {
    beforeEach(async () => {
      await provider.addInteraction({
        state: 'an action plan exists with ID 7a165933-d851-48c1-9ab0-ff5b8da12695, and it has been submitted',
        uponReceiving: 'a POST request to approve the action plan with ID 7a165933-d851-48c1-9ab0-ff5b8da12695',
        withRequest: {
          method: 'POST',
          path: '/action-plan/7a165933-d851-48c1-9ab0-ff5b8da12695/approve',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
        },
      })
    })
    it('returns successfully', async () => {
      await interventionsService.approveActionPlan(token, '7a165933-d851-48c1-9ab0-ff5b8da12695')
    })
  })

  describe('getActionPlanAppointments', () => {
    const actionPlanAppointments = [
      actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        appointmentTime: '2021-05-13T12:30:00Z',
        durationInMinutes: 120,
        appointmentDeliveryType: 'PHONE_CALL',
      }),
      actionPlanAppointmentFactory.build({
        sessionNumber: 2,
        appointmentTime: '2021-05-20T12:30:00Z',
        durationInMinutes: 120,
        appointmentDeliveryType: 'PHONE_CALL',
      }),
      actionPlanAppointmentFactory.build({
        sessionNumber: 3,
        appointmentTime: '2021-05-27T12:30:00Z',
        durationInMinutes: 120,
        appointmentDeliveryType: 'PHONE_CALL',
      }),
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
    const actionPlanAppointment = actionPlanAppointmentFactory.build({
      sessionNumber: 1,
      appointmentTime: '2021-05-13T12:30:00Z',
      durationInMinutes: 120,
      appointmentDeliveryType: 'PHONE_CALL',
    })

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
      expect(appointment.appointmentDeliveryType).toEqual('PHONE_CALL')
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
        const actionPlanAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-05-13T12:30:00Z',
          durationInMinutes: 60,
          appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
          appointmentDeliveryAddress: {
            firstAddressLine: 'Harmony Living Office, Room 4',
            secondAddressLine: '44 Bouverie Road',
            townOrCity: 'Blackpool',
            county: 'Lancashire',
            postCode: 'SY40RE',
          },
        })

        await provider.addInteraction({
          state:
            'an action plan with ID 345059d4-1697-467b-8914-fedec9957279 exists and has 2 2-hour appointments already',
          uponReceiving:
            'a PATCH request to update the appointment for session 2 to change the duration to an hour on action plan with ID 345059d4-1697-467b-8914-fedec9957279',
          withRequest: {
            method: 'PATCH',
            path: '/action-plan/345059d4-1697-467b-8914-fedec9957279/appointment/2',
            body: {
              appointmentTime: '2021-05-13T12:30:00Z',
              durationInMinutes: 60,
              appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
              appointmentDeliveryAddress: {
                firstAddressLine: 'Harmony Living Office, Room 4',
                secondAddressLine: '44 Bouverie Road',
                townOrCity: 'Blackpool',
                county: 'Lancashire',
                postCode: 'SY40RE',
              },
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
            appointmentTime: '2021-05-13T12:30:00Z',
            durationInMinutes: 60,
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY40RE',
            },
          })
        ).toMatchObject(actionPlanAppointment)
      })
    })
  })

  describe('recordActionPlanAppointmentAttendance', () => {
    it('returns an updated action plan appointment with the service user‘s attendance', async () => {
      await provider.addInteraction({
        state:
          'an action plan with ID 345059d4-1697-467b-8914-fedec9957279 exists and has an appointment for which no session feedback has been recorded',
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
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY40RE',
            },
            sessionFeedback: {
              attendance: {
                attended: 'late',
                additionalAttendanceInformation: 'Alex missed the bus',
              },
              behaviour: {
                behaviourDescription: null,
                notifyProbationPractitioner: null,
              },
              submitted: false,
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const appointment = await interventionsService.recordActionPlanAppointmentAttendance(
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

  describe('recordActionPlanAppointmentBehavior', () => {
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
              submitted: false,
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const appointment = await interventionsService.recordActionPlanAppointmentBehavior(
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

  describe('submitActionPlanSessionFeedback', () => {
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

      const appointment = await interventionsService.submitActionPlanSessionFeedback(
        token,
        '0f5afe04-e323-4699-9423-fb6122580638',
        1
      )
      expect(appointment.sessionFeedback!.submitted).toEqual(true)
    })
  })

  describe('createDraftEndOfServiceReport', () => {
    it('creates a draft end of service report for a referral', async () => {
      const referralId = '993d7bdf-bab7-4594-8b27-7d9f7061b403'
      const endOfServiceReport = endOfServiceReportFactory.justCreated().build()

      await provider.addInteraction({
        state: `a sent referral exists with ID ${referralId}`,
        uponReceiving: `a request to create a draft end of service report for the referral with ID ${referralId}`,
        withRequest: {
          method: 'POST',
          path: '/draft-end-of-service-report',
          body: { referralId },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 201,
          body: Matchers.like(endOfServiceReport),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.createDraftEndOfServiceReport(token, referralId)
      expect(result).toEqual(endOfServiceReport)
    })
  })

  describe('getEndOfServiceReport', () => {
    it('returns an existing end of service report', async () => {
      const id = '31ad504a-1827-46e4-ac95-68b4e1256659'
      const endOfServiceReport = endOfServiceReportFactory.justCreated().build()

      await provider.addInteraction({
        state: `an end of service report exists with ID ${id}`,
        uponReceiving: `a request for the end of service report with ID ${id}`,
        withRequest: {
          method: 'GET',
          path: `/end-of-service-report/${id}`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(endOfServiceReport),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.getEndOfServiceReport(token, id)
      expect(result).toEqual(endOfServiceReport)
    })
  })

  describe('updateEndOfServiceReport', () => {
    it('updates a draft end of service report', async () => {
      const id = 'c1a23b08-5a52-47bb-90c2-37c2f3a409aa'
      const desiredOutcomeId = 'dc4894fa-4088-4999-bf58-5f05495979df'
      const updatedEndOfServiceReport = endOfServiceReportFactory.justCreated().build({
        furtherInformation: 'Some further information',
        outcomes: [
          {
            desiredOutcome: {
              id: desiredOutcomeId,
              description: 'Example',
            },
            achievementLevel: 'ACHIEVED',
            progressionComments: 'Some progression comments',
            additionalTaskComments: 'Some additional task comments',
          },
        ],
      })
      const patch: UpdateDraftEndOfServiceReportParams = {
        furtherInformation: 'Some further information',
        outcome: {
          desiredOutcomeId,
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments',
          additionalTaskComments: 'Some additional task comments',
        },
      }

      await provider.addInteraction({
        state: `an end of service report exists with ID ${id}`,
        uponReceiving: `a request for the end of service report with ID ${id}`,
        withRequest: {
          method: 'PATCH',
          path: `/draft-end-of-service-report/${id}`,
          body: patch,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(updatedEndOfServiceReport),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.updateDraftEndOfServiceReport(token, id, patch)
      expect(result).toEqual(updatedEndOfServiceReport)
    })
  })

  describe('submitEndOfServiceReport', () => {
    it('submits a draft end of service report', async () => {
      const id = 'c3239695-b258-4ac6-9478-cb6929668aaa'
      const submittedEndOfServiceReport = endOfServiceReportFactory.submitted().build()

      await provider.addInteraction({
        state: `an end of service report exists with ID ${id}`,
        uponReceiving: `a request for the end of service report with ID ${id}`,
        withRequest: {
          method: 'POST',
          path: `/draft-end-of-service-report/${id}/submit`,
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(submittedEndOfServiceReport),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.submitEndOfServiceReport(token, id)
      expect(result).toEqual(submittedEndOfServiceReport)
    })
  })

  describe('endReferral', () => {
    const endedReferral = sentReferralFactory.endRequested().build({ concludedAt: '2020-12-07T20:45:21.986389Z' })

    beforeEach(async () => {
      await provider.addInteraction({
        state:
          'There is an existing assigned referral with ID of 5f71c68f-3e43-46b6-8f25-027a88637ee1 with no attended sessions',
        uponReceiving:
          'a POST request to end the referral with ID 5f71c68f-3e43-46b6-8f25-027a88637ee1 because SU was recalled ',
        withRequest: {
          method: 'POST',
          path: '/sent-referral/5f71c68f-3e43-46b6-8f25-027a88637ee1/end',
          body: {
            reasonCode: 'REC',
            comments: 'Alex was arrested for driving without insurance and immediately recalled.',
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(endedReferral),
          headers: { 'Content-Type': 'application/json' },
        },
      })
    })

    it('returns an ended referral', async () => {
      expect(
        await interventionsService.endReferral(
          token,
          '5f71c68f-3e43-46b6-8f25-027a88637ee1',
          'REC',
          'Alex was arrested for driving without insurance and immediately recalled.'
        )
      ).toMatchObject(endedReferral)
    })
  })

  describe('getCancellationReasons', () => {
    const reasons = [
      { code: 'REC', description: 'Service user has been recalled' },
      { code: 'DIE', description: 'Service user died' },
    ]

    beforeEach(async () => {
      await provider.addInteraction({
        state: 'nothing',
        uponReceiving: 'a GET request for the cancellation reasons',
        withRequest: {
          method: 'GET',
          path: '/referral-cancellation-reasons',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(reasons),
          headers: { 'Content-Type': 'application/json' },
        },
      })
    })

    it('returns cancellation reasons', async () => {
      expect(await interventionsService.getReferralCancellationReasons(token)).toMatchObject(reasons)
    })
  })

  describe('getSupplierAssessment', () => {
    it('returns the referral’s supplier assessment', async () => {
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })

      await provider.addInteraction({
        state:
          'a sent referral with ID cbf2f82b-4581-4fe1-9de1-1b52465f1afa exists, and a supplier assessment appointment has not yet been booked for it',
        uponReceiving:
          'a GET request for the supplier assessment on sent referral with ID cbf2f82b-4581-4fe1-9de1-1b52465f1afa',
        withRequest: {
          method: 'GET',
          path: '/sent-referral/cbf2f82b-4581-4fe1-9de1-1b52465f1afa/supplier-assessment',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(supplierAssessment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const fetchedSupplierAssessment = await interventionsService.getSupplierAssessment(
        token,
        'cbf2f82b-4581-4fe1-9de1-1b52465f1afa'
      )
      expect(fetchedSupplierAssessment).toEqual(supplierAssessment)
    })

    it('returns the referral’s supplier assessment, including a list of its appointments', async () => {
      const appointment = appointmentFactory.newlyBooked().phoneCall.build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })

      await provider.addInteraction({
        state:
          'a sent referral with ID a38d9184-5498-4049-af16-3d8eb2547962 exists, and it has a phone call supplier assessment appointment booked with no feedback yet submitted',
        uponReceiving:
          'a GET request for the supplier assessment appointment on sent referral with ID a38d9184-5498-4049-af16-3d8eb2547962',
        withRequest: {
          method: 'GET',
          path: '/sent-referral/a38d9184-5498-4049-af16-3d8eb2547962/supplier-assessment',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(supplierAssessment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const fetchedSupplierAssessment = await interventionsService.getSupplierAssessment(
        token,
        'a38d9184-5498-4049-af16-3d8eb2547962'
      )
      expect(fetchedSupplierAssessment).toEqual(supplierAssessment)
    })
  })

  describe('scheduleSupplierAssessmentAppointment', () => {
    const appointmentParams = {
      appointmentTime: '2021-05-13T12:30:00Z',
      durationInMinutes: 60,
    }

    describe.each([
      [
        'a video call appointment',
        '77f6c5cf-9772-4731-9a9a-97f2f53f2770',
        appointmentFactory.videoCall.build(appointmentParams),
      ],
      [
        'a phone call appointment',
        '4567945e-73be-43f0-9021-74c4a8ce49db',
        appointmentFactory.phoneCall.build(appointmentParams),
      ],
      [
        'a face to face appointment',
        'fb10c5fe-12ce-482f-8ca1-104974ab21f5',
        appointmentFactory.inPersonOtherWithFullAddress.build(appointmentParams),
      ],
    ])('booking %s', (_, supplierAssessmentId, appointment) => {
      it('returns a supplier assessment appointment', async () => {
        await provider.addInteraction({
          state: `a supplier assessment with ID ${supplierAssessmentId} exists`,
          uponReceiving: `a PUT request to schedule an appointment for the supplier assessment with ID ${supplierAssessmentId}`,
          withRequest: {
            method: 'PUT',
            path: `/supplier-assessment/${supplierAssessmentId}/schedule-appointment`,
            body: appointment,
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          },
          willRespondWith: {
            status: 200,
            body: Matchers.like(appointment),
            headers: {
              'Content-Type': 'application/json',
            },
          },
        })

        expect(
          await interventionsService.scheduleSupplierAssessmentAppointment(token, supplierAssessmentId, appointment)
        ).toMatchObject(appointment)
      })
    })
  })

  /*
  describe('recordAppointmentAttendance', () => {
    it('returns an updated appointment with the service user‘s attendance', async () => {
      const appointment = appointmentFactory.build({
        appointmentTime: '2021-05-13T12:30:00Z',
        durationInMinutes: 60,
        sessionFeedback: {
          attendance: {
            attended: 'late',
            additionalAttendanceInformation: 'Alex missed the bus',
          },
          behaviour: {
            behaviourDescription: null,
            notifyProbationPractitioner: null,
          },
          submitted: false,
        },
      })

      await provider.addInteraction({
        state: 'an appointment with ID 578e9360-8938-4fea-8889-19a3309ad840 exists and no feedback has been recorded',
        uponReceiving:
          'a PUT request to set the attendance for the appointment with ID 578e9360-8938-4fea-8889-19a3309ad840',
        withRequest: {
          method: 'PUT',
          path: '/appointment/578e9360-8938-4fea-8889-19a3309ad840/record-attendance',
          body: {
            attended: 'late',
            additionalAttendanceInformation: 'Alex missed the bus',
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(appointment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.recordAppointmentAttendance(
        token,
        '578e9360-8938-4fea-8889-19a3309ad840',
        {
          attended: 'late',
          additionalAttendanceInformation: 'Alex missed the bus',
        }
      )
      expect(result.sessionFeedback!.attendance!.attended).toEqual('late')
      expect(result.sessionFeedback!.attendance!.additionalAttendanceInformation).toEqual('Alex missed the bus')
    })
  })

  describe('recordAppointmentBehavior', () => {
    it('returns an supplier with the service user‘s behaviour', async () => {
      const appointment = appointmentFactory.build({
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
          submitted: false,
        },
      })

      await provider.addInteraction({
        state: 'an appointment with ID 578e9360-8938-4fea-8889-19a3309ad840 exists',
        uponReceiving:
          'a PUT request to set the behaviour for the appointment with ID 578e9360-8938-4fea-8889-19a3309ad840',
        withRequest: {
          method: 'PUT',
          path: '/appointment/578e9360-8938-4fea-8889-19a3309ad840/record-behaviour',
          body: {
            behaviourDescription: 'Alex was well behaved',
            notifyProbationPractitioner: false,
          },
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(appointment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.recordAppointmentBehavior(
        token,
        '578e9360-8938-4fea-8889-19a3309ad840',
        {
          behaviourDescription: 'Alex was well behaved',
          notifyProbationPractitioner: false,
        }
      )
      expect(result.sessionFeedback!.behaviour!.behaviourDescription).toEqual('Alex was well behaved')
      expect(result.sessionFeedback!.behaviour!.notifyProbationPractitioner).toEqual(false)
    })
  })

  describe('submitAppointmentFeedback', () => {
    it('submits attendance and behaviour feedback to the PP', async () => {
      const appointment = appointmentFactory.build({
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
      })

      await provider.addInteraction({
        state: 'an appointment with ID 86c422b4-4c55-42ec-b9a6-3ae1ab000adb exists',
        uponReceiving:
          'a POST request to submit the feedback for the appointment with ID 86c422b4-4c55-42ec-b9a6-3ae1ab000adb',
        withRequest: {
          method: 'POST',
          path: '/appointment/86c422b4-4c55-42ec-b9a6-3ae1ab000adb/submit-feedback',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        },
        willRespondWith: {
          status: 200,
          body: Matchers.like(appointment),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      const result = await interventionsService.submitAppointmentFeedback(token, '86c422b4-4c55-42ec-b9a6-3ae1ab000adb')
      expect(result.sessionFeedback!.submitted).toEqual(true)
    })
  })
  */
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
