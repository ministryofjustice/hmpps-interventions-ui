Cypress.Commands.add('stubGetResponsibleOfficer', responseJson => {
  cy.task('stubGetResponsibleOfficer', { responseJson })
})
