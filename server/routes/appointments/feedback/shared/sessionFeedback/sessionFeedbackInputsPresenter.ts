import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import { FormValidationError } from '../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../utils/presenterUtils'

export default class SessionFeedbackInputsPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['session-summary', 'session-response', 'session-concerns', 'notify-probation-practitioner'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    sessionSummary: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.sessionSummary || null,
        'session-summary'
      ),
      errorMessage: this.errorMessageForField('session-summary'),
    },
    sessionResponse: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.sessionResponse || null,
        'session-response'
      ),
      errorMessage: this.errorMessageForField('session-response'),
    },
    futureSessionPlans: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.futureSessionPlans || null,
        'future-session-plans'
      ),
      errorMessage: this.errorMessageForField('future-session-plans'),
    },
    sessionConcerns: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.sessionConcerns || null,
        'session-concerns'
      ),
      errorMessage: this.errorMessageForField('session-concerns'),
    },
    notifyProbationPractitioner: {
      value: this.utils.booleanValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.notifyProbationPractitioner ?? null,
        'notify-probation-practitioner'
      ),
      errorMessage: this.errorMessageForField('notify-probation-practitioner'),
    },
    late: {
      value: this.utils.booleanValue(this.appointment.appointmentFeedback?.sessionFeedback?.late ?? null, 'late'),
      errorMessage: this.errorMessageForField('late'),
    },
    lateReason: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.lateReason || null,
        'late-reason'
      ),
      errorMessage: this.errorMessageForField('late-reason'),
    },
    noSessionReasonType: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonType || null,
        'no-session-reason-type'
      ),
      errorMessage: this.errorMessageForField('no-session-reason-type'),
    },
    noSessionReasonPopAcceptable: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonPopAcceptable || null,
        'no-session-reason-pop'
      ),
      errorMessage: this.errorMessageForField('no-session-reason-pop-acceptable'),
    },
    noSessionReasonPopUnAcceptable: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonPopUnacceptable || null,
        'no-session-reason-pop'
      ),
      errorMessage: this.errorMessageForField('no-session-reason-pop-unacceptable'),
    },
    noSessionReasonLogistics: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonLogistics || null,
        'no-session-reason-logistics'
      ),
      errorMessage: this.errorMessageForField('no-session-reason-logistics'),
    },
    // noSessionReasonOther: {
    //   value: new PresenterUtils(this.userInputData).stringValue(
    //     this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonOther || null,
    //     'no-session-reason-other'
    //   ),
    //   errorMessage: this.errorMessageForField('no-session-reason-other'),
    // },
    noAttendanceInformation: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.appointmentFeedback?.sessionFeedback?.noAttendanceInformation || null,
        'no-attendance-information'
      ),
      errorMessage: this.errorMessageForField('no-attendance-information'),
    },
    rescheduleSession: {
      // value: new PresenterUtils(this.userInputData).stringValue(
      //     this.appointment.appointmentFeedback?.sessionFeedback?.noSessionReasonOther || null,
      // 'reschedule-session'
      // ),
      errorMessage: this.errorMessageForField('reschedule-session'),
    },
  }
}
