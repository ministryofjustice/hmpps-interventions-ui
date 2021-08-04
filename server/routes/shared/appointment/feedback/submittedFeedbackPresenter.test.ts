import actionPlanAppointmentFactory from '../../../../../testutils/factories/actionPlanAppointment'
import appointmentFactory from '../../../../../testutils/factories/appointment'
import deliusServiceUserFactory from '../../../../../testutils/factories/deliusServiceUser'
import User from '../../../../models/hmppsAuth/user'
import SubmittedFeedbackPresenter from './submittedFeedbackPresenter'

describe(SubmittedFeedbackPresenter, () => {
  const userType = 'service-provider'
  const referralId = 'referral-id'

  describe('text', () => {
    it('includes the title of the page', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanAppointment = actionPlanAppointmentFactory.build()
      let presenter = new SubmittedFeedbackPresenter(actionPlanAppointment, serviceUser, userType, referralId)
      expect(presenter.text).toMatchObject({
        title: 'View feedback',
      })
      const initialAssessmentAppointment = appointmentFactory.build()
      presenter = new SubmittedFeedbackPresenter(initialAssessmentAppointment, serviceUser, userType, referralId)
      expect(presenter.text).toMatchObject({
        title: 'View feedback',
      })
    })
  })

  describe('sessionDetailsSummary', () => {
    describe('when a caseworker is passed in', () => {
      it('extracts the date and time from the appointmentTime and puts it in a SummaryList format alongside the caseworker name', () => {
        const caseworker: User = {
          username: 'Kay.Swerker',
          authSource: 'Delius',
          userId: '91229a16-b5f4-4784-942e-a484a97ac865',
        }
        const serviceUser = deliusServiceUserFactory.build()

        const actionPlanAppointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })
        let presenter = new SubmittedFeedbackPresenter(
          actionPlanAppointment,
          serviceUser,
          userType,
          referralId,
          null,
          caseworker
        )
        expect(presenter.sessionDetailsSummary).toEqual([
          {
            key: 'Caseworker',
            lines: ['Kay.Swerker'],
          },
          {
            key: 'Date',
            lines: ['01 Feb 2021'],
          },
          {
            key: 'Time',
            lines: ['13:00'],
          },
        ])
        const initialAssessmentAppointment = appointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })
        presenter = new SubmittedFeedbackPresenter(
          initialAssessmentAppointment,
          serviceUser,
          userType,
          referralId,
          null,
          caseworker
        )
        expect(presenter.sessionDetailsSummary).toEqual([
          {
            key: 'Caseworker',
            lines: ['Kay.Swerker'],
          },
          {
            key: 'Date',
            lines: ['01 Feb 2021'],
          },
          {
            key: 'Time',
            lines: ['13:00'],
          },
        ])
      })
    })

    describe('when a caseworker is not passed in', () => {
      it('extracts the date and time from the appointmentTime and puts it in a SummaryList format', () => {
        const serviceUser = deliusServiceUserFactory.build()

        const actionPlanAppointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })
        let presenter = new SubmittedFeedbackPresenter(actionPlanAppointment, serviceUser, userType, referralId)

        expect(presenter.sessionDetailsSummary).toEqual([
          {
            key: 'Date',
            lines: ['01 Feb 2021'],
          },
          {
            key: 'Time',
            lines: ['13:00'],
          },
        ])
        const initialAssessmentAppointment = appointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })
        presenter = new SubmittedFeedbackPresenter(initialAssessmentAppointment, serviceUser, userType, referralId)
        expect(presenter.sessionDetailsSummary).toEqual([
          {
            key: 'Date',
            lines: ['01 Feb 2021'],
          },
          {
            key: 'Time',
            lines: ['13:00'],
          },
        ])
      })
    })
  })

  describe('backLinkHref', () => {
    it('contains a link back to the referral progress page, including the userType and referral id in the URL', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanAppointment = actionPlanAppointmentFactory.build()
      const presenter = new SubmittedFeedbackPresenter(
        actionPlanAppointment,
        serviceUser,
        'probation-practitioner',
        'test-referral-id'
      )

      expect(presenter.backLinkHref).toEqual('/probation-practitioner/referrals/test-referral-id/progress')
    })
  })
})
