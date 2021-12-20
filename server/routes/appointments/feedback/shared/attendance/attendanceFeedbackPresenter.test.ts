import AttendanceFeedbackPresenter from './attendanceFeedbackPresenter'
import initialAssessmentAppointmentFactory from '../../../../../../testutils/factories/initialAssessmentAppointment'
import { FormValidationError } from '../../../../../utils/formValidationError'
import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import AttendanceFeedbackQuestionnaire from './attendanceFeedbackQuestionnaire'
import deliusServiceUser from '../../../../../../testutils/factories/deliusServiceUser'
import AppointmentSummary from '../../../appointmentSummary'

describe(AttendanceFeedbackPresenter, () => {
  class ExtendedAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
    constructor(
      appointment: InitialAssessmentAppointment,
      error: FormValidationError | null = null,
      userInputData: Record<string, unknown> | null = null
    ) {
      super(
        appointment,
        'title',
        'subTitle',
        new AttendanceFeedbackQuestionnaire(appointment, deliusServiceUser.build()),
        new AppointmentSummary(appointment),
        error,
        userInputData
      )
    }
  }

  describe('errorSummary', () => {
    const appointment = initialAssessmentAppointmentFactory.build()

    describe('when there is an error', () => {
      it('returns a summary of the error', () => {
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment, {
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
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('errorMessage', () => {
    const appointment = initialAssessmentAppointmentFactory.build()

    describe('when there is an error', () => {
      it('returns the error message', () => {
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment, {
          errors: [
            {
              errorSummaryLinkedField: 'attended',
              formFields: ['attended'],
              message: 'Select whether the service user attended or not',
            },
          ],
        })

        expect(presenter.fields.attended.errorMessage).toEqual('Select whether the service user attended or not')
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

        expect(presenter.fields.attended.errorMessage).toBeNull()
      })
    })
  })

  describe('attendanceResponses', () => {
    describe('when attendance has not been set on the appointment', () => {
      it('contains the attendance questions and values, and doesn’t set any value to "checked"', () => {
        const appointment = initialAssessmentAppointmentFactory.build()
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

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
        const appointment = initialAssessmentAppointmentFactory.build({
          sessionFeedback: {
            attendance: { attended: responseValue },
          },
        })

        describe(`service provider has selected ${responseValue}`, () => {
          it(`contains the attendance questions and values, and marks ${responseValue} as "checked"`, () => {
            const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

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

  describe('fields.additionalAttendanceInformationValue', () => {
    describe('when there is no user input data', () => {
      describe('when the appointment already has additionalAttendanceInformation set', () => {
        it('uses that value as the value attribute', () => {
          const appointment = initialAssessmentAppointmentFactory.build({
            sessionFeedback: {
              attendance: { attended: 'late', additionalAttendanceInformation: 'Alex missed the bus' },
            },
          })
          const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

          expect(presenter.fields.additionalAttendanceInformation.value).toEqual('Alex missed the bus')
        })
      })

      describe('when the appointment has no value for additionalAttendanceInformation', () => {
        it('uses sets the value to an empty string', () => {
          const appointment = initialAssessmentAppointmentFactory.build({
            sessionFeedback: {
              attendance: { attended: 'late' },
            },
          })
          const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

          expect(presenter.fields.additionalAttendanceInformation.value).toEqual('')
        })
      })
    })

    describe('when there is user input data', () => {
      it('uses the user input data as the value attribute', () => {
        const appointment = initialAssessmentAppointmentFactory.build({
          sessionFeedback: {
            attendance: { attended: 'late', additionalAttendanceInformation: 'Alex missed the bus' },
          },
        })
        const presenter = new ExtendedAttendanceFeedbackPresenter(appointment, null, {
          attended: 'no',
          'additional-attendance-information': "Alex's car broke down en route",
        })

        expect(presenter.fields.attended.value).toEqual('no')
        expect(presenter.fields.additionalAttendanceInformation.value).toEqual("Alex's car broke down en route")
      })
    })
  })

  describe('backLinkHref', () => {
    it('is null', () => {
      const appointment = initialAssessmentAppointmentFactory.build()

      const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

      expect(presenter.backLinkHref).toEqual(null)
    })
  })
})