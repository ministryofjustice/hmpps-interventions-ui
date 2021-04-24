import InterventionProgressPresenter from './interventionProgressPresenter'
import ReferralFactory from '../../../testutils/factories/referral'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

describe(InterventionProgressPresenter, () => {
  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const referral = ReferralFactory.sent().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

      expect(presenter.createActionPlanFormAction).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = ReferralFactory.sent().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

      expect(presenter.sessionTableRows).toEqual([])
    })

    describe('when a session exists but an appointment has not yet been scheduled', () => {
      it('populates the table with formatted session information, with the "Edit session details" link displayed', () => {
        const referral = ReferralFactory.sent().build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [
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
            linkHtml:
              '<a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit">Edit session details</a>',
          },
        ])
      })
    })

    describe('when an appointment has been scheduled', () => {
      it('populates the table with formatted session information, with the "Reschedule session" and "Give feedback" links displayed', () => {
        const referral = ReferralFactory.sent().build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [
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
            linkHtml: `<a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit">Reschedule session</a><br><a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback/attendance">Give feedback</a>`,
          },
        ])
      })
    })

    describe('when the session feedback has been recorded', () => {
      describe('when the service user attended the session or was late', () => {
        it('populates the table with the "completed" status against that session and a link to view it', () => {
          const referral = ReferralFactory.sent().build()
          const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [
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
              linkHtml:
                '<a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback">View feedback form</a>',
            },
            {
              sessionNumber: 2,
              appointmentTime: '',
              tagArgs: {
                text: 'completed',
                classes: 'govuk-tag--green',
              },
              linkHtml:
                '<a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/2/post-session-feedback">View feedback form</a>',
            },
          ])
        })
      })

      describe('when the service did not attend the session', () => {
        it('populates the table with the "failure to attend" status against that session and a link to view it', () => {
          const referral = ReferralFactory.sent().build()
          const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [
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
              linkHtml:
                '<a class="govuk-link" href="/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback">View feedback form</a>',
            },
          ])
        })
      })
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('returns a title to be displayed', () => {
        const referral = ReferralFactory.sent().build({
          serviceCategory: {
            name: 'accommodation',
          },
        })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.text).toMatchObject({
          title: 'Accommodation',
        })
      })
    })

    describe('actionPlanStatus', () => {
      describe('when there is no action plan', () => {
        it('returns “Not submitted”', () => {
          const referral = ReferralFactory.sent().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const referral = ReferralFactory.sent().build()
          const actionPlan = actionPlanFactory.notSubmitted().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has been submitted', () => {
        it('returns “Submitted”', () => {
          const referral = ReferralFactory.sent().build()
          const actionPlan = actionPlanFactory.submitted().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Submitted' })
        })
      })
    })

    describe('endOfServiceReportStatus', () => {
      describe('when there is no end of service report', () => {
        it('returns “Not submitted”', () => {
          const referral = ReferralFactory.sent().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
          const referral = ReferralFactory.sent().build({
            sentReferralFields: {
              endOfServiceReport,
            },
          })
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has been submitted', () => {
        it('returns “Submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.submitted().build()
          const referral = ReferralFactory.sent().build({
            sentReferralFields: {
              endOfServiceReport,
            },
          })
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Submitted' })
        })
      })
    })
  })

  describe('actionPlanStatusStyle', () => {
    describe('when there is no action plan', () => {
      it('returns the inactive style', () => {
        const referral = ReferralFactory.sent().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the active style', () => {
        const referral = ReferralFactory.sent().build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the active style', () => {
        const referral = ReferralFactory.sent().build()
        const actionPlan = actionPlanFactory.submitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('active')
      })
    })
  })

  describe('allowActionPlanCreation', () => {
    describe('when there is no action plan', () => {
      it('returns true', () => {
        const referral = ReferralFactory.sent().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.allowActionPlanCreation).toEqual(true)
      })
    })

    describe('when there is an action plan', () => {
      it('returns false', () => {
        const referral = ReferralFactory.sent().build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

        expect(presenter.allowActionPlanCreation).toEqual(false)
      })
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = ReferralFactory.sent().build()
      const actionPlan = actionPlanFactory.submitted().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = ReferralFactory.assigned().build()
      const actionPlan = actionPlanFactory.submitted().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, actionPlan, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(true)
    })
  })

  describe('endOfServiceReportStatusStyle', () => {
    describe('when there is no end of service report', () => {
      it('returns the inactive style', () => {
        const referral = ReferralFactory.sent().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has not been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = ReferralFactory.sent().build({
          sentReferralFields: {
            endOfServiceReport,
          },
        })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.submitted().build()
        const referral = ReferralFactory.sent().build({
          sentReferralFields: {
            endOfServiceReport,
          },
        })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('active')
      })
    })
  })

  describe('allowEndOfServiceReportCreation', () => {
    describe('when there is no end of service report', () => {
      it('returns true', () => {
        const referral = ReferralFactory.sent().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.allowEndOfServiceReportCreation).toEqual(true)
      })
    })

    describe('when there is an end of service report', () => {
      it('returns false', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = ReferralFactory.sent().build({
          sentReferralFields: {
            endOfServiceReport,
          },
        })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, null, serviceUser, [])

        expect(presenter.allowEndOfServiceReportCreation).toEqual(false)
      })
    })
  })
})
