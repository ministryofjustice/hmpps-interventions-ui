// eslint-disable-next-line max-classes-per-file
import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import { AppointmentDetails } from '../../appointmentDetails'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import AttendanceFeedbackPresenter from '../attendance/attendanceFeedbackPresenter'
import CheckFeedbackAnswersPresenter from './checkFeedbackAnswersPresenter'
import BehaviourFeedbackPresenter from '../behaviour/behaviourFeedbackPresenter'

describe('for a class that extends abstract class CheckFeedbackAnswersPresenter', () => {
  class ExtendedCheckFeedbackAnswersPresenter extends CheckFeedbackAnswersPresenter {
    readonly submitHref: string = ''

    constructor(appointment: AppointmentDetails, private readonly serviceUser: DeliusServiceUser) {
      super(appointment)
    }

    protected get attendancePresenter(): AttendanceFeedbackPresenter {
      return new (class extends AttendanceFeedbackPresenter {
        constructor(appointment: AppointmentDetails) {
          super(appointment)
        }

        readonly text = {
          title: `title`,
          subTitle: 'subTitle',
          attendanceQuestion: 'attendanceQuestion',
          attendanceQuestionHint: 'attendanceQuestionHint',
          additionalAttendanceInformationLabel: 'additionalAttendanceInformationLabel',
        }
      })(this.appointment)
    }

    protected get behaviourPresenter(): BehaviourFeedbackPresenter {
      return new BehaviourFeedbackPresenter(this.appointment, this.serviceUser)
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
