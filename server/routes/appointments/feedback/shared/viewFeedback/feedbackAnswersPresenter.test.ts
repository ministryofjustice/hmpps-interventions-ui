// eslint-disable-next-line max-classes-per-file
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { AppointmentDetails } from '../../appointmentDetails'
import FeedbackAnswersPresenter from './feedbackAnswersPresenter'
import AttendanceFeedbackPresenter from '../attendance/attendanceFeedbackPresenter'
import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'
import ActionPlanSessionBehaviourFeedbackPresenter from '../../actionPlanSessions/behaviour/actionPlanSessionBehaviourFeedbackPresenter'

describe(FeedbackAnswersPresenter, () => {
  class ExtendedFeedbackAnswersPresenter extends FeedbackAnswersPresenter {
    constructor(appointment: AppointmentDetails, private readonly serviceUser: DeliusServiceUser) {
      super(appointment)
    }

    protected get attendancePresenter(): AttendanceFeedbackPresenter {
      return new (class extends AttendanceFeedbackPresenter {
        constructor(appointment: AppointmentDetails, private readonly serviceUser: DeliusServiceUser) {
          super(appointment)
        }

        readonly text = {
          title: `Add attendance feedback`,
          subTitle: 'Session details',
          attendanceQuestion: `Did ${this.serviceUser.firstName} attend this session?`,
          attendanceQuestionHint: 'Select one option',
          additionalAttendanceInformationLabel: `Add additional information about ${this.serviceUser.firstName}'s attendance:`,
        }
      })(this.appointment, this.serviceUser)
    }

    protected get behaviourPresenter(): ActionPlanSessionBehaviourFeedbackPresenter {
      return new ActionPlanSessionBehaviourFeedbackPresenter(this.appointment, this.serviceUser)
    }
  }
  describe('attendedAnswers', () => {
    it('returns an object with the question and answer given', () => {
      const appointment = actionPlanAppointmentFactory.build({
        sessionFeedback: {
          attendance: {
            attended: 'yes',
          },
          behaviour: {
            behaviourDescription: null,
            notifyProbationPractitioner: null,
          },
        },
      })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

      const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

      expect(presenter.attendedAnswers).toEqual({
        question: 'Did Alex attend this session?',
        answer: 'Yes, they were on time',
      })
    })

    describe('when there is no value for attended', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: null,
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)
        expect(presenter.attendedAnswers).toBeNull()
      })
    })
  })

  describe('additionalAttendanceAnswers', () => {
    describe('when there is an answer for AdditionalAttendanceInformation', () => {
      it('returns an object with the question and answer given', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: 'late',
              additionalAttendanceInformation: 'Alex missed the bus',
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.additionalAttendanceAnswers).toEqual({
          question: "Add additional information about Alex's attendance:",
          answer: 'Alex missed the bus',
        })
      })
    })

    describe('when there is no answer for AdditionalAttendanceInformation', () => {
      it('returns an object with "None" as the answer', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: 'late',
              additionalAttendanceInformation: '',
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.additionalAttendanceAnswers).toEqual({
          question: "Add additional information about Alex's attendance:",
          answer: 'None',
        })
      })
    })

    describe('when there is a null value for AdditionalAttendanceInformation', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: 'late',
              additionalAttendanceInformation: null,
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)
        expect(presenter.additionalAttendanceAnswers).toBeNull()
      })
    })
  })

  describe('behaviourDescriptionAnswers', () => {
    describe('if the behaviour question was answered', () => {
      it('returns an object with the question and answer given', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: 'yes',
            },
            behaviour: {
              behaviourDescription: 'Alex had a bad attitude',
              notifyProbationPractitioner: true,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.behaviourDescriptionAnswers).toEqual({
          question: "Describe Alex's behaviour in this session",
          answer: 'Alex had a bad attitude',
        })
      })
    })

    describe('if the behaviour question was not answered', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            attendance: {
              attended: 'yes',
            },
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.behaviourDescriptionAnswers).toBeNull()
      })
    })
  })

  describe('notifyProbationPractitionerAnswers', () => {
    describe('if the behaviour question was answered with yes', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "yes"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            behaviour: {
              behaviourDescription: 'Alex had a bad attitude',
              notifyProbationPractitioner: true,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toEqual({
          question: 'If you described poor behaviour, do you want to notify the probation practitioner?',
          answer: 'Yes',
        })
      })
    })

    describe('if the behaviour question was answered with no', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "no"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            behaviour: {
              behaviourDescription: 'Alex had a good attitude',
              notifyProbationPractitioner: false,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toEqual({
          question: 'If you described poor behaviour, do you want to notify the probation practitioner?',
          answer: 'No',
        })
      })
    })

    describe('if the behaviour question was not answered', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          sessionFeedback: {
            behaviour: {
              behaviourDescription: null,
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })

        const presenter = new ExtendedFeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toBeNull()
      })
    })
  })
})
