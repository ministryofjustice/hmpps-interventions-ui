import PostSessionFeedbackCheckAnswersPresenter from './postSessionFeedbackCheckAnswersPresenter'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'

describe(PostSessionFeedbackCheckAnswersPresenter, () => {
  describe('text', () => {
    it('includes the title of the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

      const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

      expect(presenter.text).toMatchObject({
        title: 'Confirm feedback',
      })
    })
  })

  describe('submitHref', () => {
    it('includes the action plan id and session number', () => {
      const appointment = actionPlanAppointmentFactory.build({ sessionNumber: 1 })
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanId = '77f0d8fc-9443-492c-b352-4cab66acbf3c'

      const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

      expect(presenter.submitHref).toEqual(
        '/service-provider/action-plan/77f0d8fc-9443-492c-b352-4cab66acbf3c/appointment/1/post-session-feedback/submit'
      )
    })
  })

  describe('sessionDetailsSummary', () => {
    it('extracts the date and time from the appointmentTime and puts it in a SummaryList format', () => {
      const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'
      const serviceUser = deliusServiceUserFactory.build()
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })
      const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

      expect(presenter.sessionDetailsSummary).toEqual([
        {
          key: 'Date',
          lines: ['01 Feb 2021'],
          isList: false,
        },
        {
          key: 'Time',
          lines: ['13:00'],
          isList: false,
        },
      ])
    })
  })

  describe('serviceUserBannerPresenter', () => {
    it('is instantiated with the service user', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'
      const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })
})
