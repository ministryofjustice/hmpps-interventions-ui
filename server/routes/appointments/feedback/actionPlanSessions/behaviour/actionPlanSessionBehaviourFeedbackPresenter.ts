import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import BehaviourFeedbackInputsPresenter from '../../shared/behaviour/behaviourFeedbackInputsPresenter'
import BehaviourFeedbackQuestionnaire from '../../shared/behaviour/behaviourFeedbackQuestionnaire'

export default class ActionPlanSessionBehaviourFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly actionPlanId: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly draftId: string | undefined = undefined
  ) {}

  readonly text = {
    title: `Add behaviour feedback`,
  }

  readonly questionnaire = new BehaviourFeedbackQuestionnaire(this.appointment, this.serviceUser)

  get backLinkHref(): string | null {
    if (this.actionPlanId && this.appointment.sessionNumber) {
      if (this.draftId) {
        return `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/edit/${this.draftId}/attendance`
      }
      return `/service-provider/action-plan/${this.actionPlanId}/appointment/${this.appointment.sessionNumber}/post-session-feedback/attendance`
    }
    return null
  }

  readonly inputsPresenter = new BehaviourFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
