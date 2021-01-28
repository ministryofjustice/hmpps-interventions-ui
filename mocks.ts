import Wiremock from './integration_tests/mockApis/wiremock'
import InterventionsServiceMocks from './integration_tests/mockApis/interventionsService'
import sentReferralFactory from './testutils/factories/sentReferral'
import serviceCategoryFactory from './testutils/factories/serviceCategory'

const wiremock = new Wiremock('http://localhost:9092/__admin')
const interventionsMocks = new InterventionsServiceMocks(wiremock, '')

export default async function setUpMocks(): Promise<void> {
  await wiremock.resetStubs()

  const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
  const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

  const sentReferrals = [
    sentReferralFactory.build({
      sentAt: '2021-01-26T13:00:00.000000Z',
      referenceNumber: 'ABCABCA1',
      referral: {
        serviceCategoryId: accommodationServiceCategory.id,
        serviceUser: { firstName: 'George', lastName: 'Michael' },
      },
    }),
    sentReferralFactory.build({
      sentAt: '2020-09-13T13:00:00.000000Z',
      referenceNumber: 'ABCABCA2',
      referral: {
        serviceCategoryId: socialInclusionServiceCategory.id,
        serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      },
    }),
  ]

  await Promise.all([
    interventionsMocks.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory),
    interventionsMocks.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory),
    Promise.all(sentReferrals.map(referral => interventionsMocks.stubGetSentReferral(referral.id, referral))),
    interventionsMocks.stubGetSentReferrals(sentReferrals),
  ])
}
