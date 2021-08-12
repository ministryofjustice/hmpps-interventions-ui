// eslint-disable-next-line max-classes-per-file
import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import CheckFeedbackAnswersPresenter from './checkFeedbackAnswersPresenter'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import FeedbackAnswersPresenter from '../viewFeedback/feedbackAnswersPresenter'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'

describe('for a class that extends abstract class CheckFeedbackAnswersPresenter', () => {
  class ExtendedCheckFeedbackAnswersPresenter extends CheckFeedbackAnswersPresenter {
    readonly submitHref = ''

    readonly backLinkHref = ''

    readonly feedbackAnswersPresenter

    constructor(appointment: ActionPlanAppointment | InitialAssessmentAppointment, serviceUser: DeliusServiceUser) {
      super(appointment)
      this.feedbackAnswersPresenter = new FeedbackAnswersPresenter(appointment, serviceUser)
    }
  }

  describe('sessionDetailsSummary', () => {
    it('extracts the date and time from the appointmentTime and puts it in a SummaryList format', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })
      const presenter = new ExtendedCheckFeedbackAnswersPresenter(appointment, serviceUser)

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
