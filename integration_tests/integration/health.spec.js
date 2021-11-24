context('Healthcheck', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubAuthPing')
    cy.task('stubTokenVerificationPing')
  })

  it('Health check page is visible', () => {
    cy.request('/health').its('body.healthy').should('equal', true)
  })
  it('Liveness check page is visible', () => {
    cy.request('/health/liveness').its('body.healthy').should('equal', true)
  })
  it('Readiness check page is visible', () => {
    cy.request('/health/readiness').its('body.healthy').should('equal', true)
  })
})
