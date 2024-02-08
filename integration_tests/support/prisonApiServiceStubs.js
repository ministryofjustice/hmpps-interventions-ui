Cypress.Commands.add('stubGetSecuredChildAgencies', responseJson => {
  cy.task('stubGetSecuredChildAgencies', { responseJson })
})
