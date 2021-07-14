Cypress.Commands.add('stubGetDraftReferral', (id, responseJson) => {
  cy.task('stubGetDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubCreateDraftReferral', responseJson => {
  cy.task('stubCreateDraftReferral', { responseJson })
})

Cypress.Commands.add('stubPatchDraftReferral', (id, responseJson) => {
  cy.task('stubPatchDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubSetDesiredOutcomesForServiceCategory', (referralId, responseJson) => {
  cy.task('stubSetDesiredOutcomesForServiceCategory', { referralId, responseJson })
})

Cypress.Commands.add('stubSetComplexityLevelForServiceCategory', (referralId, responseJson) => {
  cy.task('stubSetComplexityLevelForServiceCategory', { referralId, responseJson })
})

Cypress.Commands.add('stubGetServiceCategory', (id, responseJson) => {
  cy.task('stubGetServiceCategory', { id, responseJson })
})

Cypress.Commands.add('stubGetDraftReferralsForUserToken', responseJson => {
  cy.task('stubGetDraftReferralsForUserToken', { responseJson })
})

Cypress.Commands.add('stubSendDraftReferral', (id, responseJson) => {
  cy.task('stubSendDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferral', (id, responseJson) => {
  cy.task('stubGetSentReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetSentReferralsForUserToken', responseJson => {
  cy.task('stubGetSentReferralsForUserToken', { responseJson })
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

Cypress.Commands.add('stubUpdateActionPlanActivity', (actionPlanId, activityId, responseJson) => {
  cy.task('stubUpdateActionPlanActivity', { actionPlanId, activityId, responseJson })
})

Cypress.Commands.add('stubSubmitActionPlan', (id, responseJson) => {
  cy.task('stubSubmitActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubRecordActionPlanAppointmentAttendance', (actionPlanId, sessionNumber, responseJson) => {
  cy.task('stubRecordActionPlanAppointmentAttendance', { actionPlanId, sessionNumber, responseJson })
})

Cypress.Commands.add('stubRecordActionPlanAppointmentBehavior', (actionPlanId, sessionNumber, responseJson) => {
  cy.task('stubRecordActionPlanAppointmentBehavior', { actionPlanId, sessionNumber, responseJson })
})

Cypress.Commands.add('stubGetActionPlanAppointments', (id, responseJson) => {
  cy.task('stubGetActionPlanAppointments', { id, responseJson })
})

Cypress.Commands.add('stubGetActionPlanAppointment', (id, session, responseJson) => {
  cy.task('stubGetActionPlanAppointment', { id, session, responseJson })
})

Cypress.Commands.add('stubUpdateActionPlanAppointment', (id, session, responseJson) => {
  cy.task('stubUpdateActionPlanAppointment', { id, session, responseJson })
})

Cypress.Commands.add('stubSubmitActionPlanSessionFeedback', (actionPlanId, session, responseJson) => {
  cy.task('stubSubmitActionPlanSessionFeedback', { actionPlanId, session, responseJson })
})

Cypress.Commands.add('stubGetEndOfServiceReport', (id, responseJson) => {
  cy.task('stubGetEndOfServiceReport', { id, responseJson })
})

Cypress.Commands.add('stubCreateDraftEndOfServiceReport', responseJson => {
  cy.task('stubCreateDraftEndOfServiceReport', { responseJson })
})

Cypress.Commands.add('stubUpdateDraftEndOfServiceReport', (id, responseJson) => {
  cy.task('stubUpdateDraftEndOfServiceReport', { id, responseJson })
})

Cypress.Commands.add('stubSubmitEndOfServiceReport', (id, responseJson) => {
  cy.task('stubSubmitEndOfServiceReport', { id, responseJson })
})

Cypress.Commands.add('stubEndReferral', (referralId, responseJson) => {
  cy.task('stubEndReferral', { referralId, responseJson })
})

Cypress.Commands.add('stubGetReferralCancellationReasons', responseJson => {
  cy.task('stubGetReferralCancellationReasons', { responseJson })
})

Cypress.Commands.add('stubRecordAppointmentAttendance', (id, responseJson) => {
  cy.task('stubRecordAppointmentAttendance', { id, responseJson })
})

Cypress.Commands.add('stubRecordAppointmentBehavior', (id, responseJson) => {
  cy.task('stubRecordAppointmentBehavior', { id, responseJson })
})

Cypress.Commands.add('stubGetSupplierAssessment', (referralId, responseJson) => {
  cy.task('stubGetSupplierAssessment', { referralId, responseJson })
})

Cypress.Commands.add('stubScheduleSupplierAssessmentAppointment', (supplierAssessmentId, responseJson) => {
  cy.task('stubScheduleSupplierAssessmentAppointment', { supplierAssessmentId, responseJson })
})

Cypress.Commands.add('stubSubmitAppointmentFeedback', (id, responseJson) => {
  cy.task('stubSubmitAppointmentFeedback', { id, responseJson })
})

Cypress.Commands.add('stubGenerateServiceProviderPerformanceReport', () => {
  cy.task('stubGenerateServiceProviderPerformanceReport', {})
})
