import { ActionPlanAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import SessionFeedbackInputsPresenter from '../../shared/sessionFeedback/sessionFeedbackInputsPresenter'
import SessionFeedbackQuestionnaire from '../../shared/sessionFeedback/sessionFeedbackQuestionnaire'

export default class ActionPlanNoSessionFeedbackPresenter {
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
