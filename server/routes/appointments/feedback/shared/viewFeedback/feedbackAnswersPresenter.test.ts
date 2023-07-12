// eslint-disable-next-line max-classes-per-file
import FeedbackAnswersPresenter from './feedbackAnswersPresenter'
import actionPlanAppointmentFactory from '../../../../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../../../../testutils/factories/deliusServiceUser'

describe(FeedbackAnswersPresenter, () => {
  describe('attendedAnswers', () => {
    it('returns an object with the question and answer given', () => {
      const appointment = actionPlanAppointmentFactory.build({
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
          },
          sessionFeedback: {
            sessionSummary: null,
            sessionResponse: null,
            notifyProbationPractitioner: null,
            sessionConcerns: null,
          },
        },
      })
      const serviceUser = deliusServiceUserFactory.build()

      const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)

      expect(presenter.attendedAnswers).toEqual({
        question: 'Did Alex River come to the session?',
        answer: 'Yes, they were on time',
      })
    })

    describe('when there is no value for attended', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: null,
            },
            sessionFeedback: {
              sessionSummary: null,
              sessionResponse: null,
              notifyProbationPractitioner: null,
              sessionConcerns: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)
        expect(presenter.attendedAnswers).toBeNull()
      })
    })
  })

  describe('additionalAttendanceAnswers', () => {
    describe('when there is an answer for AdditionalAttendanceInformation', () => {
      it('returns an object with the question and answer given', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'late',
              additionalAttendanceInformation: 'Alex missed the bus',
            },
            sessionFeedback: {
              sessionSummary: null,
              sessionResponse: null,
              notifyProbationPractitioner: null,
              sessionConcerns: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.additionalAttendanceAnswers).toEqual({
          question: "Add additional information about Alex's attendance:",
          answer: 'Alex missed the bus',
        })
      })
    })

    describe('when there is a null value for AdditionalAttendanceInformation', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'late',
              additionalAttendanceInformation: null,
            },
            sessionFeedback: {
              sessionSummary: null,
              sessionResponse: null,
              notifyProbationPractitioner: null,
              sessionConcerns: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)
        expect(presenter.additionalAttendanceAnswers).toBeNull()
      })
    })
  })

  describe('notifyProbationPractitionerAnswers', () => {
    describe('if the behaviour question was answered with yes', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "yes"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitioner: true,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build({ name: { forename: 'Alex' } })

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toEqual({
          question: 'Did anything concern you about Alex River?',
          answer: 'Yes',
        })
      })
    })

    describe('if the behaviour question was answered with no', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "no"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitioner: false,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toEqual({
          question: 'Did anything concern you about Alex River?',
          answer: 'No',
        })
      })
    })

    describe('if the behaviour question was not answered', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitioner: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser)

        expect(presenter.notifyProbationPractitionerAnswers).toBeNull()
      })
    })
  })
})
