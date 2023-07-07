Cypress.Commands.add('stubGetResponsibleOfficer', (crn, responseJson) => {
  cy.task('stubGetResponsibleOfficer', { crn, responseJson })
})

Cypress.Commands.add('stubGetCrnUserAccess', responseJson => {
  cy.task('stubGetCrnUserAccess', { responseJson })
})
