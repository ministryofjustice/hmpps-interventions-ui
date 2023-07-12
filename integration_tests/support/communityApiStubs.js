Cypress.Commands.add('stubGetActiveConvictionsByCRN', (crn, responseJson) => {
  cy.task('stubGetActiveConvictionsByCRN', { crn, responseJson })
})

Cypress.Commands.add('stubGetConvictionById', (crn, id, responseJson) => {
  cy.task('stubGetConvictionById', { crn, id, responseJson })
})

Cypress.Commands.add('stubGetResponsibleOfficerForServiceUser', (crn, responseJson) => {
  cy.task('stubGetResponsibleOfficerForServiceUser', { crn, responseJson })
})
