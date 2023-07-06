import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import SessionFeedbackInputsPresenter from '../../shared/sessionFeedback/sessionFeedbackInputsPresenter'
import SessionFeedbackQuestionnaire from '../../shared/sessionFeedback/sessionFeedbackQuestionnaire'

export default class ActionPlanSessionFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly draftId: string | undefined = undefined
  ) {}

  readonly text = {
    title: `Add session feedback`,
    subTitle: `This helps the probation practitioner to support the person on probation.`,
  }

  readonly questionnaire = new SessionFeedbackQuestionnaire(this.appointment, this.serviceUser)

  get backLinkHref(): string | null {
    if (this.actionPlanId && this.appointment.sessionNumber) {
      if (this.draftId) {
        return `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/attendance`
      }
      return `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/attendance`
    }
    return null
  }

  readonly inputsPresenter = new SessionFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
