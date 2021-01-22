import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'

describe('Service provider referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  it('User views a list of sent referrals', () => {
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

    cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
    cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
    cy.stubGetSentReferrals(sentReferrals)

    cy.login()

    cy.get('h1').contains('All cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Date received': '26 Jan 2021',
          'Intervention type': 'Accommodation',
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
        },
        {
          'Date received': '13 Sep 2020',
          'Intervention type': 'Social inclusion',
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
        },
      ])
  })
})
