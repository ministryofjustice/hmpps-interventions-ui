import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'

describe('As a Service Provider', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  describe('User schedules and views an action plan appointment', () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build()
    const referral = sentReferralFactory.build({
      referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
    })
    const actionPlan = actionPlanFactory.build({ referralId: referral.id })
    const appointment = actionPlanAppointmentFactory
      .newlyCreated()
      .build({ referralId: referral.id, actionPlanId: actionPlan.id, sessionNumber: 1 })
    const deliusServiceUser = deliusServiceUserFactory.build()

    beforeEach(() => {
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, appointment)
      cy.stubGetActionPlan(actionPlan.id, actionPlan)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.login()
    })

    describe('with valid inputs', () => {
      describe('when booking for an In-Person Meeting - Other Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('Group session').click()
          cy.contains('In-person meeting - Other locations').click()
          cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
          cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
          cy.get('#method-other-location-address-town-or-city').type('Blackpool')
          cy.get('#method-other-location-address-county').type('Lancashire')
          cy.get('#method-other-location-address-postcode').type('SY4 0RE')

          const scheduledAppointment = actionPlanAppointmentFactory.build({
            ...appointment,
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            sessionType: 'GROUP',
            appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
            appointmentDeliveryAddress: {
              firstAddressLine: 'Harmony Living Office, Room 4',
              secondAddressLine: '44 Bouverie Road',
              townOrCity: 'Blackpool',
              county: 'Lancashire',
              postCode: 'SY4 0RE',
            },
          })
          cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
          cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.get('h1').contains('Confirm session 1 details')
          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('In-person meeting')
          cy.contains('Harmony Living Office, Room 4')
          cy.contains('44 Bouverie Road')
          cy.contains('Blackpool')
          cy.contains('Lancashire')
          cy.contains('SY4 0RE')

          cy.get('button').contains('Confirm').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)

          cy.get('#date-day').should('have.value', '24')
          cy.get('#date-month').should('have.value', '3')
          cy.get('#date-year').should('have.value', '2021')
          cy.get('#time-hour').should('have.value', '9')
          cy.get('#time-minute').should('have.value', '02')
          // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
          cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
          cy.get('#duration-hours').should('have.value', '1')
          cy.get('#duration-minutes').should('have.value', '15')
          cy.contains('Group session').parent().find('input').should('be.checked')
          cy.get('#method-other-location-address-line-1').should('have.value', 'Harmony Living Office, Room 4')
          cy.get('#method-other-location-address-line-2').should('have.value', '44 Bouverie Road')
          cy.get('#method-other-location-address-town-or-city').should('have.value', 'Blackpool')
          cy.get('#method-other-location-address-county').should('have.value', 'Lancashire')
          cy.get('#method-other-location-address-postcode').should('have.value', 'SY4 0RE')
        })

        describe('and their chosen date causes a clash of appointments', () => {
          it('the user is able to amend their chosen date and re-submit', () => {
            cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
            cy.get('#date-day').type('24')
            cy.get('#date-month').type('3')
            cy.get('#date-year').type('2021')
            cy.get('#time-hour').type('9')
            cy.get('#time-minute').type('02')
            cy.get('#time-part-of-day').select('AM')
            cy.get('#duration-hours').type('1')
            cy.get('#duration-minutes').type('15')
            cy.contains('Group session').click()
            cy.contains('In-person meeting - Other locations').click()
            cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
            cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
            cy.get('#method-other-location-address-town-or-city').type('Blackpool')
            cy.get('#method-other-location-address-county').type('Lancashire')
            cy.get('#method-other-location-address-postcode').type('SY4 0RE')

            cy.contains('Save and continue').click()

            cy.get('h1').contains('Confirm session 1 details')
            cy.contains('24 March 2021')
            cy.contains('9:02am to 10:17am')
            cy.contains('In-person meeting')
            cy.contains('Harmony Living Office, Room 4')
            cy.contains('44 Bouverie Road')
            cy.contains('Blackpool')
            cy.contains('Lancashire')
            cy.contains('SY4 0RE')

            cy.stubUpdateActionPlanAppointmentClash(actionPlan.id, 1)

            cy.get('button').contains('Confirm').click()

            cy.contains('The proposed date and time you selected clashes with another appointment.')

            cy.get('h1').contains('Add session 1 details')
            cy.get('#date-day').should('have.value', '24')
            cy.get('#date-month').should('have.value', '3')
            cy.get('#date-year').should('have.value', '2021')
            cy.get('#time-hour').should('have.value', '9')
            cy.get('#time-minute').should('have.value', '02')
            cy.get('#time-part-of-day').get('[selected]').should('have.text', 'AM')
            cy.get('#duration-hours').should('have.value', '1')
            cy.get('#duration-minutes').should('have.value', '15')
            cy.get('#meeting-method-meeting-other').should('be.checked')
            cy.get('#method-other-location-address-line-1').should('have.value', 'Harmony Living Office, Room 4')
            cy.get('#method-other-location-address-line-2').should('have.value', '44 Bouverie Road')
            cy.get('#method-other-location-address-town-or-city').should('have.value', 'Blackpool')
            cy.get('#method-other-location-address-county').should('have.value', 'Lancashire')
            cy.get('#method-other-location-address-postcode').should('have.value', 'SY4 0RE')

            cy.get('#date-day').type('{selectall}{backspace}25')

            cy.contains('Save and continue').click()

            const scheduledAppointment = actionPlanAppointmentFactory.build({
              ...appointment,
              appointmentTime: '2021-03-25T09:02:02Z',
              durationInMinutes: 75,
              sessionType: 'GROUP',
              appointmentDeliveryType: 'IN_PERSON_MEETING_OTHER',
              appointmentDeliveryAddress: {
                firstAddressLine: 'Harmony Living Office, Room 4',
                secondAddressLine: '44 Bouverie Road',
                townOrCity: 'Blackpool',
                county: 'Lancashire',
                postCode: 'SY4 0RE',
              },
            })
            cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
            cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

            cy.get('h1').contains('Confirm session 1 details')
            cy.get('button').contains('Confirm').click()

            cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          })
        })
      })

      describe('when booking for an In-Person Meeting - NPS Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('Group session').click()
          cy.contains('In-person meeting - NPS offices').click()
          cy.get('#delius-office-location-code').select('Blackpool: Blackpool Probation Office')

          const scheduledAppointment = actionPlanAppointmentFactory.build({
            ...appointment,
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
            sessionType: 'GROUP',
            appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
            appointmentDeliveryAddress: null,
            npsOfficeCode: 'CRS0105',
          })
          cy.stubGetActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)
          cy.stubUpdateActionPlanAppointment(actionPlan.id, appointment.sessionNumber, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.get('h1').contains('Confirm session 1 details')
          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('In-person meeting (probation office)')

          cy.get('button').contains('Confirm').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          // TODO: Add checks for NPS Office address on this page

          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)

          cy.get('#date-day').should('have.value', '24')
          cy.get('#date-month').should('have.value', '3')
          cy.get('#date-year').should('have.value', '2021')
          cy.get('#time-hour').should('have.value', '9')
          cy.get('#time-minute').should('have.value', '02')
          // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
          cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
          cy.get('#duration-hours').should('have.value', '1')
          cy.get('#duration-minutes').should('have.value', '15')
          cy.contains('Group session').parent().find('input').should('be.checked')
          cy.get('#delius-office-location-code option:selected').should(
            'have.text',
            'Blackpool: Blackpool Probation Office'
          )
        })
      })
    })

    describe('with invalid inputs', () => {
      describe("when the user doesn't select a session type", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('In-person meeting').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Select the session type')
        })
      })

      describe("when the user doesn't select meeting method", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('1:1').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Select a meeting method')
        })
      })

      describe("when the user doesn't enter an address", () => {
        it('should show an error', () => {
          cy.visit(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
          cy.get('#date-day').type('24')
          cy.get('#date-month').type('3')
          cy.get('#date-year').type('2021')
          cy.get('#time-hour').type('9')
          cy.get('#time-minute').type('02')
          cy.get('#time-part-of-day').select('AM')
          cy.get('#duration-hours').type('1')
          cy.get('#duration-minutes').type('15')
          cy.contains('1:1').click()
          cy.contains('In-person meeting - Other locations').click()
          cy.contains('Save and continue').click()
          cy.contains('There is a problem').next().contains('Enter a value for address line 1')
          cy.contains('There is a problem').next().contains('Enter a postcode')
        })
      })
    })
  })

  describe('Supplier assessments', () => {
    it('User schedules and views a supplier assessment appointment', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const referral = sentReferralFactory.assigned().build({
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const supplierAssessment = supplierAssessmentFactory.justCreated.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains('not scheduled')
      cy.contains('Schedule initial assessment').click()

      cy.contains('Add appointment details')

      cy.get('#date-day').type('24')
      cy.get('#date-month').type('3')
      cy.get('#date-year').type('2021')
      cy.get('#time-hour').type('9')
      cy.get('#time-minute').type('02')
      cy.get('#time-part-of-day').select('AM')
      cy.get('#duration-hours').type('1')
      cy.get('#duration-minutes').type('15')
      cy.contains('In-person meeting - Other locations').click()
      cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
      cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
      cy.get('#method-other-location-address-town-or-city').type('Blackpool')
      cy.get('#method-other-location-address-county').type('Lancashire')
      cy.get('#method-other-location-address-postcode').type('SY4 0RE')

      cy.contains('Save and continue').click()

      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-03-24T09:02:02Z',
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
      const supplierAssessmentWithScheduledAppointment = supplierAssessmentFactory.build({
        ...supplierAssessment,
        appointments: [scheduledAppointment],
        currentAppointmentId: scheduledAppointment.id,
      })
      cy.stubScheduleSupplierAssessmentAppointment(supplierAssessment.id, scheduledAppointment)

      cy.get('h1').contains('Confirm appointment details')
      cy.contains('24 March 2021')
      cy.contains('9:02am to 10:17am')
      cy.contains('In-person meeting')
      cy.contains('Harmony Living Office, Room 4')
      cy.contains('44 Bouverie Road')
      cy.contains('Blackpool')
      cy.contains('Lancashire')
      cy.contains('SY4 0RE')

      cy.get('button').contains('Confirm').click()
      // We need to switch out the response _after_ the update, since the
      // redirect to the correct confirmation page depends on the pre-update
      // state. The best way to handle this would be using Wiremock scenarios
      // to trigger a state transition upon the PUT, but it would take a decent
      // chunk of work on our mocks that I don’t want to do now.
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)

      cy.get('h1').contains('Initial assessment appointment added')
      cy.contains('Return to progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains(/^\s*scheduled\s*$/)

      cy.contains('View appointment details').click()
      cy.get('h1').contains('View appointment details')

      cy.contains('24 March 3021')
      cy.contains('9:02am to 10:17am')
      cy.contains('In-person meeting')
      cy.contains('Harmony Living Office, Room 4')
      cy.contains('44 Bouverie Road')
      cy.contains('Blackpool')
      cy.contains('Lancashire')
      cy.contains('SY4 0RE')
    })

    it('User schedules a supplier assessment appointment, changing their chosen time after it turns out to cause a clash of appointments', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const referral = sentReferralFactory.assigned().build({
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const supplierAssessment = supplierAssessmentFactory.justCreated.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/supplier-assessment/schedule/start`)

      cy.get('#date-day').type('24')
      cy.get('#date-month').type('3')
      cy.get('#date-year').type('2021')
      cy.get('#time-hour').type('9')
      cy.get('#time-minute').type('02')
      cy.get('#time-part-of-day').select('AM')
      cy.get('#duration-hours').type('1')
      cy.get('#duration-minutes').type('15')
      cy.contains('In-person meeting - Other locations').click()
      cy.get('#method-other-location-address-line-1').type('Harmony Living Office, Room 4')
      cy.get('#method-other-location-address-line-2').type('44 Bouverie Road')
      cy.get('#method-other-location-address-town-or-city').type('Blackpool')
      cy.get('#method-other-location-address-county').type('Lancashire')
      cy.get('#method-other-location-address-postcode').type('SY4 0RE')

      cy.contains('Save and continue').click()

      cy.stubScheduleSupplierAssessmentAppointmentClash(supplierAssessment.id)

      cy.get('h1').contains('Confirm appointment details')
      cy.get('button').contains('Confirm').click()

      cy.contains('The proposed date and time you selected clashes with another appointment.')

      cy.get('h1').contains('Add appointment details')
      cy.get('#date-day').should('have.value', '24')
      cy.get('#date-month').should('have.value', '3')
      cy.get('#date-year').should('have.value', '2021')
      cy.get('#time-hour').should('have.value', '9')
      cy.get('#time-minute').should('have.value', '02')
      cy.get('#time-part-of-day').get('[selected]').should('have.text', 'AM')
      cy.get('#duration-hours').should('have.value', '1')
      cy.get('#duration-minutes').should('have.value', '15')
      cy.get('#meeting-method-meeting-other').should('be.checked')
      cy.get('#method-other-location-address-line-1').should('have.value', 'Harmony Living Office, Room 4')
      cy.get('#method-other-location-address-line-2').should('have.value', '44 Bouverie Road')
      cy.get('#method-other-location-address-town-or-city').should('have.value', 'Blackpool')
      cy.get('#method-other-location-address-county').should('have.value', 'Lancashire')
      cy.get('#method-other-location-address-postcode').should('have.value', 'SY4 0RE')

      cy.get('#date-day').type('{selectall}{backspace}25')

      cy.contains('Save and continue').click()

      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-03-25T09:02:02Z',
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
      cy.stubScheduleSupplierAssessmentAppointment(supplierAssessment.id, scheduledAppointment)

      cy.get('h1').contains('Confirm appointment details')
      cy.get('button').contains('Confirm').click()

      cy.get('h1').contains('Initial assessment appointment added')
    })

    it('User reschedules a supplier assessment appointment', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build()
      const referral = sentReferralFactory.assigned().build({
        referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
      })
      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-03-24T09:02:00Z',
        durationInMinutes: 75,
      })
      const supplierAssessmentWithScheduledAppointment = supplierAssessmentFactory.justCreated.build({
        appointments: [scheduledAppointment],
        currentAppointmentId: scheduledAppointment.id,
      })
      const deliusServiceUser = deliusServiceUserFactory.build()

      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)

      cy.login()

      cy.visit(`/service-provider/referrals/${referral.id}/progress`)

      cy.contains('View appointment details').click()

      cy.contains('Change appointment details').click()

      cy.get('h1').contains('Change appointment details')

      cy.get('#date-day').should('have.value', '24')
      cy.get('#date-month').should('have.value', '3')
      cy.get('#date-year').should('have.value', '3021')
      cy.get('#time-hour').should('have.value', '9')
      cy.get('#time-minute').should('have.value', '02')
      // https://stackoverflow.com/questions/51222840/cypress-io-how-do-i-get-text-of-selected-option-in-select
      cy.get('#time-part-of-day').find('option:selected').should('have.text', 'AM')
      cy.get('#duration-hours').should('have.value', '1')
      cy.get('#duration-minutes').should('have.value', '15')

      cy.get('#date-day').clear().type('10')
      cy.get('#date-month').clear().type('4')
      cy.get('#date-year').clear().type('2021')
      cy.get('#time-hour').clear().type('4')
      cy.get('#time-minute').clear().type('15')
      cy.get('#time-part-of-day').select('PM')
      cy.get('#duration-hours').clear()
      cy.get('#duration-minutes').clear().type('45')

      cy.contains('Save and continue').click()

      const rescheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '3021-04-10T16:15:00Z',
        durationInMinutes: 45,
      })
      const supplierAssessmentWithRescheduledAppointment = supplierAssessmentFactory.build({
        ...supplierAssessmentWithScheduledAppointment,
        appointments: [scheduledAppointment, rescheduledAppointment],
        currentAppointmentId: rescheduledAppointment.id,
      })
      cy.stubScheduleSupplierAssessmentAppointment(
        supplierAssessmentWithRescheduledAppointment.id,
        scheduledAppointment
      )

      cy.get('h1').contains('Confirm appointment details')
      cy.contains('10 April 2021')
      cy.contains('4:15pm to 5:00pm')

      cy.get('button').contains('Confirm').click()
      // See comment in previous test about why we do this after the update
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentWithScheduledAppointment)

      cy.get('h1').contains('Initial assessment appointment updated')
      cy.contains('Return to progress').click()

      cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
      cy.get('#supplier-assessment-status').contains(/^\s*scheduled\s*$/)
    })
  })
})
