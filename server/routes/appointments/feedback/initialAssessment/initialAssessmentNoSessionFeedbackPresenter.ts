import { InitialAssessmentAppointment } from '../../../../models/appointment'
import DeliusServiceUser from '../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../utils/formValidationError'
import SessionFeedbackInputsPresenter from '../shared/sessionFeedback/sessionFeedbackInputsPresenter'
import SessionFeedbackQuestionnaire from '../shared/sessionFeedback/sessionFeedbackQuestionnaire'

export default class InitialAssessmentNoSessionFeedbackPresenter {
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
    pageSubTitle: 'Add session feedback',
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

  readonly fieldText = {
    popAcceptable: {
      text: `The person could not take part, for example because of illness or a crisis`,
      value: 'POP_ACCEPTABLE',
    },
    popUnacceptable: {
      text: `The person did not comply, for example they were disruptive or disengaged`,
      value: 'POP_UNACCEPTABLE',
    },
    logistics: {
      text: `Something to do with the service provider or logistics, for example a room booking or fire alarm`,
      value: 'LOGISTICS',
    },
    other: {
      text: `Other`,
      value: 'OTHER',
    },
  }

  readonly attended = this.appointment.appointmentFeedback.attendanceFeedback.attended

  readonly inputsPresenter = new SessionFeedbackInputsPresenter(this.appointment, this.error, this.userInputData)
}
