import sentReferralFactory from '../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../testutils/factories/deliusServiceUser'
import actionPlanAppointmentFactory from '../../testutils/factories/actionPlanAppointment'
import interventionFactory from '../../testutils/factories/intervention'
import supplierAssessmentFactory from '../../testutils/factories/supplierAssessment'

describe('Scheduling appointments', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubServiceProviderToken')
    cy.task('stubServiceProviderAuthUser')
  })

  describe('User schedules and views a delivery session appointment', () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build()
    const referral = sentReferralFactory.build({
      referral: { serviceCategoryIds: [serviceCategory.id], interventionId: intervention.id },
    })
    const appointment = actionPlanAppointmentFactory.newlyCreated().build({ referralId: referral.id, sessionNumber: 1 })
    const deliusServiceUser = deliusServiceUserFactory.build()

    beforeEach(() => {
      cy.stubGetSentReferralsForUserToken([])
      cy.stubGetServiceProviderSentReferralsSummaryForUserToken([])
      cy.stubGetIntervention(intervention.id, intervention)
      cy.stubGetDeliverySessionAppointment(referral.id, appointment.id, appointment)
      cy.stubGetSentReferral(referral.id, referral)
      cy.stubGetServiceUserByCRN(referral.referral.serviceUser.crn, deliusServiceUser)
      cy.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      cy.stubGetSupplierAssessment(referral.id, supplierAssessmentFactory.build())
      cy.login()
    })

    describe('with valid inputs', () => {
      describe('when booking for an In-Person Meeting - Other Location', () => {
        it.only('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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
          cy.stubGetDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)
          cy.stubUpdateDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)

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

          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)

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
            cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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

            cy.stubUpdateDeliverySessionAppointmentClash(referral.id, appointment.id)

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
            cy.stubGetDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)
            cy.stubUpdateDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)

            cy.get('h1').contains('Confirm session 1 details')
            cy.get('button').contains('Confirm').click()

            cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          })
        })
      })

      describe('when booking for an In-Person Meeting - NPS Location', () => {
        it('should present no errors and display scheduled appointment', () => {
          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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
          cy.stubGetDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)
          cy.stubUpdateDeliverySessionAppointment(referral.id, appointment.id, scheduledAppointment)

          cy.contains('Save and continue').click()

          cy.get('h1').contains('Confirm session 1 details')
          cy.contains('24 March 2021')
          cy.contains('9:02am to 10:17am')
          cy.contains('In-person meeting (probation office)')

          cy.get('button').contains('Confirm').click()

          cy.location('pathname').should('equal', `/service-provider/referrals/${referral.id}/progress`)
          // TODO: Add checks for NPS Office address on this page

          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)

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
          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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
          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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
          cy.visit(`/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/start`)
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
})
