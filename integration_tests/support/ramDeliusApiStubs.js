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

Cypress.Commands.add('stubGetConvictionsByCrn', (crn, responseJson) => {
  cy.task('stubGetConvictionsByCrn', { crn, responseJson })
})

Cypress.Commands.add('stubGetConvictionByCrnAndId', (crn, id, responseJson) => {
  cy.task('stubGetConvictionByCrnAndId', { crn, id, responseJson })
})
