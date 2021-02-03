import Wiremock from './mockApis/wiremock'
import InterventionsServiceMocks from './mockApis/interventionsService'
import sentReferralFactory from './testutils/factories/sentReferral'
import serviceCategoryFactory from './testutils/factories/serviceCategory'

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
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      },
      sentBy,
    }),
    sentReferralFactory.build({
      sentAt: '2020-09-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      },
      sentBy,
    }),
    sentReferralFactory.build({
      sentAt: '2021-02-10:00:00.000000Z',
      referenceNumber: 'ABCABCA3',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Yates' },
      },
      sentBy,
    }),
  ]

  await Promise.all([
    interventionsMocks.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory),
    interventionsMocks.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory),
    Promise.all(sentReferrals.map(referral => interventionsMocks.stubGetSentReferral(referral.id, referral))),
    interventionsMocks.stubGetSentReferrals(sentReferrals),
  ])
}
