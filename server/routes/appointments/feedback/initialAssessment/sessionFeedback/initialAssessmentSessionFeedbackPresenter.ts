import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import SessionFeedbackInputsPresenter from '../../shared/sessionFeedback/sessionFeedbackInputsPresenter'
import SessionFeedbackQuestionnaire from '../../shared/sessionFeedback/sessionFeedbackQuestionnaire'

export default class InitialAssessmentSessionFeedbackPresenter {
  constructor(
    private readonly appointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    private readonly referralId: string | null = null,
    private readonly draftId: string | undefined = undefined,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly questionnaire = new SessionFeedbackQuestionnaire(this.appointment, this.serviceUser)

  readonly text = {
    title: `Add session feedback`,
    subTitle: `This helps the probation practitioner to support the person on probation.`,
  }

  get backLinkHref(): string | null {
    if (this.referralId) {
      if (this.draftId) {
        return `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/edit/${this.draftId}/attendance`
      }
      return `/service-provider/referrals/${this.referralId}/supplier-assessment/post-assessment-feedback/attendance`
    }
    return null
  }

  readonly inputsPresenter = new SessionFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
