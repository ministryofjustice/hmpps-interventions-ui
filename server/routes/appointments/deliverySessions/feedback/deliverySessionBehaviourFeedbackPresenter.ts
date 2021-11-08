import { ActionPlanAppointment } from '../../../../models/appointment'
import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../utils/formValidationError'
import BehaviourFeedbackInputsPresenter from '../../feedback/shared/behaviour/behaviourFeedbackInputsPresenter'
import BehaviourFeedbackQuestionnaire from '../../feedback/shared/behaviour/behaviourFeedbackQuestionnaire'

export default class DeliverySessionBehaviourFeedbackPresenter {
  constructor(
    private readonly appointment: ActionPlanAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `Add behaviour feedback`,
  }

  readonly questionnaire = new BehaviourFeedbackQuestionnaire(this.appointment, this.serviceUser)

  readonly backLinkHref = `/service-provider/referral/${this.referralId}/session/${this.appointment.sessionNumber}/appointment/${this.appointment.id}/feedback/attendance`

  readonly inputsPresenter = new BehaviourFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
