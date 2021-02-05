Cypress.Commands.add('stubGetServiceUserByCRN', (crn, responseJson) => {
  cy.task('stubGetServiceUserByCRN', { crn, responseJson })
})

Cypress.Commands.add('stubGetUserByUsername', (username, responseJson) => {
  cy.task('stubGetUserByUsername', { username, responseJson })
})
