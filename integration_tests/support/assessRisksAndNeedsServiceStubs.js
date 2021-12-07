Cypress.Commands.add('stubGetSupplementaryRiskInformation', (riskId, responseJson) => {
  cy.task('stubGetSupplementaryRiskInformation', { riskId, responseJson })
})

Cypress.Commands.add('stubGetRiskSummary', (crn, responseJson) => {
  cy.task('stubGetRiskSummary', { crn, responseJson })
})
