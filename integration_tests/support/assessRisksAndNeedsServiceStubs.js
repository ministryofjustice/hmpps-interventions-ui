Cypress.Commands.add('stubGetSupplementaryRiskInformation', (riskId, responseJson) => {
  cy.task('stubGetSupplementaryRiskInformation', { riskId, responseJson })
})
