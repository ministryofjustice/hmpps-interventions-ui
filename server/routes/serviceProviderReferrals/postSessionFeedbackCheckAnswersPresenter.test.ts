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

  describe('attendedAnswers', () => {
    const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

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

      const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)
        expect(presenter.attendedAnswers).toBeNull()
      })
    })
  })

  describe('additionalAttendanceAnswers', () => {
    const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)
        expect(presenter.additionalAttendanceAnswers).toBeNull()
      })
    })
  })

  describe('behaviourDescriptionAnswers', () => {
    const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

        expect(presenter.behaviourDescriptionAnswers).toBeNull()
      })
    })
  })

  describe('notifyProbationPractitionerAnswers', () => {
    const actionPlanId = 'f9d7c3fc-21e7-4b2e-b906-5a317b826642'

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

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

        const presenter = new PostSessionFeedbackCheckAnswersPresenter(appointment, serviceUser, actionPlanId)

        expect(presenter.notifyProbationPractitionerAnswers).toBeNull()
      })
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
