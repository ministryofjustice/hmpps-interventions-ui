Cypress.Commands.add('stubGetDraftReferral', (id, responseJson) => {
  cy.task('stubGetDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubCreateDraftReferral', responseJson => {
  cy.task('stubCreateDraftReferral', { responseJson })
})

Cypress.Commands.add('stubPatchDraftReferral', (id, responseJson) => {
  cy.task('stubPatchDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetServiceCategory', (id, responseJson) => {
  cy.task('stubGetServiceCategory', { id, responseJson })
})

Cypress.Commands.add('stubGetDraftReferralsForUser', responseJson => {
  cy.task('stubGetDraftReferralsForUser', { responseJson })
})

Cypress.Commands.add('stubGetServiceProvider', (id, responseJson) => {
  cy.task('stubGetServiceProvider', { id, responseJson })
})

Cypress.Commands.add('stubSendDraftReferral', (id, responseJson) => {
  cy.task('stubSendDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferral', (id, responseJson) => {
  cy.task('stubGetSentReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferrals', responseJson => {
  cy.task('stubGetSentReferrals', { responseJson })
})
