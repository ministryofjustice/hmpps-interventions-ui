import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'

describe('Probation practitioner referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  it("user logs in and sees 'My cases' screen with list of sent referrals", () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          serviceCategoryId: accommodationServiceCategory.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-09-13T13:00:00.000000Z',
        assignedTo: {
          username: 'A. Caseworker',
          userId: '123',
          authSource: 'auth',
        },
        referenceNumber: 'ABCABCA2',
        referral: {
          serviceCategoryId: socialInclusionServiceCategory.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
    ]

    cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
    cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    cy.stubGetSentReferrals(sentReferrals)

    cy.login()

    cy.get('h1').contains('My cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
          'Service Category': 'accommodation',
          Provider: 'Harmony Living',
          Caseworker: 'Unassigned',
          Action: 'View',
        },
        {
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
          'Service Category': 'social inclusion',
          Provider: 'Harmony Living',
          Caseworker: 'A. Caseworker',
          Action: 'View',
        },
      ])
  })
})
