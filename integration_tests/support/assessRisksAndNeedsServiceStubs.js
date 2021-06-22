Cypress.Commands.add('stubGetSupplementaryRiskInformation', (riskId, responseJson) => {
  cy.task('stubGetSupplementaryRiskInformation', { riskId, responseJson })
})

Cypress.Commands.add('stubGetRiskSummary', (crn, responseJson) => {
  cy.task('stubGetRiskSummary', { crn, responseJson })
})

Cypress.Commands.add('stubGetRiskToSelf', (crn, responseJson) => {
  cy.task('stubGetRiskToSelf', { crn, responseJson })
})
