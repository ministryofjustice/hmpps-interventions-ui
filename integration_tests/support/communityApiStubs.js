Cypress.Commands.add('stubGetServiceUserByCRN', (crn, responseJson) => {
  cy.task('stubGetServiceUserByCRN', { crn, responseJson })
})
