import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'

describe('Probation Practitioner monitor journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  describe('viewing the progress of an intervention', () => {
    it('displays the referral progress page with the status of each session', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { serviceCategoryId: serviceCategory.id },
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
        actionPlanAppointmentFactory.attended('yes').build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.attended('no').build({
          sessionNumber: 2,
          appointmentTime: '2021-04-30T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 3,
          appointmentTime: '2021-05-31T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 4,
          durationInMinutes: 75,
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      // Necessary until we add the Monitor dashboard
      cy.stubGetDraftReferralsForUser([])

      cy.stubGetSentReferrals([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

      cy.get('h1').contains('Accommodation progress')

      cy.get('table')
        .getTable()
        .should('deep.equal', [
          {
            'Session details': 'Session 1',
            'Date and time': '24 Mar 2021, 09:02',
            Status: 'completed',
            Action: 'View feedback form',
          },
          {
            'Session details': 'Session 2',
            'Date and time': '30 Apr 2021, 10:02',
            Status: 'did not attend',
            Action: 'View feedback form',
          },
          {
            'Session details': 'Session 3',
            'Date and time': '31 May 2021, 10:02',
            Status: 'scheduled',
            Action: '',
          },
          {
            'Session details': 'Session 4',
            'Date and time': '',
            Status: 'not scheduled',
            Action: '',
          },
        ])
    })
  })

  describe('Viewing session feedback', () => {
    it('allows users to click through to a page to view session feedback', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { serviceCategoryId: serviceCategory.id },
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

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetDraftReferralsForUser([])

      cy.stubGetSentReferrals([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)

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

      cy.stubGetActionPlanAppointments(actionPlan.id, appointmentsWithSubmittedFeedback)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointmentsWithSubmittedFeedback[0])

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

      cy.contains('View feedback form').click()

      cy.contains('john.smith')
      cy.contains('Alex attended the session')
      cy.contains('Yes, they were on time')
      cy.contains('Alex was well-behaved')
      cy.contains('No')
    })
  })

  describe('cancelling a referral', () => {
    it('displays a form to allow users to submit comments and cancel a referral', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { serviceCategoryId: serviceCategory.id },
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
        actionPlanAppointmentFactory.attended('yes').build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.attended('no').build({
          sessionNumber: 2,
          appointmentTime: '2021-04-30T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 3,
          appointmentTime: '2021-05-31T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 4,
          durationInMinutes: 75,
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      // Necessary until we add the Monitor dashboard
      cy.stubGetDraftReferralsForUser([])

      cy.stubGetSentReferrals([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

      cy.contains('Cancel this referral').click()
      cy.contains('Additional comments (optional)').type('Some additional comments')
      cy.contains('Continue').click()
    })
  })
})
