import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

describe(InterventionProgressPresenter, () => {
  describe('referralEnded', () => {
    it('returns true when the referral has ended', () => {
      const referral = sentReferralFactory.endRequested().build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.referralEnded).toEqual(true)
    })
    it('returns false when the referral has not ended', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.referralEnded).toEqual(false)
    })
  })

  describe('referralEndedFields', () => {
    it('returns ended fields when the referral has ended', () => {
      const referral = sentReferralFactory.endRequested().build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.referralEndedFields.endRequestedComments).toEqual(referral.endRequestedComments)
      expect(presenter.referralEndedFields.endRequestedReason).toEqual(referral.endRequestedReason)
      expect(presenter.referralEndedFields.endRequestedAt).toEqual(referral.endRequestedAt)
    })
    it('returns null values when the referral has not ended', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.referralEndedFields.endRequestedComments).toBeNull()
      expect(presenter.referralEndedFields.endRequestedReason).toBeNull()
      expect(presenter.referralEndedFields.endRequestedAt).toBeNull()
    })
  })

  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.createActionPlanFormAction).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

      expect(presenter.sessionTableRows).toEqual([])
    })

    describe('when a session exists but an appointment has not yet been scheduled', () => {
      it('populates the table with formatted session information, with the "Edit session details" link displayed', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [
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
            links: [
              {
                href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit',
                text: 'Edit session details',
              },
            ],
          },
        ])
      })
    })

    describe('when an appointment has been scheduled', () => {
      it('populates the table with formatted session information, with the "Reschedule session" and "Give feedback" links displayed', () => {
        const referral = sentReferralFactory.build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [
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
            links: [
              {
                href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit',
                text: 'Reschedule session',
              },
              {
                href:
                  '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback/attendance',
                text: 'Give feedback',
              },
            ],
          },
        ])
      })
    })

    describe('when the session feedback has been recorded', () => {
      describe('when the service user attended the session or was late', () => {
        it('populates the table with the "completed" status against that session and a link to view it', () => {
          const referral = sentReferralFactory.build()
          const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [
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
              links: [
                {
                  href:
                    '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback',
                  text: 'View feedback form',
                },
              ],
            },
            {
              sessionNumber: 2,
              appointmentTime: '',
              tagArgs: {
                text: 'completed',
                classes: 'govuk-tag--green',
              },
              links: [
                {
                  href:
                    '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/2/post-session-feedback',
                  text: 'View feedback form',
                },
              ],
            },
          ])
        })
      })

      describe('when the service did not attend the session', () => {
        it('populates the table with the "failure to attend" status against that session and a link to view it', () => {
          const referral = sentReferralFactory.build()
          const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [
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
              links: [
                {
                  href:
                    '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback',
                  text: 'View feedback form',
                },
              ],
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
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.text).toMatchObject({
          title: 'Accommodation',
        })
      })
    })

    describe('actionPlanStatus', () => {
      describe('when there is no action plan', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.notSubmitted().build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has been submitted', () => {
        it('returns “Submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.submitted().build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Submitted' })
        })
      })
    })

    describe('endOfServiceReportStatus', () => {
      describe('when there is no end of service report', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build({ endOfServiceReport: null })
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
          const referral = sentReferralFactory.build({ endOfServiceReport })
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has been submitted', () => {
        it('returns “Submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.submitted().build()
          const referral = sentReferralFactory.build({ endOfServiceReport })
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Submitted' })
        })
      })
    })
  })

  describe('actionPlanStatusStyle', () => {
    describe('when there is no action plan', () => {
      it('returns the inactive style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.submitted().build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

        expect(presenter.actionPlanStatusStyle).toEqual('active')
      })
    })
  })

  describe('allowActionPlanCreation', () => {
    describe('when there is no action plan', () => {
      it('returns true', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.allowActionPlanCreation).toEqual(true)
      })
    })

    describe('when there is an action plan', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

        expect(presenter.allowActionPlanCreation).toEqual(false)
      })
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = sentReferralFactory.unassigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = sentReferralFactory.assigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, [])

      expect(presenter.referralAssigned).toEqual(true)
    })
  })

  describe('endOfServiceReportStatusStyle', () => {
    describe('when there is no end of service report', () => {
      it('returns the inactive style', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has not been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.submitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.endOfServiceReportStatusStyle).toEqual('active')
      })
    })
  })

  describe('allowEndOfServiceReportCreation', () => {
    describe('when there is no end of service report', () => {
      it('returns true', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.allowEndOfServiceReportCreation).toEqual(true)
      })
    })

    describe('when there is an end of service report', () => {
      it('returns false', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, [])

        expect(presenter.allowEndOfServiceReportCreation).toEqual(false)
      })
    })
  })
})
