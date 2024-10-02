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

      const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

      expect(presenter.attendedAnswers).toEqual({
        question: 'Did Alex River attend the session?',
        answer: 'Yes',
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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)
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
              attended: 'yes',
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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

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
              attended: 'yes',
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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)
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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

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

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerAnswers).toBeNull()
      })
    })
  })

  describe('notifyProbationPractitionerOfBehaviourAnswers', () => {
    describe('if notify probation practitioner of behaviour checkbox was checked and session behaviour information given', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "yes" followed by session behaviour', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfBehaviour: true,
              sessionBehaviour: 'stub session behaviour information',
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build({ name: { forename: 'Alex' } })

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfBehaviourAnswers).toEqual({
          question: 'Does the probation practitioner need to be notified about poor behaviour?',
          answer: 'Yes - stub session behaviour information',
        })
      })
    })

    describe('if notify probation practitioner of behaviour checkbox was not checked', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "no"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfBehaviour: false,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfBehaviourAnswers).toEqual({
          question: 'Does the probation practitioner need to be notified about poor behaviour?',
          answer: 'No',
        })
      })
    })
  })

  describe('notifyProbationPractitionerOfConcernsAnswers', () => {
    describe('if notify probation practitioner of concerns checkbox was checked and session concerns information given', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "yes" followed by session concerns', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfConcerns: true,
              sessionConcerns: 'stub session concerns information',
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build({ name: { forename: 'Alex' } })

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfConcernsAnswers).toEqual({
          question: `Does the probation practitioner need to be notified about any concerns?`,
          answer: 'Yes - stub session concerns information',
        })
      })
    })

    describe('if notify probation practitioner of concerns checkbox was not checked', () => {
      it('returns an object with the question and answer given, converting the boolean value into a "no"', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfConcerns: false,
            },
          },
        })

        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfConcernsAnswers).toEqual({
          question: `Does the probation practitioner need to be notified about any concerns?`,
          answer: 'No',
        })
      })
    })
  })

  describe('notify probation practitioner of behaviour and concerns checkbox', () => {
    describe('if both of the notify probation practitioner checkboxes were checked', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfBehaviour: true,
              sessionBehaviour: 'stub session behaviour information',
              notifyProbationPractitionerOfConcerns: true,
              sessionConcerns: 'stub session concerns information',
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfBehaviourAnswers).toEqual({
          question: `Does the probation practitioner need to be notified about poor behaviour?`,
          answer: 'Yes - stub session behaviour information',
        })
        expect(presenter.notifyProbationPractitionerOfConcernsAnswers).toEqual({
          question: `Does the probation practitioner need to be notified about any concerns?`,
          answer: 'Yes - stub session concerns information',
        })
      })
    })
    describe('if none of the notify probation practitioner checkboxes were checked', () => {
      it('returns null', () => {
        const appointment = actionPlanAppointmentFactory.build({
          appointmentFeedback: {
            sessionFeedback: {
              notifyProbationPractitionerOfBehaviour: null,
              notifyProbationPractitionerOfConcerns: null,
            },
          },
        })
        const serviceUser = deliusServiceUserFactory.build()

        const presenter = new FeedbackAnswersPresenter(appointment, serviceUser, false)

        expect(presenter.notifyProbationPractitionerOfBehaviourAnswers).toBeNull()
        expect(presenter.notifyProbationPractitionerOfConcernsAnswers).toBeNull()
      })
    })
  })
})
