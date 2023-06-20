Cypress.Commands.add('stubGetResponsibleOfficer', responseJson => {
  cy.task('stubGetResponsibleOfficer', { responseJson })
})

Cypress.Commands.add('stubGetCrnUserAccess', responseJson => {
  cy.task('stubGetCrnUserAccess', { responseJson })
})
