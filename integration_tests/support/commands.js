Cypress.Commands.add('login', () => {
  cy.request(`/`)
  cy.task('getLoginUrl').then(cy.visit)
})

Cypress.Commands.add('withinFieldsetThatContains', (text, action) => {
  cy.contains(text).parent('fieldset').within(action)
})
