Cypress.Commands.add('stubGetResponsibleOfficer', (crn, responseJson) => {
  cy.task('stubGetResponsibleOfficer', { crn, responseJson })
})

Cypress.Commands.add('stubGetCrnUserAccess', responseJson => {
  cy.task('stubGetCrnUserAccess', { responseJson })
})

Cypress.Commands.add('stubGetUserByUsername', (username, responseJson) => {
  cy.task('stubGetUserByUsername', { username, responseJson })
})

Cypress.Commands.add('stubGetCaseDetailsByCrn', (crn, responseJson) => {
  cy.task('stubGetCaseDetailsByCrn', { crn, responseJson })
})
