Cypress.Commands.add('stubGetPrisons', responseJson => {
  cy.task('stubGetPrisons', { responseJson })
})
