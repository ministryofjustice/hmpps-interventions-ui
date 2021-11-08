import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import interventionFactory from '../../testutils/factories/intervention'
import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'

describe('Delivery session appointment feedback', () => {
  const deliusServiceUser = deliusServiceUserFactory.build()
  const probationPractitioner = deliusUserFactory.build({
    firstName: 'John',
    surname: 'Smith',
    username: 'john.smith',
  })

  const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
  const intervention = interventionFactory.build({
    contractType: { code: 'ACC', name: 'accommodation' },
    serviceCategories: [serviceCategory],
  })
  const referralParams = {
    id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
    referral: { interventionId: intervention.id, serviceCategoryIds: [serviceCategory.id] },
  }
  const serviceProvider = hmppsAuthUserFactory.build({
    firstName: 'Case',
    lastName: 'Worker',
    username: 'case.worker',
  })
  const actionPlan = actionPlanFactory.submitted().build({
    referralId: referralParams.id,
    numberOfSessions: 4,
  })
  const assignedReferral = sentReferralFactory.assigned().build({
    ...referralParams,
    assignedTo: { username: serviceProvider.username },
    actionPlanId: actionPlan.id,
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

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')

    cy.stubGetSentReferralsForUserToken([assignedReferral])
    cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetIntervention(intervention.id, intervention)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
    cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
    cy.stubGetAuthUserByUsername(serviceProvider.username, serviceProvider)
    cy.stubGetDeliverySessionAppointment(assignedReferral.id, appointments[0].id, appointments[0])
  })

  describe('Adding feedback', () => {
    it('user records the Service user as having attended, and fills out behaviour screen', () => {
      cy.login()

      cy.visit(
        `/service-provider/referral/${assignedReferral.id}/session/${appointments[0].sessionNumber}/appointment/${appointments[0].id}/feedback/attendance`
      )

      cy.contains('Yes').click()
      cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

      const appointmentWithAttendanceRecorded = {
        ...appointments[0],
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'Alex attended the session',
          },
        },
      }

      cy.stubRecordDeliverySessionAppointmentAttendance(
        assignedReferral.id,
        appointments[0].id,
        appointmentWithAttendanceRecorded
      )

      cy.contains('Save and continue').click()

      cy.contains('Add behaviour feedback')

      cy.contains("Describe Alex's behaviour in this session").type('Alex was well behaved')
      cy.contains('No').click()

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

      cy.stubRecordDeliverySessionAppointmentBehaviour(
        assignedReferral.id,
        appointments[0].id,
        appointmentWithBehaviourRecorded
      )

      cy.stubGetDeliverySessionAppointment(assignedReferral.id, appointments[0].id, appointmentWithBehaviourRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Confirm feedback')
      cy.contains('Alex attended the session')
      cy.contains('Yes, they were on time')
      cy.contains('Alex was well-behaved')
      cy.contains('No')

      // Required for checking the number of sessions on an action plan and displaying on confirmation screen
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

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
      cy.stubSubmitDeliverySessionFeedback(assignedReferral.id, appointments[0].id, appointmentWithSubmittedFeedback)

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 March 2021.')

      const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
      cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

      cy.contains('Return to service progress').click()

      cy.get('[data-cy=session-table]')
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
      cy.login()

      cy.visit(
        `/service-provider/referral/${assignedReferral.id}/session/${appointments[0].sessionNumber}/appointment/${appointments[0].id}/feedback/attendance`
      )

      cy.contains('No').click()
      cy.contains("Add additional information about Alex's attendance").type("Alex didn't attend")

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
      cy.stubRecordDeliverySessionAppointmentAttendance(
        assignedReferral.id,
        appointments[0].id,
        appointmentWithAttendanceRecorded
      )

      cy.stubGetDeliverySessionAppointment(assignedReferral.id, appointments[0].id, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Confirm feedback')
      cy.contains('No')
      cy.contains("Alex didn't attend")

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
      cy.stubSubmitDeliverySessionFeedback(assignedReferral.id, appointments[0].id, appointmentWithSubmittedFeedback)
      // Required for checking the number of sessions on an action plan and displaying on confirmation screen
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      cy.get('form').contains('Confirm').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 March 2021.')

      const updatedAppointments = [appointmentWithSubmittedFeedback, appointments[1]]
      cy.stubGetActionPlanAppointments(actionPlan.id, updatedAppointments)

      cy.contains('Return to service progress').click()

      cy.get('[data-cy=session-table]')
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

  describe('Viewing feedback', () => {
    it('allows users to click through to a page to view session feedback', () => {
      cy.login()

      const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.scheduled().build({
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
      })
      cy.stubGetDeliverySessionAppointment(
        assignedReferral.id,
        appointmentWithSubmittedFeedback.id,
        appointmentWithSubmittedFeedback
      )

      cy.visit(
        `/service-provider/referral/${assignedReferral.id}/session/${appointmentWithSubmittedFeedback.sessionNumber}/appointment/${appointmentWithSubmittedFeedback.id}/feedback`
      )
      cy.contains('Intervention cancelled').should('not.exist')
      cy.contains('Alex attended the session')
      cy.contains('Yes, they were on time')
      cy.contains('Alex was well-behaved')
      cy.contains('No')
    })
  })
})
