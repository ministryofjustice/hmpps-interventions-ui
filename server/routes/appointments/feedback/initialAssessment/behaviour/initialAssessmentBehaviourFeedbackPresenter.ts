import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import BehaviourFeedbackInputsPresenter from '../../shared/behaviour/behaviourFeedbackInputsPresenter'

export default class InitialAssessmentBehaviourFeedbackPresenter {
  constructor(
    private readonly appointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string | null = null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `Add behaviour feedback`,
    behaviourDescription: {
      question: `Describe ${this.serviceUser.firstName}'s behaviour in the assessment appointment`,
      hint: 'For example, consider how well-engaged they were and what their body language was like.',
    },
    notifyProbationPractitioner: {
      question: 'If you described poor behaviour, do you want to notify the probation practitioner?',
      explanation: 'If you select yes, the probation practitioner will be notified by email.',
      hint: 'Select one option',
    },
  }

  readonly backLinkHref = this.referralId
    ? `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
    : null

  readonly inputsPresenter = new BehaviourFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
