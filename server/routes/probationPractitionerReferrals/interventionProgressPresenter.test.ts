import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe(InterventionProgressPresenter, () => {
  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.sessionTableRows).toEqual([])
    })

    describe('when a session exists but an appointment has not yet been scheduled', () => {
      it('populates the table with formatted session information, with no link text or href', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [
          actionPlanAppointmentFactory.newlyCreated().build(),
        ])
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: '',
            tagArgs: {
              text: 'not scheduled',
              classes: 'govuk-tag--grey',
            },
            link: {
              text: '',
              href: '',
            },
          },
        ])
      })
    })

    describe('when an appointment has been scheduled', () => {
      it('populates the table with formatted session information, with the "Reschedule session" and "Give feedback" links displayed', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [
          actionPlanAppointmentFactory.build({
            sessionNumber: 1,
            appointmentTime: '2020-12-07T13:00:00.000000Z',
            durationInMinutes: 120,
          }),
        ])
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: '07 Dec 2020, 13:00',
            tagArgs: {
              text: 'scheduled',
              classes: 'govuk-tag--blue',
            },
            link: {
              text: '',
              href: '',
            },
          },
        ])
      })
    })

    describe('when session feedback has been recorded', () => {
      describe('when the service user attended the session or was late', () => {
        it('populates the table with the "completed" status against that session and a link to view it', () => {
          const referral = sentReferralFactory.build({ actionPlanId: 'c59809e0-ab78-4723-bbef-bd34bc6df110' })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [
            actionPlanAppointmentFactory.attended('yes').build({ sessionNumber: 1 }),
            actionPlanAppointmentFactory.attended('late').build({ sessionNumber: 2 }),
          ])
          expect(presenter.sessionTableRows).toEqual([
            {
              sessionNumber: 1,
              appointmentTime: '',
              tagArgs: {
                text: 'completed',
                classes: 'govuk-tag--green',
              },
              link: {
                href: `/probation-practitioner/action-plan/c59809e0-ab78-4723-bbef-bd34bc6df110/appointment/1/post-session-feedback`,
                text: 'View feedback form',
              },
            },
            {
              sessionNumber: 2,
              appointmentTime: '',
              tagArgs: {
                text: 'completed',
                classes: 'govuk-tag--green',
              },
              link: {
                href: `/probation-practitioner/action-plan/c59809e0-ab78-4723-bbef-bd34bc6df110/appointment/2/post-session-feedback`,
                text: 'View feedback form',
              },
            },
          ])
        })
      })

      describe('when the service did not attend the session', () => {
        it('populates the table with the "failure to attend" status against that session and a link to view it', () => {
          const referral = sentReferralFactory.build({ actionPlanId: 'c59809e0-ab78-4723-bbef-bd34bc6df110' })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [
            actionPlanAppointmentFactory.attended('no').build(),
          ])
          expect(presenter.sessionTableRows).toEqual([
            {
              sessionNumber: 1,
              appointmentTime: '',
              tagArgs: {
                text: 'did not attend',
                classes: 'govuk-tag--purple',
              },
              link: {
                href: `/probation-practitioner/action-plan/c59809e0-ab78-4723-bbef-bd34bc6df110/appointment/1/post-session-feedback`,
                text: 'View feedback form',
              },
            },
          ])
        })
      })
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('returns a title to be displayed', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

        expect(presenter.text).toMatchObject({
          title: 'Accommodation progress',
        })
      })
    })
  })

  describe('referralCancellationHref', () => {
    it('returns the url including referral id for the referral cancellation page', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.referralCancellationHref).toEqual(
        `/probation-practitioner/referrals/${referral.id}/cancellation/reason`
      )
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = sentReferralFactory.unassigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = sentReferralFactory.assigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(true)
    })
  })

  describe('hasEndOfServiceReport', () => {
    describe('when the referral has no end of service report', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const serviceCategory = serviceCategoryFactory.build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

        expect(presenter.hasEndOfServiceReport).toEqual(false)
      })
    })
    describe('when the referral has an end of service report', () => {
      describe('and it is not submitted', () => {
        it('returns false', () => {
          const referral = sentReferralFactory.build({
            endOfServiceReport: endOfServiceReportFactory.justCreated().build(),
          })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

          expect(presenter.hasEndOfServiceReport).toEqual(false)
        })
      })

      describe('and it is submitted', () => {
        it('returns true', () => {
          const referral = sentReferralFactory.build({
            endOfServiceReport: endOfServiceReportFactory.submitted().build(),
          })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

          expect(presenter.hasEndOfServiceReport).toEqual(true)
        })
      })
    })
  })

  describe('endOfServiceReportTableHeaders', () => {
    it('returns the headers for the end of service report table', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.endOfServiceReportTableHeaders).toEqual(['Caseworker', 'Status', 'Action'])
    })
  })

  describe('endOfServiceReportTableRows', () => {
    it('returns the contents of a table detailing the end of service report', () => {
      const endOfServiceReport = endOfServiceReportFactory.submitted().build()
      const referral = sentReferralFactory.build({
        assignedTo: hmppsAuthUserFactory.build({ username: 'john.bloggs' }),
        endOfServiceReport,
      })
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, serviceUser, [])

      expect(presenter.endOfServiceReportTableRows).toEqual([
        {
          caseworker: 'john.bloggs',
          tagArgs: { classes: 'govuk-tag--green', text: 'Completed' },
          link: {
            href: `/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`,
            text: 'View',
          },
        },
      ])
    })
  })
})
