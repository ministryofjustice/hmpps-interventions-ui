import sentReferralFactory from '../../testutils/factories/sentReferral'
import interventionFactory from '../../testutils/factories/intervention'
import serviceProviderSentReferralSummaryFactory from '../../testutils/factories/serviceProviderSentReferralSummary'

describe('Dashboards', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('As a probation practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')
    })

    it("PP logs in and sees 'My cases' screen with list of sent referrals", () => {
      const accommodationIntervention = interventionFactory.build({
        title: 'Accommodation Services - West Midlands',
      })
      const womensServicesIntervention = interventionFactory.build({
        title: "Women's Services - West Midlands",
      })

      const sentReferrals = [
        sentReferralFactory.build({
          sentAt: '2021-01-26T13:00:00.000000Z',
          referenceNumber: 'ABCABCA1',
          referral: {
            interventionId: accommodationIntervention.id,
            serviceUser: { firstName: 'George', lastName: 'Michael' },
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
            serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
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

  describe('As a service provider', () => {
    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')
    })

    it("SP logs in and sees 'My cases' screen with list of sent referrals", () => {
      const accommodationIntervention = interventionFactory.build({
        title: 'Accommodation Services - West Midlands',
      })
      const womensServicesIntervention = interventionFactory.build({
        title: "Women's Services - West Midlands",
      })

      const sentReferralSummaries = [
        serviceProviderSentReferralSummaryFactory.build({
          sentAt: '2021-01-26T13:00:00.000000Z',
          referenceNumber: 'ABCABCA1',
          interventionTitle: accommodationIntervention.title,
          serviceUserFirstName: 'George',
          serviceUserLastName: 'Michael',
        }),
        serviceProviderSentReferralSummaryFactory.build({
          sentAt: '2020-09-13T13:00:00.000000Z',
          referenceNumber: 'ABCABCA2',
          interventionTitle: womensServicesIntervention.title,
          serviceUserFirstName: 'Jenny',
          serviceUserLastName: 'Jones',
          assignedToUserName: 'A.Caseworker',
        }),
      ]

      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetIntervention(womensServicesIntervention.id, womensServicesIntervention)
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralSummaries)

      cy.login()

      cy.get('h1').contains('All cases')

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Date received': '26 Jan 2021',
            Referral: 'ABCABCA1',
            'Service user': 'George Michael',
            'Intervention type': 'Accommodation Services - West Midlands',
            Caseworker: '',
            Action: 'View',
          },
          {
            'Date received': '13 Sep 2020',
            Referral: 'ABCABCA2',
            'Service user': 'Jenny Jones',
            'Intervention type': "Women's Services - West Midlands",
            Caseworker: 'A.Caseworker',
            Action: 'View',
          },
        ])
    })
  })
})
