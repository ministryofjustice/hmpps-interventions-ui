import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import BehaviourFeedbackInputsPresenter from '../../shared/behaviour/behaviourFeedbackInputsPresenter'
import BehaviourFeedbackQuestionnaire from '../../shared/behaviour/behaviourFeedbackQuestionnaire'

export default class InitialAssessmentBehaviourFeedbackPresenter {
  constructor(
    private readonly appointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly questionnaire = new BehaviourFeedbackQuestionnaire(this.appointment, this.serviceUser)

  readonly text = {
    title: `Add behaviour feedback`,
  }

  readonly backLinkHref = this.referralId
    ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
    : null

  readonly inputsPresenter = new BehaviourFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
