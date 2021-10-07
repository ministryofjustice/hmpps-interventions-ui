import interventionFactory from '../../testutils/factories/intervention'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import serviceProviderSentReferralSummaryFactory from '../../testutils/factories/serviceProviderSentReferralSummary'

describe('Performing reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  describe('User requests reporting data', () => {
    it('allows the user to request a report based on the requested date range', () => {
      const intervention = interventionFactory.build()

      const sentReferrals = [
        sentReferralFactory.build({
          referral: {
            interventionId: intervention.id,
          },
        }),
        sentReferralFactory.build({
          referral: {
            interventionId: intervention.id,
          },
        }),
      ]

      const sentReferralsSummary = [
        serviceProviderSentReferralSummaryFactory.fromReferralAndIntervention(sentReferrals[0], intervention).build({}),
        serviceProviderSentReferralSummaryFactory.fromReferralAndIntervention(sentReferrals[1], intervention).build({}),
      ]

      const deliusUser = deliusUserFactory.build()

      cy.stubGetIntervention(intervention.id, intervention)
      sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
      cy.stubGetSentReferralsForUserToken(sentReferrals)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGenerateServiceProviderPerformanceReport()
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken(sentReferralsSummary)

      cy.login()

      cy.contains('Reporting').click()
      cy.contains('Reporting')

      cy.get('#from-date-day').clear().type('10')
      cy.get('#from-date-month').clear().type('6')
      cy.get('#from-date-year').clear().type('2021')
      cy.get('#to-date-day').clear().type('27')
      cy.get('#to-date-month').clear().type('6')
      cy.get('#to-date-year').clear().type('2021')

      cy.contains('Request data').click()

      cy.get('h1').contains('Your request has been submitted')

      cy.contains('Return to dashboard').click()
      cy.location('pathname').should('equal', `/service-provider/dashboard`)
    })
  })
})
