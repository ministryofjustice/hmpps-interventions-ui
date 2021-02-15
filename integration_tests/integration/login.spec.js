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
      cy.stubGetDraftReferralsForUser([])
      cy.login()
    })

    it('the user is redirected to the referral start page', () => {
      cy.location('pathname').should('equal', '/probation-practitioner/dashboard')
    })

    it('the user name is visible in the header', () => {
      cy.get('[data-qa=header-user-name]').should('contain.text', 'J. Smith')
    })

    it('the user can log out', () => {
      cy.get('[data-qa=logout]').click()
      AuthLoginPage.verifyOnPage()
    })
  })

  describe('after logging in as a service provider', () => {
    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')
      cy.stubGetSentReferrals([])
      cy.login()
    })

    it('the user is redirected to the service provider dashboard', () => {
      cy.visit('/')
      cy.location('pathname').should('equal', '/service-provider/dashboard')
    })

    it('the user name is visible in the header', () => {
      cy.get('[data-qa=header-user-name]').should('contain.text', 'J. Smith')
    })

    it('the user can log out', () => {
      cy.get('[data-qa=logout]').click()
      AuthLoginPage.verifyOnPage()
    })
  })
})
