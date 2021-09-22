Cypress.Commands.add('stubGetSupplementaryRiskInformation', (riskId, responseJson) => {
  cy.task('stubGetSupplementaryRiskInformation', { riskId, responseJson })
})

Cypress.Commands.add('stubGetSupplementaryRiskInformationForCrn', (crn, responseJson) => {
  cy.task('stubGetSupplementaryRiskInformationForCrn', { crn, responseJson })
})

Cypress.Commands.add('stubGetRiskSummary', (crn, responseJson) => {
  cy.task('stubGetRiskSummary', { crn, responseJson })
})
