import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import interventionFactory from '../../../testutils/factories/intervention'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'

describe(InterventionProgressPresenter, () => {
  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.sessionTableRows).toEqual([])
    })

    describe('when a session exists but an appointment has not yet been scheduled', () => {
      it('populates the table with formatted session information, with no link text or href', () => {
        const referral = sentReferralFactory.build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          [actionPlanAppointmentFactory.newlyCreated().build()],
          null,
          supplierAssessment,
          null
        )
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: '',
            tagArgs: {
              text: 'not scheduled',
              classes: 'govuk-tag--grey',
            },
            link: null,
          },
        ])
      })
    })

    describe('when an appointment has been scheduled', () => {
      it('populates the table with formatted session information, with the "Reschedule session" and "Give feedback" links displayed', () => {
        const referral = sentReferralFactory.build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.build()
        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          [
            actionPlanAppointmentFactory.build({
              sessionNumber: 1,
              appointmentTime: '2020-12-07T13:00:00.000000Z',
              durationInMinutes: 120,
            }),
          ],
          null,
          supplierAssessment,
          null
        )
        expect(presenter.sessionTableRows).toEqual([
          {
            sessionNumber: 1,
            appointmentTime: '07 Dec 2020, 13:00',
            tagArgs: {
              text: 'scheduled',
              classes: 'govuk-tag--blue',
            },
            link: null,
          },
        ])
      })
    })

    describe('when session feedback has been recorded', () => {
      describe('when the service user attended the session or was late', () => {
        it('populates the table with the "completed" status against that session and a link to view it', () => {
          const referral = sentReferralFactory.build({ actionPlanId: 'c59809e0-ab78-4723-bbef-bd34bc6df110' })
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [
              actionPlanAppointmentFactory.attended('yes').build({ sessionNumber: 1 }),
              actionPlanAppointmentFactory.attended('late').build({ sessionNumber: 2 }),
            ],
            null,
            supplierAssessment,
            null
          )
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
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [actionPlanAppointmentFactory.attended('no').build()],
            null,
            supplierAssessment,
            null
          )
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
        const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
        const supplierAssessment = supplierAssessmentFactory.build()
        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.text).toMatchObject({
          title: 'Accommodation progress',
        })
      })
    })
  })

  describe('referralCancellationHref', () => {
    it('returns the url including referral id for the referral cancellation page', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralCancellationHref).toEqual(
        `/probation-practitioner/referrals/${referral.id}/cancellation/reason`
      )
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = sentReferralFactory.unassigned().build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralAssigned).toEqual(true)
    })
  })

  describe('referralEndRequested', () => {
    it('returns true when the referral has ended', () => {
      const referral = sentReferralFactory.endRequested().build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralEndRequested).toEqual(true)
    })

    it('returns false when the referral has not ended', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()

      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralEndRequested).toEqual(false)
    })
  })

  describe('referralEndRequestedText', () => {
    it('returns the requested end date when an end has been requested', () => {
      const referral = sentReferralFactory.endRequested().build({ endRequestedAt: '2021-04-28T20:45:21.986389Z' })
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralEndRequestedText).toEqual('You requested to end this service on 28 Apr 2021.')
    })

    it('returns an empty string when an end has not been requested', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()

      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

      expect(presenter.referralEndRequestedText).toEqual('')
    })
  })

  describe('hasEndOfServiceReport', () => {
    describe('when the referral has no end of service report', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build({ endOfServiceReport: null })
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.build()
        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.hasEndOfServiceReport).toEqual(false)
      })
    })
    describe('when the referral has an end of service report', () => {
      describe('and it is not submitted', () => {
        it('returns false', () => {
          const referral = sentReferralFactory.build({
            endOfServiceReport: endOfServiceReportFactory.justCreated().build(),
          })
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [],
            null,
            supplierAssessment,
            null
          )

          expect(presenter.hasEndOfServiceReport).toEqual(false)
        })
      })

      describe('and it is submitted', () => {
        it('returns true', () => {
          const referral = sentReferralFactory.build({
            endOfServiceReport: endOfServiceReportFactory.submitted().build(),
          })
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.build()
          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [],
            null,
            supplierAssessment,
            null
          )

          expect(presenter.hasEndOfServiceReport).toEqual(true)
        })
      })
    })
  })

  describe('endOfServiceReportTableHeaders', () => {
    it('returns the headers for the end of service report table', () => {
      const referral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

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
      const intervention = interventionFactory.build()
      const supplierAssessment = supplierAssessmentFactory.build()
      const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

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

  describe('shouldDisplaySupplierAssessmentSummaryList', () => {
    describe('when the referral has no assignee', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.unassigned().build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.justCreated.build()

        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.shouldDisplaySupplierAssessmentSummaryList).toEqual(false)
      })
    })

    describe('when the referral has an assignee', () => {
      it('returns true', () => {
        const referral = sentReferralFactory.assigned().build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.justCreated.build()

        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.shouldDisplaySupplierAssessmentSummaryList).toEqual(true)
      })
    })
  })

  describe('supplierAssessmentMessage', () => {
    describe('when the supplier assessment has not been scheduled', () => {
      describe('when the referral has no assignee', () => {
        it('returns an appropriate message', () => {
          const referral = sentReferralFactory.unassigned().build()
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.justCreated.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [],
            null,
            supplierAssessment,
            null
          )

          expect(presenter.supplierAssessmentMessage).toEqual(
            'Once a caseworker has been assigned the assessment will be booked.'
          )
        })
      })

      describe('when the referral has an assignee', () => {
        it('returns an appropriate message', () => {
          const referral = sentReferralFactory.assigned().build()
          const intervention = interventionFactory.build()
          const supplierAssessment = supplierAssessmentFactory.justCreated.build()

          const presenter = new InterventionProgressPresenter(
            referral,
            intervention,
            [],
            null,
            supplierAssessment,
            hmppsAuthUserFactory.build()
          )

          expect(presenter.supplierAssessmentMessage).toEqual(
            'A caseworker has been assigned and will book the assessment appointment with the service user.'
          )
        })
      })
    })

    describe('when the supplier assessment has been scheduled', () => {
      it('returns an appropriate message', () => {
        const referral = sentReferralFactory.build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.withSingleAppointment.build()

        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.supplierAssessmentMessage).toEqual('The appointment has been scheduled by the supplier.')
      })
    })
  })

  describe('supplierAssessmentCaseworker', () => {
    describe('when the referral has no assignee', () => {
      it('returns an empty string', () => {
        const referral = sentReferralFactory.unassigned().build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.justCreated.build()

        const presenter = new InterventionProgressPresenter(referral, intervention, [], null, supplierAssessment, null)

        expect(presenter.supplierAssessmentCaseworker).toEqual('')
      })
    })

    describe('when the referral has an assignee', () => {
      it('returns the assignee’s name', () => {
        const referral = sentReferralFactory.assigned().build()
        const intervention = interventionFactory.build()
        const supplierAssessment = supplierAssessmentFactory.justCreated.build()
        const assignee = hmppsAuthUserFactory.build({ firstName: 'Liam', lastName: 'Johnson' })

        const presenter = new InterventionProgressPresenter(
          referral,
          intervention,
          [],
          null,
          supplierAssessment,
          assignee
        )

        expect(presenter.supplierAssessmentCaseworker).toEqual('Liam Johnson')
      })
    })
  })
})
