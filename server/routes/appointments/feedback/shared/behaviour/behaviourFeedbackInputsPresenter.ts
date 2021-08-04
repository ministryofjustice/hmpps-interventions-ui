import { FormValidationError } from '../../../../../utils/formValidationError'
import PresenterUtils from '../../../../../utils/presenterUtils'
import { AppointmentDetails } from '../../appointmentDetails'

export default class BehaviourFeedbackInputsPresenter {
  constructor(
    private readonly appointment: AppointmentDetails,
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
    behaviourDescription: {
      value: new PresenterUtils(this.userInputData).stringValue(
        this.appointment.sessionFeedback?.behaviour?.behaviourDescription || null,
        'behaviour-description'
      ),
      errorMessage: this.errorMessageForField('behaviour-description'),
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
