import Wiremock from './mockApis/wiremock'
import InterventionsServiceMocks from './mockApis/interventionsService'
import sentReferralFactory from './testutils/factories/sentReferral'
import serviceCategoryFactory from './testutils/factories/serviceCategory'
import interventionFactory from './testutils/factories/intervention'
import deliusUserFactory from './testutils/factories/deliusUser'
import actionPlanFactory from './testutils/factories/actionPlan'

const wiremock = new Wiremock('http://localhost:9092/__admin')
const interventionsMocks = new InterventionsServiceMocks(wiremock, '')

export default async function setUpMocks(): Promise<void> {
  await wiremock.resetStubs()

  const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
  const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

  const sentBy = {
    username: 'BERNARD.BEAKS',
    authSource: 'delius',
  }

  const actionPlan = actionPlanFactory.notSubmitted().build()

  const sentReferrals = [
    sentReferralFactory.build({
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      referral: {
        serviceCategoryId: accommodationServiceCategory.id,
        serviceUser: { firstName: 'Aadland', lastName: 'Bertrand', crn: 'X320741' },
        desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
      },
      sentBy,
      actionPlanId: actionPlan.id,
    }),
    sentReferralFactory.build({
      sentAt: '2020-09-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'George', lastName: 'Michael', crn: 'X320741' },
        desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
      },
      sentBy,
    }),
    sentReferralFactory.build({
      sentAt: '2021-02-10:00:00.000000Z',
      referenceNumber: 'ABCABCA3',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X320741' },
        desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
      },
      sentBy,
    }),
  ]

  const interventions = [
    {
      id: '98a42c61-c30f-4beb-8062-04033c376e2d',
      title: 'Better solutions (anger management)',
      categoryName: 'thinking and behaviour',
    },
    {
      id: 'd57a2c90-e8cd-489a-b62d-e8f01474f7b0',
      title: 'HELP (domestic violence for males)',
      categoryName: 'relationships',
      description:
        'HELP - the Healthy Relationships programme, is a new, preventative approach to domestic abuse.' +
        'The course aims to help create successful relationships. Those who complete the group will have' +
        'skills and strategies to manage situations differently and avoid problems escalating into violence.',
      npsRegion: null,
    },
  ].map(params => {
    return interventionFactory.build({
      id: params.id,
      title: params.title,
      serviceCategory: { name: params.categoryName },
      description: params.description,
      npsRegion: params.npsRegion,
    })
  })

  const deliusUser = deliusUserFactory.build({
    username: 'AUTH_ADM',
    email: 'auth_test@digital.justice.gov.uk',
    userId: '10ea6b98-88ab-45c5-8917-f5ca1814b787',
  })

  const assignedSentReferrals = sentReferrals.map(referral => {
    return { ...referral, assignedTo: deliusUser }
  })

  await Promise.all([
    interventionsMocks.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory),
    interventionsMocks.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory),
    Promise.all(sentReferrals.map(referral => interventionsMocks.stubGetSentReferral(referral.id, referral))),
    interventionsMocks.stubGetSentReferrals(assignedSentReferrals),
    interventionsMocks.stubGetInterventions(interventions),
    // Adding mocks for assigning locally is a bit tricky - it's very hard to mock a real assignment here due to the state transition.
    // I've opted to just mark these as assigned to unblock the next story for now.
    assignedSentReferrals.forEach(async referral => {
      await interventionsMocks.stubAssignSentReferral(referral.id, referral)
      await interventionsMocks.stubGetSentReferral(referral.id, referral)
    }),
    interventionsMocks.stubGetActionPlan(actionPlan.id, actionPlan),
  ])
}
