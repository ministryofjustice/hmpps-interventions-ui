import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import SubmittedPostSessionFeedbackPresenter from './submittedPostSessionFeedbackPresenter'

describe(SubmittedPostSessionFeedbackPresenter, () => {
  describe('text', () => {
    it('includes the title of the page', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      const presenter = new SubmittedPostSessionFeedbackPresenter(appointment, serviceUser)

      expect(presenter.text).toMatchObject({
        title: 'View feedback',
      })
    })
  })

  describe('serviceUserBannerPresenter', () => {
    it('is instantiated with the service user', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      const presenter = new SubmittedPostSessionFeedbackPresenter(appointment, serviceUser)

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })

  describe('sessionDetailsSummary', () => {
    it('extracts the date and time from the appointmentTime and puts it in a SummaryList format', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })
      const presenter = new SubmittedPostSessionFeedbackPresenter(appointment, serviceUser)

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
})
