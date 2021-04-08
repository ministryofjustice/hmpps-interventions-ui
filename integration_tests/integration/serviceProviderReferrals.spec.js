import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../testutils/factories/deliusUser'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import hmppsAuthUserFactory from '../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'

describe('Service provider referrals dashboard', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  it('User views a list of sent referrals and the referral details page', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const sentReferrals = [
      sentReferralFactory.build({
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        referral: {
          serviceCategoryId: accommodationServiceCategory.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
      sentReferralFactory.build({
        sentAt: '2020-09-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        referral: {
          serviceCategoryId: socialInclusionServiceCategory.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones', crn: 'X123456' },
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d'],
          complexityLevelId: '110f2405-d944-4c15-836c-0c6684e2aa78',
        },
      }),
    ]

    const deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })

    const deliusServiceUser = deliusServiceUserFactory.build({
      firstName: 'Jenny',
      surname: 'Jones',
      dateOfBirth: '1980-01-01',
      contactDetails: {
        emailAddresses: ['jenny.jones@example.com'],
        phoneNumbers: [
          {
            number: '07123456789',
            type: 'MOBILE',
          },
        ],
      },
    })

    const referralToSelect = sentReferrals[1]

    cy.stubGetServiceCategory(accommodationServiceCategory.id, accommodationServiceCategory)
    cy.stubGetServiceCategory(socialInclusionServiceCategory.id, socialInclusionServiceCategory)
    sentReferrals.forEach(referral => cy.stubGetSentReferral(referral.id, referral))
    cy.stubGetSentReferrals(sentReferrals)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetServiceUserByCRN(referralToSelect.referral.serviceUser.crn, deliusServiceUser)

    cy.login()

    cy.get('h1').contains('All cases')

    cy.get('table')
      .getTable()
      .should('deep.equal', [
        {
          'Date received': '26 Jan 2021',
          'Intervention type': 'Accommodation',
          Referral: 'ABCABCA1',
          'Service user': 'George Michael',
          Caseworker: '',
          Action: 'View',
        },
        {
          'Date received': '13 Sep 2020',
          'Intervention type': 'Social inclusion',
          Referral: 'ABCABCA2',
          'Service user': 'Jenny Jones',
          Caseworker: '',
          Action: 'View',
        },
      ])

    cy.contains('.govuk-table__row', 'Jenny Jones').within(() => {
      cy.contains('View').click()
    })
    cy.location('pathname').should('equal', `/service-provider/referrals/${referralToSelect.id}/details`)
    cy.get('h2').contains('Who do you want to assign this referral to?')
    cy.contains('07123456789 | jenny.jones@example.com')
    cy.contains('Social inclusion intervention details')
    cy.contains('Service User makes progress in obtaining accommodation')
    cy.contains('Service User is helped to secure a tenancy in the private rented sector (PRS)')
    cy.contains('Medium complexity')
    cy.contains(
      'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.'
    )
    cy.contains("Service user's personal details")
    cy.contains('English')
    cy.contains('Agnostic')
    cy.contains('Autism spectrum condition')
    cy.contains('sciatica')
    cy.contains('Service User is helped to secure a tenancy in the private rented sector (PRS)')
    cy.contains("Service user's risk information")
    cy.contains('Risk to known adult')
    cy.contains('Medium')
    cy.contains('A danger to the elderly')
    cy.contains("Service user's needs")
    cy.contains('Alex is currently sleeping on her aunt’s sofa')
    cy.contains('She uses a wheelchair')
    cy.contains('Spanish')
    cy.contains('She works Mondays 9am - midday')
    cy.contains('Bernard Beaks')
    cy.contains('bernard.beaks@justice.gov.uk')
  })

  it('User assigns a referral to a caseworker', () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referralParams = { referral: { serviceCategoryId: serviceCategory.id } }
    const referral = sentReferralFactory.build(referralParams)
    const deliusUser = deliusUserFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetSentReferrals([referral])
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetAuthUserByEmailAddress([hmppsAuthUser])
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubAssignSentReferral(referral.id, referral)

    cy.login()

    cy.visit(`/service-provider/referrals/${referral.id}/details`)

    cy.get('h2').contains('Who do you want to assign this referral to?')

    cy.get('#email').type('john@harmonyliving.org.uk')
    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/check`)
    cy.get('h1').contains('Confirm the accommodation referral assignment')
    cy.contains('John Smith')

    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, id: referral.id, assignedTo: { username: hmppsAuthUser.username } })
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetSentReferrals([assignedReferral])

    cy.contains('Confirm assignment').click()

    cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/assignment/confirmation`)
    cy.get('h1').contains('Caseworker assigned')

    cy.contains('Return to dashboard').click()

    cy.location('pathname').should('equal', `/service-provider/dashboard`)
    cy.contains('john.smith')

    cy.visit(`/service-provider/referrals/${referral.id}/details`)
    cy.contains('This intervention is assigned to John Smith.')
  })

  it('User creates an action plan and submits it for approval', () => {
    const desiredOutcomes = [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service User makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service User is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ]
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })
    const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]
    const referralParams = {
      referral: { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: selectedDesiredOutcomesIds },
    }
    const deliusServiceUser = deliusServiceUserFactory.build()
    const deliusUser = deliusUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })
    const assignedReferral = sentReferralFactory
      .assigned()
      .build({ ...referralParams, assignedTo: { username: hmppsAuthUser.username } })
    const draftActionPlan = actionPlanFactory.justCreated(assignedReferral.id).build()
    const actionPlanAppointments = [
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 1 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 2 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 3 }),
      actionPlanAppointmentFactory.newlyCreated().build({ sessionNumber: 4 }),
    ]

    cy.stubGetSentReferrals([assignedReferral])

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlan)
    cy.stubCreateDraftActionPlan(draftActionPlan)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
    cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
    cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetUserByUsername(deliusUser.username, deliusUser)
    cy.stubGetAuthUserByUsername(hmppsAuthUser.username, hmppsAuthUser)
    cy.stubGetActionPlanAppointments(draftActionPlan.id, actionPlanAppointments)

    cy.login()

    cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.contains('Create action plan').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)

    cy.contains('Accommodation - create action plan')
    cy.contains('Add suggested activities to Alex’s action plan')
    cy.contains(desiredOutcomes[0].description)
    cy.contains(desiredOutcomes[1].description)

    const draftActionPlanWithActivity = {
      ...draftActionPlan,
      activities: [
        {
          id: '1',
          desiredOutcome: {
            id: desiredOutcomes[0].id,
          },
          description: 'Attend training course',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithActivity)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithActivity)

    cy.get('#description-1').type('Attend training course')
    cy.get('#add-activity-1').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
    cy.contains('Attend training course')

    const draftActionPlanWithAllActivities = {
      ...draftActionPlanWithActivity,
      activities: [
        ...draftActionPlanWithActivity.activities,
        {
          id: '2',
          desiredOutcome: {
            id: desiredOutcomes[1].id,
          },
          description: 'Create appointment with local authority',
          createdAt: new Date().toISOString(),
        },
      ],
    }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithAllActivities)

    cy.get('#description-2').type('Create appointment with local authority')
    cy.get('#add-activity-2').click()

    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
    cy.contains('Attend training course')
    cy.contains('Create appointment with local authority')

    cy.contains('Save and continue').click()

    const draftActionPlanWithNumberOfSessions = { ...draftActionPlanWithAllActivities, numberOfSessions: 4 }

    cy.stubGetActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)
    cy.stubUpdateDraftActionPlan(draftActionPlan.id, draftActionPlanWithNumberOfSessions)

    cy.contains('Add number of sessions for Alex’s action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/number-of-sessions`)
    cy.contains('Number of sessions').type('4')

    cy.contains('Save and continue').click()

    const referralWithActionPlanId = { ...assignedReferral, actionPlanId: draftActionPlan.id }
    const submittedActionPlan = { ...draftActionPlanWithNumberOfSessions, submittedAt: new Date().toISOString() }

    cy.stubGetSentReferral(assignedReferral.id, referralWithActionPlanId)
    cy.stubSubmitActionPlan(draftActionPlan.id, submittedActionPlan)
    cy.stubGetActionPlan(draftActionPlan.id, submittedActionPlan)

    cy.contains('Review Alex’s action plan')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/review`)
    cy.contains('Submit for approval').click()

    cy.contains('Action plan submitted for approval')
    cy.location('pathname').should('equal', `/service-provider/action-plan/${draftActionPlan.id}/confirmation`)
    cy.contains('Return to service progress').click()

    cy.location('pathname').should('equal', `/service-provider/referrals/${assignedReferral.id}/progress`)
    cy.get('#action-plan-status').contains('Submitted')
  })

  it('User schedules and views an action plan appointment', () => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = sentReferralFactory.build({ referral: { serviceCategoryId: serviceCategory.id } })
    const actionPlan = actionPlanFactory.build({ referralId: referral.id })
    const appointment = actionPlanAppointmentFactory
      .newlyCreated()
      .build({ referralId: referral.id, actionPlanId: actionPlan.id, sessionNumber: 1 })
    const deliusServiceUser = deliusServiceUserFactory.build()

    cy.stubGetSentReferrals([])
    cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, appointment)
    cy.stubGetActionPlan(actionPlan.id, actionPlan)
    cy.stubGetSentReferral(referral.id, referral)
    cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
    cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

    cy.login()

    cy.visit(`/service-provider/action-plan/1/sessions/1/edit`)

    cy.get('#date-day').type('24')
    cy.get('#date-month').type('3')
    cy.get('#date-year').type('2021')
    cy.get('#time-hour').type('9')
    cy.get('#time-minute').type('02')
    cy.get('#time-part-of-day').select('AM')
    cy.get('#duration-hours').type('1')
    cy.get('#duration-minutes').type('15')

    const scheduledAppointment = actionPlanAppointmentFactory.build({
      ...appointment,
      appointmentTime: '2021-03-24T09:02:02Z',
      durationInMinutes: 75,
    })
    cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
    cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

    cy.contains('Save and continue').click()

    cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)

    cy.visit(`/service-provider/action-plan/1/sessions/1/edit`)

    cy.get('#date-day').should('have.value', '24')
    cy.get('#date-month').should('have.value', '3')
    cy.get('#date-year').should('have.value', '2021')
    cy.get('#time-hour').should('have.value', '9')
    cy.get('#time-minute').should('have.value', '02')
    // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
    cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
    cy.get('#duration-hours').should('have.value', '1')
    cy.get('#duration-minutes').should('have.value', '15')
  })

  describe('Recording post session feedback', () => {
    it('user records the Service User as having attended, and fills out behaviour screen', () => {
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
        actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-03-31T09:02:02Z',
          durationInMinutes: 75,
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferrals([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)

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

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.contains('Yes').click()
      cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

      cy.stubRecordAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Add behaviour feedback')

      cy.contains("Describe Alex's behaviour in this session").type('Alex was well behaved')
      cy.contains('No').click()

      cy.stubRecordAppointmentBehaviour(actionPlan.id, 1, appointmentWithBehaviourRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 Mar 2021.')
    })

    it('user records the Service User as having not attended, and skips behaviour screen', () => {
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
        actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentTime: '2021-03-24T09:02:02Z',
          durationInMinutes: 75,
        }),
        actionPlanAppointmentFactory.build({
          sessionNumber: 2,
          appointmentTime: '2021-03-31T09:02:02Z',
          durationInMinutes: 75,
        }),
      ]

      const assignedReferral = sentReferralFactory.assigned().build({
        ...referralParams,
        assignedTo: { username: probationPractitioner.username },
        actionPlanId: actionPlan.id,
      })

      cy.stubGetSentReferrals([assignedReferral])
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSentReferral(assignedReferral.id, assignedReferral)
      cy.stubGetServiceUserByCRN(assignedReferral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetUserByUsername(probationPractitioner.username, probationPractitioner)

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
        },
      }

      cy.login()

      cy.visit(`/service-provider/referrals/${assignedReferral.id}/progress`)

      cy.contains('Give feedback').click()

      cy.contains('Yes').click()
      cy.contains("Add additional information about Alex's attendance").type('Alex attended the session')

      cy.stubRecordAppointmentAttendance(actionPlan.id, 1, appointmentWithAttendanceRecorded)

      cy.contains('Save and continue').click()

      cy.contains('Session feedback added and submitted to the probation practitioner')
      cy.contains('You can now deliver the next session scheduled for 31 Mar 2021.')
    })
  })
})
