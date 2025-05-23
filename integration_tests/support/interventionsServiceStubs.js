Cypress.Commands.add('stubGetDraftReferral', (id, responseJson) => {
  cy.task('stubGetDraftReferral', { id, responseJson })
})

Cypress.Commands.add('stubGetPrisonerDetails', (crn, responseJson) => {
  cy.task('stubGetPrisonerDetails', { crn, responseJson })
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

Cypress.Commands.add('stubGetServiceCategoryByIdAndContractReference', (id, contractReference, responseJson) => {
  cy.task('stubGetServiceCategoryByIdAndContractReference', { id, contractReference, responseJson })
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

Cypress.Commands.add('stubGetSentReferralsForUserTokenPaged', responseJson => {
  cy.task('stubGetSentReferralsForUserTokenPaged', { responseJson })
})

Cypress.Commands.add('stubGetServiceProviderSentReferralsSummaryForUserToken', responseJson => {
  cy.task('stubGetServiceProviderSentReferralsSummaryForUserToken', { responseJson })
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

Cypress.Commands.add('stubAddInterventionNewUser', () => {
  cy.task('stubAddInterventionNewUser')
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

Cypress.Commands.add('stubApproveActionPlan', (id, responseJson) => {
  cy.task('stubApproveActionPlan', { id, responseJson })
})

Cypress.Commands.add('stubGetApprovedActionPlanSummaries', (id, responseJson) => {
  cy.task('stubGetApprovedActionPlanSummaries', { id, responseJson })
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

Cypress.Commands.add('stubRecordActionPlanAppointmentSessionFeedback', (actionPlanId, sessionNumber, responseJson) => {
  cy.task('stubRecordActionPlanAppointmentSessionFeedback', { actionPlanId, sessionNumber, responseJson })
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

Cypress.Commands.add('stubUpdateActionPlanAppointmentClash', (actionPlanId, sessionNumber) => {
  cy.task('stubUpdateActionPlanAppointmentClash', { actionPlanId, sessionNumber })
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

Cypress.Commands.add('stubRecordSupplierAssessmentAppointmentAttendance', (referralId, responseJson) => {
  cy.task('stubRecordSupplierAssessmentAppointmentAttendance', { referralId, responseJson })
})

Cypress.Commands.add('stubRecordSupplierAssessmentAppointmentSessionFeedback', (referralId, responseJson) => {
  cy.task('stubRecordSupplierAssessmentAppointmentSessionFeedback', { referralId, responseJson })
})

Cypress.Commands.add('stubGetSupplierAssessment', (referralId, responseJson) => {
  cy.task('stubGetSupplierAssessment', { referralId, responseJson })
})

Cypress.Commands.add('stubScheduleSupplierAssessmentAppointment', (supplierAssessmentId, responseJson) => {
  cy.task('stubScheduleSupplierAssessmentAppointment', { supplierAssessmentId, responseJson })
})

Cypress.Commands.add('stubScheduleSupplierAssessmentAppointmentClash', supplierAssessmentId => {
  cy.task('stubScheduleSupplierAssessmentAppointmentClash', { supplierAssessmentId })
})

Cypress.Commands.add('stubSubmitSupplierAssessmentAppointmentFeedback', (referralId, responseJson) => {
  cy.task('stubSubmitSupplierAssessmentAppointmentFeedback', { referralId, responseJson })
})

Cypress.Commands.add('stubGenerateServiceProviderPerformanceReport', () => {
  cy.task('stubGenerateServiceProviderPerformanceReport', {})
})

Cypress.Commands.add('stubGetCaseNotes', (referralId, responseJson) => {
  cy.task('stubGetCaseNotes', { referralId, responseJson })
})

Cypress.Commands.add('stubAddCaseNote', responseJson => {
  cy.task('stubAddCaseNote', { responseJson })
})

Cypress.Commands.add('stubGetCaseNote', (caseNoteId, responseJson) => {
  cy.task('stubGetCaseNote', { caseNoteId, responseJson })
})

Cypress.Commands.add('stubGetMyInterventions', responseJson => {
  cy.task('stubGetMyInterventions', { responseJson })
})

Cypress.Commands.add('stubPatchDraftOasysRiskInformation', (referralId, responseJson) => {
  cy.task('stubPatchDraftOasysRiskInformation', { referralId, responseJson })
})

Cypress.Commands.add('stubGetDraftOasysRiskInformation', (referralId, responseJson) => {
  cy.task('stubGetDraftOasysRiskInformation', { referralId, responseJson })
})

Cypress.Commands.add('stubUpdateSentReferralDetails', (referralId, responseJson) => {
  cy.task('stubUpdateSentReferralDetails', { referralId, responseJson })
})

Cypress.Commands.add('stubUpdateDesiredOutcomesForServiceCategory', (referralId, serviceCategoryId, responseJson) => {
  cy.task('stubUpdateDesiredOutcomesForServiceCategory', { referralId, serviceCategoryId, responseJson })
})

Cypress.Commands.add('stubAmendComplexityLevelForServiceCategory', (referralId, serviceCategoryId, responseJson) => {
  cy.task('stubAmendComplexityLevelForServiceCategory', { referralId, serviceCategoryId, responseJson })
})

Cypress.Commands.add('stubAmendAccessibilityNeeds', (referralId, responseJson) => {
  cy.task('stubAmendAccessibilityNeeds', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendAdditionalInformation', (referralId, responseJson) => {
  cy.task('stubAmendAdditionalInformation', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendPrisonEstablishment', (referralId, responseJson) => {
  cy.task('stubAmendPrisonEstablishment', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendExpectedReleaseDate', (referralId, responseJson) => {
  cy.task('stubAmendExpectedReleaseDate', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendProbationPractitionerName', (referralId, responseJson) => {
  cy.task('stubAmendProbationPractitionerName', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendProbationPractitionerEmail', (referralId, responseJson) => {
  cy.task('stubAmendProbationPractitionerEmail', { referralId, responseJson })
})

Cypress.Commands.add('stubAmendProbationPractitionerPhoneNumber', (referralId, responseJson) => {
  cy.task('stubAmendProbationPractitionerPhoneNumber', { referralId, responseJson })
})
