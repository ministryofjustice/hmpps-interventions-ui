import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import interventionFactory from '../../../testutils/factories/intervention'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import SessionStatusPresenter from '../shared/sessionStatusPresenter'
import { SessionStatus } from '../../utils/sessionStatus'

describe(InterventionProgressPresenter, () => {
  describe('referralEnded', () => {
    it('returns true when the referral has ended', () => {
      const referral = sentReferralFactory.endRequested().build()
      const intervention = interventionFactory.build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        null,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralEnded).toEqual(true)
    })
    it('returns false when the referral has not ended', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        null,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralEnded).toEqual(false)
    })
  })

  describe('referralEndedFields', () => {
    it('returns ended fields when the referral has ended', () => {
      const referral = sentReferralFactory.endRequested().build()
      const intervention = interventionFactory.build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        null,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralEndedFields.endRequestedComments).toEqual(referral.endRequestedComments)
      expect(presenter.referralEndedFields.endRequestedReason).toEqual(referral.endRequestedReason)
      expect(presenter.referralEndedFields.endRequestedAt).toEqual(referral.endRequestedAt)
    })
    it('returns null values when the referral has not ended', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        null,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralEndedFields.endRequestedComments).toBeNull()
      expect(presenter.referralEndedFields.endRequestedReason).toBeNull()
      expect(presenter.referralEndedFields.endRequestedAt).toBeNull()
    })
  })

  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        null,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.sessionTableRows).toEqual([])
    })

    describe('when there are multiple sessions', () => {
      it('they must be ordered by session number', () => {
        const referral = sentReferralFactory.build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          actionPlan,
          [
            actionPlanAppointmentFactory.build({ sessionNumber: 2 }),
            actionPlanAppointmentFactory.build({ sessionNumber: 3 }),
            actionPlanAppointmentFactory.build({ sessionNumber: 1 }),
          ],
          supplierAssessmentFactory.build()
        )
        expect(presenter.sessionTableRows.map(row => row.sessionNumber)).toEqual([1, 2, 3])
      })
    })

    describe('when a session exists but an appointment has not yet been scheduled', () => {
      it('populates the table with formatted session information, with the "Edit session details" link displayed', () => {
        const referral = sentReferralFactory.build()
        const intervention = interventionFactory.build()
        const actionPlan = actionPlanFactory.submitted().build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2' })
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          actionPlan,
          [actionPlanAppointmentFactory.newlyCreated().build()],
          supplierAssessmentFactory.build()
        )
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: '',
            statusPresenter: new SessionStatusPresenter(SessionStatus.notScheduled),
            links: [
              {
                href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit/start',
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
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          actionPlan,
          [
            actionPlanAppointmentFactory.build({
              sessionNumber: 1,
              appointmentTime: '2020-12-07T12:00:00.000000Z',
              durationInMinutes: 120,
            }),
          ],
          supplierAssessmentFactory.build()
        )
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: 'Midday on 7 Dec 2020',
            statusPresenter: new SessionStatusPresenter(SessionStatus.scheduled),
            links: [
              {
                href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/sessions/1/edit/start',
                text: 'Reschedule session',
              },
              {
                href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback/attendance',
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
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            actionPlan,
            [
              actionPlanAppointmentFactory.attended('yes').build({ sessionNumber: 1 }),
              actionPlanAppointmentFactory.attended('late').build({ sessionNumber: 2 }),
            ],
            supplierAssessmentFactory.build()
          )

          expect(presenter.sessionTableRows).toEqual([
            {
              sessionNumber: 1,
              appointmentTime: '',
              statusPresenter: new SessionStatusPresenter(SessionStatus.completed),
              links: [
                {
                  href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback',
                  text: 'View feedback form',
                },
              ],
            },
            {
              sessionNumber: 2,
              appointmentTime: '',
              statusPresenter: new SessionStatusPresenter(SessionStatus.completed),
              links: [
                {
                  href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/2/post-session-feedback',
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
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            actionPlan,
            [actionPlanAppointmentFactory.attended('no').build()],
            supplierAssessmentFactory.build()
          )

          expect(presenter.sessionTableRows).toEqual([
            {
              sessionNumber: 1,
              appointmentTime: '',
              statusPresenter: new SessionStatusPresenter(SessionStatus.didNotAttend),
              links: [
                {
                  href: '/service-provider/action-plan/77923562-755c-48d9-a74c-0c8565aac9a2/appointment/1/post-session-feedback',
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
        const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.text).toMatchObject({
          title: 'Accommodation',
        })
      })
    })

    describe('endOfServiceReportStatus', () => {
      describe('when there is no end of service report', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build({ endOfServiceReport: null })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
          const referral = sentReferralFactory.build({ endOfServiceReport })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Not submitted' })
        })
      })

      describe('when the end of service report has been submitted', () => {
        it('returns “Submitted”', () => {
          const endOfServiceReport = endOfServiceReportFactory.submitted().build()
          const referral = sentReferralFactory.build({ endOfServiceReport })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.text).toMatchObject({ endOfServiceReportStatus: 'Submitted' })
        })
      })
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = sentReferralFactory.unassigned().build()
      const intervention = interventionFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        actionPlan,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const presenter = new InterventionProgressPresenter(
        referral,
        intervention,
        actionPlan,
        [],
        supplierAssessmentFactory.build()
      )

      expect(presenter.referralAssigned).toEqual(true)
    })
  })

  describe('endOfServiceReportStatusStyle', () => {
    describe('when there is no end of service report', () => {
      it('returns the inactive style', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has not been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportStatusStyle).toEqual('inactive')
      })
    })

    describe('when the end of service report has been submitted', () => {
      it('returns the active style', () => {
        const endOfServiceReport = endOfServiceReportFactory.submitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportStatusStyle).toEqual('active')
      })
    })
  })

  describe('canSubmitEndOfServiceReport', () => {
    describe('when the referral has been assigned', () => {
      describe('when there is no end of service report', () => {
        it('returns true', () => {
          const referral = sentReferralFactory.assigned().build({ endOfServiceReport: null })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.canSubmitEndOfServiceReport).toEqual(true)
        })
      })

      describe('when there is an end of service report but it has not been submitted', () => {
        it('returns true', () => {
          const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
          const referral = sentReferralFactory.assigned().build({ endOfServiceReport })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.canSubmitEndOfServiceReport).toEqual(true)
        })
      })

      describe('when there is an end of service report and it has been submitted', () => {
        it('returns false', () => {
          const endOfServiceReport = endOfServiceReportFactory.submitted().build()
          const referral = sentReferralFactory.assigned().build({ endOfServiceReport })
          const intervention = interventionFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            null,
            [],
            supplierAssessmentFactory.build()
          )

          expect(presenter.canSubmitEndOfServiceReport).toEqual(false)
        })
      })
    })

    describe('when the referral has not been assigned', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build()
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.canSubmitEndOfServiceReport).toEqual(false)
      })
    })
  })

  describe('endOfServiceReportSubmitted', () => {
    describe('when there is no end of service report', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportSubmitted).toEqual(false)
      })
    })

    describe('when there is an end of service report but it has not been submitted', () => {
      it('returns false', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportSubmitted).toEqual(false)
      })
    })

    describe('when there is an end of service report and it has been submitted', () => {
      it('returns false', () => {
        const endOfServiceReport = endOfServiceReportFactory.submitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportSubmitted).toEqual(true)
      })
    })
  })

  describe('endOfServiceReportButtonActionText', () => {
    describe('when there is no end of service report', () => {
      it('returns Create', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportButtonActionText).toEqual('Create')
      })
    })

    describe('when there is an end of service report but it has not been submitted', () => {
      it('returns Continue', () => {
        const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportButtonActionText).toEqual('Continue')
      })
    })

    describe('when there is an end of service report and it has been submitted', () => {
      it('returns null', () => {
        const endOfServiceReport = endOfServiceReportFactory.submitted().build()
        const referral = sentReferralFactory.build({ endOfServiceReport })
        const intervention = interventionFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.endOfServiceReportButtonActionText).toEqual(null)
      })
    })
  })

  describe('supplierAssessmentLink', () => {
    describe('when there is no supplier appointment scheduled', () => {
      it('returns a link to the scheduling page', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.supplierAssessmentLink).toEqual([
          {
            text: 'Schedule',
            hiddenText: ' initial assessment',
            href: `/service-provider/referrals/${referral.id}/supplier-assessment/schedule/start`,
          },
        ])
      })
    })

    describe('when there is a supplier assessment scheduled', () => {
      describe('when the appointment is in the past', () => {
        it('returns links to a page to add feedback for the appointment', () => {
          const referral = sentReferralFactory.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            interventionFactory.build(),
            null,
            [],
            supplierAssessmentFactory.withAnAppointment(initialAssessmentAppointmentFactory.inThePast.build()).build()
          )

          expect(presenter.supplierAssessmentLink).toEqual([
            {
              text: 'Add feedback',
              href: `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`,
            },
          ])
        })
      })

      describe('when the appointment is in the future', () => {
        it('returns links to a page to view appointment details for the appointment', () => {
          const referral = sentReferralFactory.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            interventionFactory.build(),
            null,
            [],
            supplierAssessmentFactory.withAnAppointment(initialAssessmentAppointmentFactory.inTheFuture.build()).build()
          )

          expect(presenter.supplierAssessmentLink).toEqual([
            {
              text: 'View appointment details',
              href: `/service-provider/referrals/${referral.id}/supplier-assessment`,
            },
          ])
        })
      })
    })

    describe('when the supplier assessment appointment was attended', () => {
      it('returns a link to a page to view feedback for the appointment', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.withAttendedAppointment.build()
        )

        expect(presenter.supplierAssessmentLink).toEqual([
          {
            text: 'View feedback',
            href: `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`,
          },
        ])
      })
    })

    describe('when the supplier assessment appointment was not attended', () => {
      it('returns a link to a page to schedule a new appointment', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.withNonAttendedAppointment.build()
        )

        expect(presenter.supplierAssessmentLink).toEqual([
          {
            text: 'Reschedule',
            href: `/service-provider/referrals/${referral.id}/supplier-assessment/schedule/start`,
          },
        ])
      })
    })
  })

  describe('supplierAssessmentMessage', () => {
    describe('when there is no supplier appointment scheduled', () => {
      it('provides text relating to the status of the appointment', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.build()
        )

        expect(presenter.supplierAssessmentMessage).toEqual(
          'Complete the initial assessment within 10 working days from receiving a new referral. Once you enter the appointment details, you will be able to change them.'
        )
      })
    })

    describe('when there is a supplier assessment scheduled', () => {
      describe('and the appointment is in the past', () => {
        it('provides text relating to the status of the appointment', () => {
          const referral = sentReferralFactory.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            interventionFactory.build(),
            null,
            [],
            supplierAssessmentFactory.withAnAppointment(initialAssessmentAppointmentFactory.inThePast.build()).build()
          )

          expect(presenter.supplierAssessmentMessage).toEqual(
            'Feedback needs to be added on the same day the assessment is delivered.'
          )
        })
      })

      describe('and the appointment is in the future', () => {
        it('provides text relating to the status of the appointment', () => {
          const referral = sentReferralFactory.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            interventionFactory.build(),
            null,
            [],
            supplierAssessmentFactory.withAnAppointment(initialAssessmentAppointmentFactory.inTheFuture.build()).build()
          )

          expect(presenter.supplierAssessmentMessage).toEqual(
            'Feedback needs to be added on the same day the assessment is delivered.'
          )
        })
      })
    })

    describe('when the supplier assessment appointment was attended', () => {
      it('provides text relating to the status of the appointment', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.withAttendedAppointment.build()
        )

        expect(presenter.supplierAssessmentMessage).toEqual(
          'The initial assessment has been delivered and feedback added.'
        )
      })
    })

    describe('when the supplier assessment appointment was not attended', () => {
      it('provides text relating to the status of the appointment', () => {
        const referral = sentReferralFactory.build()

        const presenter = new InterventionProgressPresenter(
          referral,
          interventionFactory.build(),
          null,
          [],
          supplierAssessmentFactory.withNonAttendedAppointment.build()
        )

        expect(presenter.supplierAssessmentMessage).toEqual(
          'The initial assessment has been delivered and feedback added.'
        )
      })
    })
  })

  describe('supplierAssessmentStatusPresenter', () => {
    it('returns a presenter with the supplier assessment’s status', () => {
      const supplierAssessment = supplierAssessmentFactory.justCreated.build()

      const presenter = new InterventionProgressPresenter(
        sentReferralFactory.build(),
        interventionFactory.build(),
        null,
        [],
        supplierAssessment
      )

      expect(presenter.supplierAssessmentStatusPresenter.text).toEqual('not scheduled')
    })
  })
})
