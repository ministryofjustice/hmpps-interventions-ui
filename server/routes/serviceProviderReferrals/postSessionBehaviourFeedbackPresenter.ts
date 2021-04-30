import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import { ActionPlanAppointment } from '../../models/actionPlan'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class PostSessionBehaviourFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['behaviour-description', 'notify-probation-practitioner'],
  })

  readonly text = {
    title: `Add behaviour feedback`,
    behaviourDescription: {
      question: `Describe ${this.serviceUser.firstName}'s behaviour in this session`,
      hint: 'For example, consider how well-engaged they were and what their body language was like.',
    },
    notifyProbationPractitioner: {
      question: 'If you described poor behaviour, do you want to notify the probation practitioner?',
      explanation: 'If you select yes, the probation practitioner will be notified by email.',
      hint: 'Select one option',
    },
  }

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
