import pageFactory from '../../testutils/factories/page'

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

      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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

    it('the user can view the accessibility statement', () => {
      cy.contains('Accessibility').click()
      cy.location('pathname').should('equal', `/accessibility-statement`)
    })

    it('the user can sign out', () => {
      cy.location('pathname').should('eq', '/probation-practitioner/dashboard')
      cy.get('[data-qa=sign-out]').click()
      cy.location('pathname').should('eq', '/sign-out/success')
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
      cy.stubGetSentReferralsForUserTokenPaged(pageFactory.pageContent([]).build())
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

    it('the user can sign out', () => {
      cy.location('pathname').should('eq', '/service-provider/dashboard')
      cy.get('[data-qa=sign-out]').click()
      cy.location('pathname').should('eq', '/sign-out/success')
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
