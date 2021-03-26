import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import PostSessionFeedbackPresenter from './postSessionFeedbackPresenter'

describe(PostSessionFeedbackPresenter, () => {
  describe('text', () => {
    it('contains a title including the name of the service category and a subtitle', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const serviceUser = deliusServiceUserFactory.build()
      const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

      expect(presenter.text).toMatchObject({ title: 'Social inclusion: add feedback', subTitle: 'Session details' })
    })
  })

  describe('serviceUserBannerPresenter', () => {
    it('is instantiated with the service user', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const serviceUser = deliusServiceUserFactory.build()
      const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })

  describe('sessionDetailsSummary', () => {
    it('extracts the date and time from the appointmentTime and puts it in a SummaryList format', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const serviceUser = deliusServiceUserFactory.build()
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })
      const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

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
