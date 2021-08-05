import sentReferralFactory from '../../testutils/factories/sentReferral'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import interventionFactory from '../../testutils/factories/intervention'
import expandedDeliusServiceUserFactory from '../../testutils/factories/expandedDeliusServiceUser'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import initialAssessmentAppointmentFactory from '../../testutils/factories/initialAssessmentAppointment'

describe('Probation Practitioner monitor journey', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubProbationPractitionerToken')
    cy.task('stubProbationPractitionerAuthUser')
  })

  describe('viewing the progress of an intervention', () => {
    describe('supplier assessment', () => {
      describe('when a caseworker has not yet been assigned', () => {
        it('contains an appropriate message about the supplier assessment', () => {
          cy.stubGetSentReferralsForUserToken([])

          const serviceCategory = serviceCategoryFactory.build()

          const intervention = interventionFactory.build({
            serviceCategories: [serviceCategory],
          })

          const referral = sentReferralFactory.unassigned().build({
            referral: {
              interventionId: intervention.id,
              serviceCategoryIds: [serviceCategory.id],
            },
          })

          const supplierAssessment = supplierAssessmentFactory.justCreated.build()

          cy.stubGetSentReferral(referral.id, referral)
          cy.stubGetIntervention(intervention.id, intervention)
          cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUserFactory.build())
          cy.stubGetSupplierAssessment(referral.id, supplierAssessment)

          cy.login()

          cy.visit(`/probation-practitioner/referrals/${referral.id}/progress`)

          cy.contains('Once a caseworker has been assigned the assessment will be booked.')
        })
      })

      describe('when a caseworker has been assigned but the supplier assessment has not yet been scheduled', () => {
        it('contains an appropriate message about the supplier assessment', () => {
          cy.stubGetSentReferralsForUserToken([])

          const serviceCategory = serviceCategoryFactory.build()

          const intervention = interventionFactory.build({
            serviceCategories: [serviceCategory],
          })

          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'Liam',
            lastName: 'Johnson',
            username: 'liam.johnson',
          })

          const referral = sentReferralFactory.assigned().build({
            referral: {
              interventionId: intervention.id,
              serviceCategoryIds: [serviceCategory.id],
            },
            assignedTo: { username: hmppsAuthUser.username },
          })

          const supplierAssessment = supplierAssessmentFactory.justCreated.build()

          cy.stubGetSentReferral(referral.id, referral)
          cy.stubGetIntervention(intervention.id, intervention)
          cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUserFactory.build())
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
          cy.stubGetSupplierAssessment(referral.id, supplierAssessment)

          cy.login()

          cy.visit(`/probation-practitioner/referrals/${referral.id}/progress`)

          cy.contains('A caseworker has been assigned and will book the assessment appointment with the service user.')
          cy.contains('Liam Johnson')
          cy.get('#supplier-assessment-status').contains('not scheduled')
        })
      })

      describe('when a caseworker has been assigned and the supplier assessment has been scheduled', () => {
        it('contains an appropriate message about the supplier assessment', () => {
          cy.stubGetSentReferralsForUserToken([])

          const serviceCategory = serviceCategoryFactory.build()

          const intervention = interventionFactory.build({
            serviceCategories: [serviceCategory],
          })

          const hmppsAuthUser = hmppsAuthUserFactory.build({
            firstName: 'Liam',
            lastName: 'Johnson',
            username: 'liam.johnson',
          })

          const referral = sentReferralFactory.assigned().build({
            referral: {
              interventionId: intervention.id,
              serviceCategoryIds: [serviceCategory.id],
            },
            assignedTo: { username: hmppsAuthUser.username },
          })

          const supplierAssessment = supplierAssessmentFactory.withSingleAppointment.build()

          cy.stubGetSentReferral(referral.id, referral)
          cy.stubGetIntervention(intervention.id, intervention)
          cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUserFactory.build())
          cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
          cy.stubGetSupplierAssessment(referral.id, supplierAssessment)

          cy.login()

          cy.visit(`/probation-practitioner/referrals/${referral.id}/progress`)

          cy.contains('The appointment has been scheduled by the supplier.')
          cy.contains('Liam Johnson')
          cy.get('#supplier-assessment-status').contains(/^\s*scheduled\s*$/)
        })
      })
    })
    it('displays the referral progress page with the status of each session', () => {
      const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: intervention.id },
      }
      const deliusServiceUser = deliusServiceUserFactory.build()
      const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build
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

      cy.stubGetIntervention(assignedReferral.referral.interventionId, intervention)
      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetExpandedServiceUserByCRN(assignedReferral.referral.serviceUser.crn, expandedDeliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(assignedReferral.assignedTo.username, hmppsAuthUserFactory.build())

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
      const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: intervention.id },
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

      cy.stubGetIntervention(assignedReferral.referral.interventionId, intervention)
      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(assignedReferral.assignedTo.username, hmppsAuthUserFactory.build())

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
      const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
      const referralParams = {
        id: 'f478448c-2e29-42c1-ac3d-78707df23e50',
        referral: { interventionId: intervention.id },
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

      cy.stubGetIntervention(assignedReferral.referral.interventionId, intervention)
      cy.stubGetSentReferralsForUserToken([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)
      cy.stubGetSupplierAssessment(assignedReferral.id, supplierAssessmentFactory.build())
      cy.stubGetAuthUserByUsername(assignedReferral.assignedTo.username, hmppsAuthUserFactory.build())
      cy.stubGetReferralCancellationReasons([
        { code: 'MIS', description: 'Referral was made by mistake' },
        { code: 'MOV', description: 'Service user has moved out of delivery area' },
      ])

      cy.stubGetActionPlanAppointments(actionPlan.id, appointments)
      cy.stubGetActionPlanAppointment(actionPlan.id, 1, appointments[0])
      cy.stubGetActionPlanAppointment(actionPlan.id, 2, appointments[1])

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${assignedReferral.id}/progress`)

      cy.contains('Cancel this referral').click()
      cy.contains('Service user has moved out of delivery area').click()
      cy.contains('Additional comments (optional)').type('Some additional comments')

      cy.stubEndReferral(assignedReferral.id, assignedReferral)

      cy.contains('Continue').click()

      cy.contains('Are you sure you want to cancel this referral?')

      cy.contains('Cancel referral').click()
      cy.contains('This referral has been cancelled')

      const referralWithEndRequested = sentReferralFactory.endRequested().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
        endRequestedAt: '2021-04-04T20:45:21.986389Z',
      })

      cy.stubGetSentReferral(referralWithEndRequested.id, referralWithEndRequested)

      cy.visit(`/probation-practitioner/referrals/${referralWithEndRequested.id}/progress`)

      cy.contains('You requested to end this service on 04 Apr 2021')
    })
  })

  describe('viewing a supplier assessment', () => {
    it('user views scheduled supplier assessment', () => {
      cy.stubGetSentReferralsForUserToken([])

      const serviceCategory = serviceCategoryFactory.build()

      const intervention = interventionFactory.build({
        serviceCategories: [serviceCategory],
      })

      const hmppsAuthUser = hmppsAuthUserFactory.build({
        firstName: 'Liam',
        lastName: 'Johnson',
        username: 'liam.johnson',
      })

      const referral = sentReferralFactory.assigned().build({
        referral: {
          interventionId: intervention.id,
          serviceCategoryIds: [serviceCategory.id],
        },
        assignedTo: { username: hmppsAuthUser.username },
      })

      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
        appointmentDeliveryAddress: {
          firstAddressLine: 'Harmony Living Office, Room 4',
          secondAddressLine: '44 Bouverie Road',
          townOrCity: 'Blackpool',
          county: 'Lancashire',
          postCode: 'SY4 0RE',
        },
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })

      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUserFactory.build())
      cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessment)

      cy.login()

      cy.visit(`/probation-practitioner/referrals/${referral.id}/progress`)

      cy.contains('View appointment details').click()

      cy.get('h1').contains('View appointment details')

      cy.contains('Liam Johnson')
      cy.contains('24 March 2021')
      cy.contains('9:02am to 10:17am')
      cy.contains('In-person meeting')
      cy.contains('Harmony Living Office, Room 4')
      cy.contains('44 Bouverie Road')
      cy.contains('Blackpool')
      cy.contains('Lancashire')
      cy.contains('SY4 0RE')
    })
  })
})
