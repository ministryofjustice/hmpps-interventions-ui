import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import interventionFactory from '../../testutils/factories/intervention'
import sentReferralFactory from '../../testutils/factories/sentReferral'

describe('When viewing the dashboard page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('as a Probation Practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')
    })
    it("user logs in and sees 'My cases' screen with list of sent referrals", () => {
      const serviceCategory = serviceCategoryFactory.build()
      const accommodationIntervention = interventionFactory.build({
        contractType: { name: 'accommodation' },
        title: 'Accommodation Services - West Midlands',
      })
      const womensServicesIntervention = interventionFactory.build({
        contractType: { name: "women's services" },
        title: "Women's Services - West Midlands",
      })

      const sentReferrals = [
        sentReferralFactory.build({
          sentAt: '2021-01-26T13:00:00.000000Z',
          referenceNumber: 'ABCABCA1',
          referral: {
            interventionId: accommodationIntervention.id,
            serviceUser: { firstName: 'George', lastName: 'Michael' },
            serviceCategoryIds: [serviceCategory.id],
            desiredOutcomes: [
              {
                serviceCategoryId: serviceCategory.id,
                desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
              },
            ],
            desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
            complexityLevels: [
              { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
            ],
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
            interventionId: womensServicesIntervention.id,
            serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
            serviceCategoryIds: [serviceCategory.id],
            desiredOutcomes: [
              {
                serviceCategoryId: serviceCategory.id,
                desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
              },
            ],
            complexityLevels: [
              { serviceCategoryId: serviceCategory.id, complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78' },
            ],
          },
        }),
      ]

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
      cy.stubGetSentReferralsForUserToken(sentReferrals)

      cy.login()

      cy.get('h1').contains('My cases')

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Date sent': '26 Jan 2021',
            Referral: 'ABCABCA1',
            'Service user': 'George Michael',
            'Intervention type': 'Accommodation Services - West Midlands',
            Provider: 'Harmony Living',
            Caseworker: 'Unassigned',
            Action: 'View',
          },
          {
            'Date sent': '13 Sep 2020',
            Referral: 'ABCABCA2',
            'Service user': 'Jenny Jones',
            'Intervention type': "Women's Services - West Midlands",
            Provider: 'Harmony Living',
            Caseworker: 'A. Caseworker',
            Action: 'View',
          },
        ])
    })
  })
})
