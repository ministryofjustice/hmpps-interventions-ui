import Wiremock from './mockApis/wiremock'
import InterventionsServiceMocks from './mockApis/interventionsService'
import sentReferralFactory from './testutils/factories/sentReferral'
import serviceCategoryFactory from './testutils/factories/serviceCategory'
import interventionFactory from './testutils/factories/intervention'

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

  const sentReferrals = [
    sentReferralFactory.build({
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      referral: {
        serviceCategoryId: accommodationServiceCategory.id,
        serviceUser: { firstName: 'Aadland', lastName: 'Bertrand', crn: 'X320741' },
      },
      sentBy,
    }),
    sentReferralFactory.build({
      sentAt: '2020-09-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'George', lastName: 'Michael', crn: 'X320741' },
      },
      sentBy,
    }),
    sentReferralFactory.build({
      sentAt: '2021-02-10:00:00.000000Z',
      referenceNumber: 'ABCABCA3',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X320741' },
      },
      sentBy,
    }),
  ]

  const interventions = [
    { title: 'Better solutions (anger management)', categoryName: 'thinking and behaviour' },
    {
      title: 'HELP (domestic violence for males)',
      categoryName: 'relationships',
      description:
        'HELP - the Healthy Relationships programme, is a new, preventative approach to domestic abuse.' +
        'The course aims to help create successful relationships. Those who complete the group will have' +
        'skills and strategies to manage situations differently and avoid problems escalating into violence.',
    },
  ].map(params => {
    return interventionFactory.build({
      title: params.title,
      serviceCategory: { name: params.categoryName },
      description: params.description,
    })
  })

  await Promise.all([
    interventionsMocks.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory),
    interventionsMocks.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory),
    Promise.all(sentReferrals.map(referral => interventionsMocks.stubGetSentReferral(referral.id, referral))),
    interventionsMocks.stubGetSentReferrals(sentReferrals),
    interventionsMocks.stubGetInterventions(interventions),
  ])
}
