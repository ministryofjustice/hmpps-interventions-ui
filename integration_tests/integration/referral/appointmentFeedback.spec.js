import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe('As a Service Provider', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  describe('Action plan session feedback', () => {
    describe('Recording post session feedback', () => {
      it('user records the Service user as having attended, and fills out behaviour screen', () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const accommodationIntervention = interventionFactory.build({
          contractType: { code: 'SOC', name: 'Social inclusion' },
          serviceCategories: [serviceCategory],
        })
        const referralParams = {
          id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
          referral: { interventionId: accommodationIntervention.id, serviceCategoryIds: [serviceCategory.id] },
        }
        const deliusServiceUser = deliusServiceUserFactory.build()
        const probationPractitioner = deliusUserFactory.build({
          firstName: 'John',
          surname: 'Smith',
          username: 'john.smith',
        })
        const actionPlan = actionPlanFactory.submitted().build({
          referralId: referralParams.id,
          numberOfSessions: 4,
        })

        const appointments = [
          actionPlanAppointmentFactory.build({
            sessionNumber: 1,
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          }),
          actionPlanAppointmentFactory.build({
            sessionNumber: 2,
            appointmentTime: '2021-03-31T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          }),
        ]

        const assignedReferral = sentReferralFactory.assigned().build({
          ...referralParams,
          assignedTo: { username: probationPractitioner.username },
          actionPlanId: actionPlan.id,
        })

        cy.stubGetSentReferralsForUserToken([assignedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.stubGetActionPlan(actionPlan.id, actionPlan)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetIntervention(accommodationIntervention.id, accommodationIntervention)
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

        cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
        cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
        cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

        const appointmentWithAttendanceRecorded = {
          ...appointments[0],
          sessionFeedback: {
            attendance: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex attended the session',
            },
          },
        }

        const appointmentWithBehaviourRecorded = {
          ...appointmentWithAttendanceRecorded,
          sessionFeedback: {
            attendance: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex attended the session',
            },
            behaviour: {
              behaviourDescription: 'Alex was well-behaved',
              notifyProbationPractitioner: false,
            },
          },
        }
        const appointmentWithSubmittedFeedback = {
          ...appointmentWithBehaviourRecorded,
          sessionFeedback: {
            attendance: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex attended the session',
            },
            behaviour: {
              behaviourDescription: 'Alex was well-behaved',
              notifyProbationPractitioner: false,
            },
            submitted: true,
          },
        }

        cy.login()

        cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

        cy.contains('Give feedback').click()

        cy.contains('Yes').click()
        cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

        cy.stubRecordActionPlanAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

        cy.contains('Save and continue').click()

        cy.contains('Add behaviour feedback')

        cy.contains("Describe Alex's behaviour in this session").type('Alex was well behaved')
        cy.contains('No').click()

        cy.stubRecordActionPlanAppointmentBehavior(actionPlan.id, 1, appointmentWithBehaviourRecorded)

        cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithBehaviourRecorded)

        cy.contains('Save and continue').click()

        cy.contains('Confirm feedback')
        cy.contains('Alex attended the session')
        cy.contains('Yes, they were on time')
        cy.contains('Alex was well-behaved')
        cy.contains('No')

        cy.stubSubmitActionPlanSessionFeedback(actionPlan.id, 1, appointmentWithSubmittedFeedback)

        cy.get('form').contains('Confirm').click()

        cy.contains('Session feedback added and submitted to the probation practitioner')
        cy.contains('You can now deliver the next session scheduled for 31 March 2021.')

        const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
        cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

        cy.contains('Return to service progress').click()

        cy.get('table')
          .getTable()
          .should('deep.equal', [
            {
              'Session details': 'Session 1',
              'Date and time': '9:02am on 24 Mar 2021',
              Status: 'completed',
              Action: 'View feedback form',
            },
            {
              'Session details': 'Session 2',
              'Date and time': '10:02am on 31 Mar 2021',
              Status: 'scheduled',
              Action: 'Reschedule sessionGive feedback',
            },
          ])
      })

      it('user records the Service user as having not attended, and skips behaviour screen', () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const intervention = interventionFactory.build({
          contractType: { code: 'ACC', name: 'accommodation' },
          serviceCategories: [serviceCategory],
        })
        const referralParams = {
          id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
          referral: { interventionId: intervention.id, serviceCategoryIds: [serviceCategory.id] },
        }
        const deliusServiceUser = deliusServiceUserFactory.build()
        const probationPractitioner = deliusUserFactory.build({
          firstName: 'John',
          surname: 'Smith',
          username: 'john.smith',
        })
        const actionPlan = actionPlanFactory.submitted().build({
          referralId: referralParams.id,
          numberOfSessions: 4,
        })

        const appointments = [
          actionPlanAppointmentFactory.build({
            sessionNumber: 1,
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          }),
          actionPlanAppointmentFactory.build({
            sessionNumber: 2,
            appointmentTime: '2021-03-31T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          }),
        ]

        const assignedReferral = sentReferralFactory.assigned().build({
          ...referralParams,
          assignedTo: { username: probationPractitioner.username },
          actionPlanId: actionPlan.id,
        })

        cy.stubGetSentReferralsForUserToken([assignedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.stubGetActionPlan(actionPlan.id, actionPlan)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())

        cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
        cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
        cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

        const appointmentWithAttendanceRecorded = {
          ...appointments[0],
          sessionFeedback: {
            attendance: {
              attended: 'no',
              additionalAttendanceInformation: "Alex didn't attend",
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        }

        const appointmentWithSubmittedFeedback = {
          ...appointmentWithAttendanceRecorded,
          sessionFeedback: {
            attendance: {
              attended: 'no',
              additionalAttendanceInformation: "Alex didn't attend",
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
            submitted: true,
          },
        }

        cy.login()

        cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

        cy.contains('Give feedback').click()

        cy.contains('No').click()
        cy.contains("Add additional information about Alex's attendance").type("Alex didn't attend")

        cy.stubRecordActionPlanAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

        cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentWithAttendanceRecorded)

        cy.contains('Save and continue').click()

        cy.contains('Confirm feedback')
        cy.contains('No')
        cy.contains("Alex didn't attend")

        cy.stubSubmitActionPlanSessionFeedback(actionPlan.id, 1, appointmentWithSubmittedFeedback)

        cy.get('form').contains('Confirm').click()

        cy.contains('Session feedback added and submitted to the probation practitioner')
        cy.contains('You can now deliver the next session scheduled for 31 March 2021.')

        const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
        cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

        cy.contains('Return to service progress').click()

        cy.get('table')
          .getTable()
          .should('deep.equal', [
            {
              'Session details': 'Session 1',
              'Date and time': '9:02am on 24 Mar 2021',
              Status: 'did not attend',
              Action: 'View feedback form',
            },
            {
              'Session details': 'Session 2',
              'Date and time': '10:02am on 31 Mar 2021',
              Status: 'scheduled',
              Action: 'Reschedule sessionGive feedback',
            },
          ])
      })
    })

    describe('Viewing session feedback', () => {
      const crn = 'X123456'
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const intervention = interventionFactory.build({
        contractType: { code: 'ACC', name: 'accommodation' },
        serviceCategories: [serviceCategory],
      })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: {
          interventionId: intervention.id,
          serviceCategoryId: serviceCategory.id,
          serviceUser: { crn },
        },
      }
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = deliusUserFactory.build({
        firstName: 'John',
        surname: 'Smith',
        username: 'john.smith',
      })
      const actionPlan = actionPlanFactory.submitted().build({
        referralId: referralParams.id,
        numberOfSessions: 4,
      })
      const appointmentsWithSubmittedFeedback = [
        actionPlanAppointmentFactory.scheduled().build({
          sessionNumber: 1,
          sessionFeedback: {
            attendance: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex attended the session',
            },
            behaviour: {
              behaviourDescription: 'Alex was well-behaved',
              notifyProbationPractitioner: false,
            },
            submitted: true,
          },
        }),
      ]
      beforeEach(() => {
        cy.stubGetActionPlan(actionPlan.id, actionPlan)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetActionPlanAppointments(actionPlan.id, appointmentsWithSubmittedFeedback)
        cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentsWithSubmittedFeedback[0])
        cy.stubGetServiceUserByCRN(crn, deliusServiceUser)
        cy.stubGetSupplierAssessment(referralParams.id, supplierAssessmentFactory.build())
      })

      it('allows users to know if, when and why an intervention was cancelled', () => {
        const endedReferral = sentReferralFactory
          .endRequested()
          .concluded()
          .build({
            ...referralParams,
          })
        cy.stubGetSentReferral(endedReferral.id, endedReferral)
        cy.stubGetSentReferralsForUserToken([endedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.login()
        cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
        cy.contains('Intervention ended')
        cy.contains(
          'The probation practitioner ended this intervention on 28 April 2021 with reason: Service user was recalled'
        )
        cy.contains('Please note that an end of service report must still be submitted within 10 working days.').should(
          'not.exist'
        )
        cy.contains("Additional information: you'll be seeing alex again soon i'm sure!")
      })

      it('allows users to know that they should still concluded non concluded but ended referrals', () => {
        const endedReferral = sentReferralFactory.endRequested().build({
          ...referralParams,
        })
        cy.stubGetSentReferral(endedReferral.id, endedReferral)
        cy.stubGetSentReferralsForUserToken([endedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.login()
        cy.visit(`/service-provider/referrals/${endedReferral.id}/progress`)
        cy.contains('Please note that an end of service report must still be submitted within 10 working days.')
      })

      it('allows users to click through to a page to view session feedback', () => {
        const assignedReferral = sentReferralFactory.assigned().build({
          ...referralParams,
          assignedTo: { username: probationPractitioner.username },
          actionPlanId: actionPlan.id,
        })
        cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
        cy.stubGetSentReferralsForUserToken([assignedReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.login()
        cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
        cy.contains('Intervention cancelled').should('not.exist')
        cy.contains('View feedback form').click()
        cy.contains('Alex attended the session')
        cy.contains('Yes, they were on time')
        cy.contains('Alex was well-behaved')
        cy.contains('No')
      })
    })
  })

  describe('Supplier assessment feedback', () => {
    describe('Recording supplier assessment feedback', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const probationPractitioner = deliusUserFactory.build({
        firstName: 'John',
        surname: 'Smith',
        username: 'john.smith',
      })
      const sentReferral = sentReferralFactory.assigned().build({
        id: 'f437a412-078f-4bbf-82d8-569c2eb9ddb9',
        assignedTo: { username: probationPractitioner.username },
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      beforeEach(() => {
        cy.stubGetSentReferralsForUserToken([sentReferral])
        cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
        cy.stubGetIntervention(intervention.id, intervention)
        cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
        cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
        cy.stubGetSentReferral(sentReferral.id, sentReferral)
        cy.stubGetServiceUserByCRN(sentReferral.referral.serviceUser.crn, deliusServiceUser)
      })

      describe('when user records the attendance as not attended', () => {
        it('should allow user to add attendance, check their answers and submit the referral', () => {
          const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          })
          let supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithNoFeedback],
            currentAppointmentId: appointmentWithNoFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.login()

          cy.visit(`/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('awaiting feedback')
              cy.contains('To do').next().contains('Add feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
              )
            })
          cy.contains('No').click()
          cy.contains("Add additional information about Alex's attendance").type('Alex did not attend the session')

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'no',
                additionalAttendanceInformation: 'Alex did not attend the session',
              },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithAttendanceFeedback],
            currentAppointmentId: appointmentWithAttendanceFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentAttendance(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )

          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('Did Alex attend the initial assessment appointment?')
          cy.contains('No')
          cy.contains("Add additional information about Alex's attendance:")
          cy.contains('Alex did not attend the session')

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Initial assessment added')

          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'John',
            lastName: 'Smith',
            username: 'john.smith',
          })
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'no',
                additionalAttendanceInformation: 'Alex did not attend this session',
              },
              submitted: true,
              submittedBy: { username: hmppsAuthUser.username, userId: hmppsAuthUser.username, authSource: 'auth' },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [submittedAppointment],
            currentAppointmentId: submittedAppointment.id,
          })
          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.contains('Return to progress').click()
          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('did not attend')
              cy.contains('To do').next().contains('Reschedule').click()
              cy.location('pathname').should(
                'match',
                new RegExp(
                  `/service-provider/referrals/${sentReferral.id}/supplier-assessment/schedule/[a-z0-9-]+/details`
                )
              )
            })
        })
      })

      describe('when user records the attendance as attended', () => {
        it('should allow user to add attendance, add behaviour, check their answers and submit the referral', () => {
          const appointmentWithNoFeedback = initialAssessmentAppointmentFactory.inThePast.build({
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
          })
          let supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithNoFeedback],
            currentAppointmentId: appointmentWithNoFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.login()

          cy.visit(`/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('Feedback needs to be added on the same day the assessment is delivered.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('awaiting feedback')
              cy.contains('To do').next().contains('Add feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/attendance`
              )
            })
          cy.contains('Yes').click()
          cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

          const appointmentWithAttendanceFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
              },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithAttendanceFeedback],
            currentAppointmentId: appointmentWithAttendanceFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentAttendance(sentReferral.id, appointmentWithAttendanceFeedback)
          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/behaviour`
          )

          cy.contains("Describe Alex's behaviour in the assessment appointment").type(
            'Alex was acting very suspicious.'
          )
          cy.contains('Yes').click()

          const appointmentWithBehaviourFeedback = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was acting very suspicious.',
                notifyProbationPractitioner: true,
              },
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [appointmentWithBehaviourFeedback],
            currentAppointmentId: appointmentWithBehaviourFeedback.id,
          })

          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.stubRecordSupplierAssessmentAppointmentBehaviour(sentReferral.id, appointmentWithBehaviourFeedback)

          cy.contains('Save and continue').click()
          cy.location('pathname').should(
            'equal',
            `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('Did Alex attend the initial assessment appointment?')
          cy.contains('Yes, they were on time')
          cy.contains("Add additional information about Alex's attendance:")
          cy.contains('Alex attended the session')
          cy.contains("Describe Alex's behaviour in the assessment appointment")
          cy.contains('Alex was acting very suspicious.')
          cy.contains('If you described poor behaviour, do you want to notify the probation practitioner?')
          cy.contains('Yes')

          cy.stubSubmitSupplierAssessmentAppointmentFeedback(sentReferral.id, appointmentWithBehaviourFeedback)
          cy.get('form').contains('Confirm').click()

          cy.contains('Initial assessment added')

          const submittedAppointment = initialAssessmentAppointmentFactory.build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex attended the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was acting very suspicious.',
                notifyProbationPractitioner: true,
              },
              submitted: true,
            },
          })
          supplierAssessment = supplierAssessmentFactory.build({
            appointments: [submittedAppointment],
            currentAppointmentId: submittedAppointment.id,
          })
          cy.stubGetSupplierAssessment(sentReferral.id, supplierAssessment)
          cy.contains('Return to progress').click()
          cy.location('pathname').should('equal', `/service-provider/referrals/${sentReferral.id}/progress`)

          cy.contains('Initial assessment appointment')
            .next()
            .contains('The initial assessment has been delivered and feedback added.')
            .next()
            .within(() => {
              cy.contains('Appointment status').next().contains('completed')
              cy.contains('To do').next().contains('View feedback').click()
              cy.location('pathname').should(
                'equal',
                `/service-provider/referrals/${sentReferral.id}/supplier-assessment/post-assessment-feedback`
              )
            })
        })
      })
    })
  })
})
