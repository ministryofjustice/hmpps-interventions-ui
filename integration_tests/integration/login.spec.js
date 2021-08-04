const AuthLoginPage = require('../pages/authLogin')

context('Login', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/')
    AuthLoginPage.verifyOnPage()
  })

  describe('after logging in as a probation practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetDraftReferralsForUserToken([])
      cy.login()
    })

    it('the user is redirected to the referral start page', () => {
      cy.location('pathname').should('equal', '/probation-practitioner/dashboard')
    })

    it('the user name is visible in the header', () => {
      cy.get('[data-qa=header-user-name]').should('contain.text', 'J. Smith')
    })

    it('the user can report a problem', () => {
      cy.contains('Report a problem').click()
      cy.location('pathname').should('equal', `/report-a-problem`)
      cy.contains('To report a problem with this digital service, please contact the helpdesk')
    })

    it('the user can log out', () => {
      cy.get('[data-qa=logout]').click()
      AuthLoginPage.verifyOnPage()
    })

    it('the user cannot access service provider pages', () => {
      cy.request({ url: '/service-provider/dashboard', failOnStatusCode: false }).its('status').should('equal', 403)

      cy.visit('/service-provider/dashboard', { failOnStatusCode: false })
      cy.contains('you are not authorised to access this page')
    })
  })

  describe('after logging in as a service provider', () => {
    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.login()
    })

    it('the user is redirected to the service provider dashboard', () => {
      cy.visit('/')
      cy.location('pathname').should('equal', '/service-provider/dashboard')
    })

    it('the user name is visible in the header', () => {
      cy.get('[data-qa=header-user-name]').should('contain.text', 'J. Smith')
    })

    it('the user can report a problem', () => {
      cy.contains('Report a problem').click()
      cy.location('pathname').should('equal', `/report-a-problem`)
      cy.contains('To report a problem with this digital service, please contact the helpdesk')
    })

    it('the user can log out', () => {
      cy.get('[data-qa=logout]').click()
      AuthLoginPage.verifyOnPage()
    })

    it('the user cannot access probation practitioner pages', () => {
      cy.request({ url: '/probation-practitioner/dashboard', failOnStatusCode: false })
        .its('status')
        .should('equal', 403)

      cy.visit('/probation-practitioner/dashboard', { failOnStatusCode: false })
      cy.contains('you are not authorised to access this page')
    })
  })
})
