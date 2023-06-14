import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../../../../models/appointment'
import { FormValidationError } from '../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../utils/presenterUtils'

export default class BehaviourFeedbackInputsPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment | InitialAssessmentAppointment,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['behaviour-description', 'notify-probation-practitioner'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    sessionSummary: {
      value: new PresenterUtils(this.userInputData).stringValue(
          this.appointment.sessionFeedback?.behaviour?.sessionSummary || null,
          'session-summary'
      ),
      errorMessage: this.errorMessageForField('session-summary'),
    },
    sessionResponse: {
      value: new PresenterUtils(this.userInputData).stringValue(
          this.appointment.sessionFeedback?.behaviour?.sessionResponse || null,
          'session-response'
      ),
      errorMessage: this.errorMessageForField('session-response'),
    },
    sessionConcerns: {
      value: new PresenterUtils(this.userInputData).stringValue(
          this.appointment.sessionFeedback?.behaviour?.sessionConcerns || null,
          'session-Concerns'
      ),
      errorMessage: this.errorMessageForField('session-Concerns'),
    },
    notifyProbationPractitioner: {
      value: this.utils.booleanValue(
        this.appointment.sessionFeedback?.behaviour?.notifyProbationPractitioner ?? null,
        'notify-probation-practitioner'
      ),
      errorMessage: this.errorMessageForField('notify-probation-practitioner'),
    },
  }
}
