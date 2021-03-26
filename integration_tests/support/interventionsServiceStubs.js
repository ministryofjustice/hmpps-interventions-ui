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

Cypress.Commands.add('stubSendDraftReferral', (id, responseJson) => {
  cy.task('stubSendDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferral', (id, responseJson) => {
  cy.task('stubGetSentReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferrals', responseJson => {
  cy.task('stubGetSentReferrals', { responseJson })
})

Cypress.Commands.add('stubAssignSentReferral', (id, responseJson) => {
  cy.task('stubAssignSentReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetInterventions', responseJson => {
  cy.task('stubGetInterventions', { responseJson })
})

Cypress.Commands.add('stubGetIntervention', (id, responseJson) => {
  cy.task('stubGetIntervention', { id, responseJson })
})

Cypress.Commands.add('stubGetPccRegions', responseJson => {
  cy.task('stubGetPccRegions', { responseJson })
})

Cypress.Commands.add('stubGetDraftActionPlan', (id, responseJson) => {
  cy.task('stubGetDraftActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubGetActionPlan', (id, responseJson) => {
  cy.task('stubGetActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubCreateDraftActionPlan', responseJson => {
  cy.task('stubCreateDraftActionPlan', { responseJson })
})

Cypress.Commands.add('stubUpdateDraftActionPlan', (id, responseJson) => {
  cy.task('stubUpdateDraftActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubSubmitActionPlan', (id, responseJson) => {
  cy.task('stubSubmitActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubRecordAppointmentAttendance', (actionPlanId, sessionNumber, responseJson) => {
  cy.task('stubRecordAppointmentAttendence', { actionPlanId, sessionNumber, responseJson })
})
