import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'

describe('End of Service Reports', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('as a Service Provider', () => {
    beforeEach(() => {
      cy.task('stubServiceProviderToken')
      cy.task('stubServiceProviderAuthUser')
    })

    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ]

    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })
    const accommodationIntervention = interventionFactory.build({
      contractType: { code: 'SOC', name: 'Social inclusion' },
      serviceCategories: [serviceCategory],
    })

    const selectedDesiredOutcomes = [desiredOutcomes[0], desiredOutcomes[1]]
    const selectedDesiredOutcomesIds = selectedDesiredOutcomes.map(outcome => outcome.id)
    const referralParams = {
      referral: {
        interventionId: accommodationIntervention.id,
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = deliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const referral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })
    const actionPlan = actionPlanFactory.submitted(referral.id).build()
    referral.actionPlanId = actionPlan.id

    beforeEach(() => {
      cy.stubGetSentReferralsForUserToken([referral])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(deliusUser.username, deliusUser)
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.stubGetActionPlanAppointments(actionPlan.id, [])
    })

    it('User fills in, reviews, changes, and submits an end of service report', () => {
      const referralNeedingEndOfServiceReport = { ...referral, endOfServiceReportCreationRequired: true }
      const draftEndOfServiceReport = endOfServiceReportFactory
        .justCreated()
        .build({ referralId: referralNeedingEndOfServiceReport.id })

      cy.stubCreateDraftEndOfServiceReport(draftEndOfServiceReport)
      cy.stubGetEndOfServiceReport(draftEndOfServiceReport.id, draftEndOfServiceReport)
      cy.stubGetSentReferral(referralNeedingEndOfServiceReport.id, referralNeedingEndOfServiceReport)

      cy.login()

      cy.visit(`/service-provider/referrals/${referralNeedingEndOfServiceReport.id}/progress`)
      cy.contains('Create end of service report').click()

      cy.location('pathname').should(
        'equal',
        `/service-provider/end-of-service-report/${draftEndOfServiceReport.id}/outcomes/1`
      )

      cy.contains('Accommodation: End of service report')
      cy.contains('About desired outcome 1')
      cy.contains(selectedDesiredOutcomes[0].description)

      cy.withinFieldsetThatContains('Overall, did Alex achieve desired outcome 1?', () => {
        cy.contains('Achieved').click()
      })
      cy.contains('Do you have any further comments about their progression on this outcome?').type(
        'They have done very well'
      )
      cy.contains('Is there anything else that needs doing to achieve this outcome?').type('They could still do x')

      const endOfServiceReportWithFirstOutcome = {
        ...draftEndOfServiceReport,
        outcomes: [
          {
            desiredOutcome: selectedDesiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'They have done very well',
            additionalTaskComments: 'They could still do x',
          },
        ],
      }
      cy.stubUpdateDraftEndOfServiceReport(endOfServiceReportWithFirstOutcome.id, endOfServiceReportWithFirstOutcome)
      cy.stubGetEndOfServiceReport(endOfServiceReportWithFirstOutcome.id, endOfServiceReportWithFirstOutcome)

      cy.contains('Save and continue').click()

      cy.contains('Accommodation: End of service report')
      cy.contains('About desired outcome 2')
      cy.contains(selectedDesiredOutcomes[1].description)

      cy.withinFieldsetThatContains('Overall, did Alex achieve desired outcome 2?', () => {
        cy.contains('Partially achieved').click()
      })
      cy.contains('Do you have any further comments about their progression on this outcome?').type(
        'They have done fairly well'
      )
      cy.contains('Is there anything else that needs doing to achieve this outcome?').type(
        'They could still do x, y, and z'
      )

      const endOfServiceReportWithSecondOutcome = {
        ...draftEndOfServiceReport,
        outcomes: [
          ...endOfServiceReportWithFirstOutcome.outcomes,
          {
            desiredOutcome: selectedDesiredOutcomes[1],
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'They have done fairly well',
            additionalTaskComments: 'They could still do x, y, and z',
          },
        ],
      }
      cy.stubUpdateDraftEndOfServiceReport(endOfServiceReportWithSecondOutcome.id, endOfServiceReportWithSecondOutcome)
      cy.stubGetEndOfServiceReport(endOfServiceReportWithSecondOutcome.id, endOfServiceReportWithSecondOutcome)

      cy.contains('Save and continue').click()

      cy.contains('Accommodation: End of service report')
      cy.contains('Would you like to give any additional information about this intervention (optional)?')
      cy.contains(
        'Provide any further information that you believe is important for the probation practitioner to know.'
      ).type('You should know x and y')

      const endOfServiceReportWithFurtherInformation = {
        ...endOfServiceReportWithSecondOutcome,
        furtherInformation: 'You should know x and y',
      }
      cy.stubUpdateDraftEndOfServiceReport(
        endOfServiceReportWithFurtherInformation.id,
        endOfServiceReportWithFurtherInformation
      )
      cy.stubGetEndOfServiceReport(
        endOfServiceReportWithFurtherInformation.id,
        endOfServiceReportWithFurtherInformation
      )

      cy.contains('Save and continue').click()

      cy.contains('Review the end of service report')

      cy.get('#change-outcome-2').click()
      cy.contains('Do you have any further comments about their progression on this outcome?')
        .type('{selectall}{backspace}')
        .type('I think that overall it’s gone well but they could make some changes')

      cy.contains('Save and continue').click()

      cy.contains('Would you like to give any additional information about this intervention (optional)?')
      cy.contains(
        'Provide any further information that you believe is important for the probation practitioner to know.'
      )
        .type('{selectall}{backspace}')
        .type('It’s important that you know p and q')

      cy.contains('Save and continue').click()

      cy.contains('Review the end of service report')

      const submittedEndOfServiceReport = {
        ...endOfServiceReportWithFurtherInformation,
        submittedAt: new Date().toISOString(),
      }

      cy.stubGetSentReferral(referral.id, {
        ...referralNeedingEndOfServiceReport,
        endOfServiceReport: submittedEndOfServiceReport,
      })
      cy.stubSubmitEndOfServiceReport(submittedEndOfServiceReport.id, submittedEndOfServiceReport)

      cy.contains('Submit the report').click()

      cy.contains('End of service report submitted')

      cy.contains('Return to service progress').click()
      cy.get('#end-of-service-report-status').contains('Submitted')
    })

    it('User views a submitted End of Service Report', () => {
      const submittedEndOfServiceReport = endOfServiceReportFactory.submitted().build({
        referralId: referral.id,
        outcomes: [
          {
            desiredOutcome: selectedDesiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'They have done very well',
            additionalTaskComments: 'They could still do x',
          },
          {
            desiredOutcome: selectedDesiredOutcomes[1],
            achievementLevel: 'PARTIALLY_ACHIEVED',
            progressionComments: 'They have done fairly well',
            additionalTaskComments: 'They could still do x, y, and z',
          },
        ],
        furtherInformation: 'You should know x and y',
      })

      referral.endOfServiceReport = submittedEndOfServiceReport
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetEndOfServiceReport(submittedEndOfServiceReport.id, submittedEndOfServiceReport)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.contains('View submitted report').click()

      cy.contains('They have done very well')
      cy.contains('They could still do x')

      cy.contains('They have done fairly well')
      cy.contains('They could still do x, y, and z')
    })
  })

  describe('as a Probation Practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')
    })

    it('user views an end of service report', () => {
      cy.stubGetSentReferralsForUserToken([])
      cy.login()
      const serviceCategory1 = serviceCategoryFactory.build()
      const serviceCategory2 = serviceCategoryFactory.build({
        desiredOutcomes: [
          {
            id: '2d63bedc-9658-40c4-9d31-da649396ace1',
            description: 'Some other desired outcome',
          },
        ],
      })
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategory1, serviceCategory2] })
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.build({
        referral: {
          interventionId: intervention.id,
          serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
          desiredOutcomes: [
            { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: [serviceCategory1.desiredOutcomes[0].id] },
            { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [serviceCategory2.desiredOutcomes[0].id] },
          ],
          serviceUser: { crn: deliusServiceUser.otherIds.crn },
        },
      })
      const endOfServiceReport = endOfServiceReportFactory.build({
        referralId: referral.id,
        outcomes: [
          {
            desiredOutcome: serviceCategory1.desiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'Some progression comments for serviceCategory1',
            additionalTaskComments: 'Some task comments for serviceCategory1',
          },
          {
            desiredOutcome: serviceCategory2.desiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'Some progression comments for serviceCategory2',
            additionalTaskComments: 'Some task comments for serviceCategory2',
          },
        ],
        furtherInformation: 'Some further information',
      })

      cy.stubGetEndOfServiceReport(endOfServiceReport.id, endOfServiceReport)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetServiceCategory(serviceCategory1.id, serviceCategory1)
      cy.stubGetServiceCategory(serviceCategory2.id, serviceCategory2)
      cy.stubGetServiceUserByCRN(deliusServiceUser.otherIds.crn, deliusServiceUser)

      cy.visit(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)

      cy.contains('End of service report')
      cy.contains('The service provider has created an end of service report')
      cy.contains('Achieved')
      cy.contains(serviceCategory1.desiredOutcomes[0].description)
      cy.contains('Some progression comments for serviceCategory1')
      cy.contains('Some task comments for serviceCategory1')
      cy.contains(serviceCategory2.desiredOutcomes[0].description)
      cy.contains('Some progression comments for serviceCategory1')
      cy.contains('Some task comments for serviceCategory1')
      cy.contains('Some further information')
    })
  })
})
