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
        'Appointment details',
        'Record appointment attendance',
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
    it('contains the attendance questions and values', () => {
      const appointment = initialAssessmentAppointmentFactory.build()
      const presenter = new ExtendedAttendanceFeedbackPresenter(appointment)

      expect(presenter.attendanceResponses).toEqual({
        yes: {
          value: 'yes',
          text: 'Yes, they were on time',
        },
        late: {
          value: 'late',
          text: 'They were late',
        },
        no: {
          value: 'no',
          text: 'No',
        },
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
