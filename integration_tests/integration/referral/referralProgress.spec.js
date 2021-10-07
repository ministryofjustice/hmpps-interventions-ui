import interventionFactory from '../../../testutils/factories/intervention'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'

describe('When viewing the referral progress page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
  })

  describe('as a Probation Practitioner', () => {
    beforeEach(() => {
      cy.task('stubProbationPractitionerToken')
      cy.task('stubProbationPractitionerAuthUser')
    })

    describe('probation practitioner views referral progress', () => {
      describe('for initial assessment feedback', () => {
        let assignedReferral
        beforeEach(() => {
          cy.stubGetSentReferralsForUserToken([])
          const intervention = interventionFactory.build()
          const conviction = deliusConvictionFactory.build()
          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'John',
            lastName: 'Smith',
            username: 'john.smith',
          })
          assignedReferral = sentReferralFactory.build({
            assignedTo: { username: hmppsAuthUser.username },
            referral: {
              interventionId: intervention.id,
              serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
            },
          })
          const deliusUser = deliusUserFactory.build()
          cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
          cy.stubGetIntervention(intervention.id, intervention)
          cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUserFactory.build())
          cy.stubGetExpandedServiceUserByCRN(
            assignedReferral.referral.serviceUser.crn,
            expandedDeliusServiceUserFactory.build()
          )
          cy.stubGetConvictionById(assignedReferral.referral.serviceUser.crn, conviction.convictionId, conviction)
          cy.stubGetUserByUsername(deliusUser.username, deliusUser)
          cy.stubGetSupplementaryRiskInformation(
            assignedReferral.supplementaryRiskId,
            supplementaryRiskInformationFactory.build()
          )

          cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
        })
        describe('when the referral has been assigned and the appointment scheduled', () => {
          describe('and the appointment is in the past', () => {
            it('should show the initial appointment as awaiting feedback and a link to view appointment details', () => {
              const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
                durationInMinutes: 75,
                appointmentDeliveryType: 'PHONE_CALL',
              })
              const supplierAssessment = supplierAssessmentFactory.build({
                appointments: [appointmentWithNoFeedback],
                currentAppointmentId: appointmentWithNoFeedback.id,
              })
              cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
              cy.login()
              cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

              cy.contains('Initial assessment appointment')
                .next()
                .contains('The appointment has been scheduled by the supplier')
                .next()
                .within(() => {
                  cy.contains('Caseworker').next().contains('John Smith')
                  cy.contains('Appointment status').next().contains('awaiting feedback')
                  cy.contains('To do').next().contains('View appointment details').click()
                  cy.location('pathname').should(
                    'equal',
                    `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment`
                  )
                })
            })
          })

          describe('and the appointment is in the future', () => {
            it('should show the initial appointment as scheduled and a link to view appointment details', () => {
              const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inTheFuture.build({
                durationInMinutes: 75,
                appointmentDeliveryType: 'PHONE_CALL',
              })
              const supplierAssessment = supplierAssessmentFactory.build({
                appointments: [appointmentWithNoFeedback],
                currentAppointmentId: appointmentWithNoFeedback.id,
              })
              cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
              cy.login()
              cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

              cy.contains('Initial assessment appointment')
                .next()
                .contains('The appointment has been scheduled by the supplier')
                .next()
                .within(() => {
                  cy.contains('Caseworker').next().contains('John Smith')
                  cy.contains('Appointment status').next().contains('scheduled')
                  cy.contains('To do').next().contains('View appointment details').click()
                  cy.location('pathname').should(
                    'equal',
                    `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment`
                  )
                })
            })
          })
        })
        describe('when the referral has been assigned and the appointment delivered and attended', () => {
          it('should show the initial appointment as completed and a link to view the feedback', () => {
            const supplierAssessment = supplierAssessmentFactory.withAttendedAppointment.build()
            cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
            cy.login()
            cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

            cy.contains('Initial assessment appointment')
              .next()
              .contains('The initial assessment has been delivered and feedback added.')
              .next()
              .within(() => {
                cy.contains('Caseworker').next().contains('John Smith')
                cy.contains('Appointment status').next().contains('completed')
                cy.contains('To do').next().contains('View feedback').click()
                cy.location('pathname').should(
                  'equal',
                  `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment/post-assessment-feedback`
                )
              })
          })
        })
        describe('when the referral has been assigned and the appointment delivered but not attended', () => {
          it('should show the initial appointment as not attended and a link to view the feedback', () => {
            const supplierAssessment = supplierAssessmentFactory.withNonAttendedAppointment.build()
            cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessment)
            cy.login()
            cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

            cy.contains('Initial assessment appointment')
              .next()
              .contains('The initial assessment has been delivered and feedback added.')
              .next()
              .within(() => {
                cy.contains('Caseworker').next().contains('John Smith')
                cy.contains('Appointment status').next().contains('did not attend')
                cy.contains('To do').next().contains('View feedback').click()
                cy.location('pathname').should(
                  'equal',
                  `/probation-practitioner/referrals/${assignedReferral.id}/supplier-assessment/post-assessment-feedback`
                )
              })
          })
        })
      })
    })
  })
})
