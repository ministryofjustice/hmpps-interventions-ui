import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import PostSessionFeedbackPresenter from './postSessionFeedbackPresenter'

describe(PostSessionFeedbackPresenter, () => {
  describe('text', () => {
    it('contains a title including the name of the service category and a subtitle, and the attendance questions', () => {
      const appointment = actionPlanAppointmentFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
      const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

      expect(presenter.text).toMatchObject({
        title: 'Social inclusion: add feedback',
        subTitle: 'Session details',
        attendanceQuestion: 'Did Alex attend this session?',
        additionalAttendanceInformationLabel: "Add additional information about Alex's attendance:",
      })
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
    it('extracts the date and time from the appointmentTime puts it in a SummaryList format', () => {
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

  describe('errorSummary', () => {
    const appointment = actionPlanAppointmentFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    describe('when there is an error', () => {
      it('returns a summary of the error', () => {
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory, {
          errors: [
            {
              errorSummaryLinkedField: 'attended',
              formFields: ['attended'],
              message: 'Select whether the service user attended or not',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'attended', message: 'Select whether the service user attended or not' },
        ])
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('errorMessage', () => {
    const appointment = actionPlanAppointmentFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    describe('when there is an error', () => {
      it('returns the error message', () => {
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory, {
          errors: [
            {
              errorSummaryLinkedField: 'attended',
              formFields: ['attended'],
              message: 'Select whether the service user attended or not',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Select whether the service user attended or not')
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

        expect(presenter.errorMessage).toBeNull()
      })
    })
  })

  describe('attendanceResponses', () => {
    describe('when attendance has not been set on the appointment', () => {
      it('contains the attendance questions and values, and doesn’t set any value to "checked"', () => {
        const appointment = actionPlanAppointmentFactory.build()
        const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

        expect(presenter.attendanceResponses).toEqual([
          {
            value: 'yes',
            text: 'Yes, they were on time',
            checked: false,
          },
          {
            value: 'late',
            text: 'They were late',
            checked: false,
          },
          {
            value: 'no',
            text: 'No',
            checked: false,
          },
        ])
      })
    })

    describe('when attendance has been set on the appointment', () => {
      const responseValues = ['yes', 'late', 'no'] as ('yes' | 'late' | 'no')[]

      responseValues.forEach(responseValue => {
        const appointment = actionPlanAppointmentFactory.build({
          attendance: { attended: responseValue },
        })

        describe(`service provider has selected ${responseValue}`, () => {
          it(`contains the attendance questions and values, and marks ${responseValue} as "checked"`, () => {
            const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
            const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex' })
            const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

            expect(presenter.attendanceResponses).toEqual([
              {
                value: 'yes',
                text: 'Yes, they were on time',
                checked: responseValue === 'yes',
              },
              {
                value: 'late',
                text: 'They were late',
                checked: responseValue === 'late',
              },
              {
                value: 'no',
                text: 'No',
                checked: responseValue === 'no',
              },
            ])
          })
        })
      })
    })
  })

  describe('additionalAttendanceInformationValue', () => {
    describe('when there is no user input data', () => {
      describe('when the appointment already has additionalAttendanceInformation set', () => {
        it('uses that value as the value attribute', () => {
          const appointment = actionPlanAppointmentFactory.build({
            attendance: { attended: 'late', additionalAttendanceInformation: 'Alex missed the bus' },
          })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = deliusServiceUserFactory.build()
          const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

          expect(presenter.additionalAttendanceInformationValue).toEqual('Alex missed the bus')
        })
      })

      describe('when the appointment has no value for additionalAttendanceInformation', () => {
        it('uses sets the value to an empty string', () => {
          const appointment = actionPlanAppointmentFactory.build({
            attendance: { attended: 'late' },
          })
          const serviceCategory = serviceCategoryFactory.build()
          const serviceUser = deliusServiceUserFactory.build()
          const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory)

          expect(presenter.additionalAttendanceInformationValue).toEqual('')
        })
      })
    })

    describe('when there is user input data', () => {
      it('uses the user input data as the value attribute', () => {
        const appointment = actionPlanAppointmentFactory.build({
          attendance: { attended: 'late', additionalAttendanceInformation: 'Alex missed the bus' },
        })
        const serviceCategory = serviceCategoryFactory.build()
        const serviceUser = deliusServiceUserFactory.build()
        const presenter = new PostSessionFeedbackPresenter(appointment, serviceUser, serviceCategory, null, {
          'additional-attendance-information': "Alex's car broke down en route",
        })

        expect(presenter.additionalAttendanceInformationValue).toEqual("Alex's car broke down en route")
      })
    })
  })
})
