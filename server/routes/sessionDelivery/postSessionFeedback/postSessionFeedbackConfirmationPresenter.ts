import { ActionPlan, ActionPlanAppointment } from '../../../services/interventionsService'
import DateUtils from '../../../utils/dateUtils'

export default class PostSessionFeedbackConfirmationPresenter {
  constructor(
    private readonly actionPlan: ActionPlan,
    private readonly currentAppointment: ActionPlanAppointment,
    private readonly nextAppointment: ActionPlanAppointment | null = null
  ) {}

  progressHref = `/service-provider/referrals/${this.actionPlan.referralId}/progress`

  text = {
    whatHappensNext: this.whatHappensNextText,
  }

  get whatHappensNextText(): string {
    if (this.hasNextSessionDate) {
      return `You can now deliver the next session scheduled for ${DateUtils.getDateStringFromDateTimeString(
        this.nextAppointment!.appointmentTime
      )}.`
    }

    if (this.isFinalSession) {
      return 'Please submit the end of service report within 5 working days.'
    }

    return 'The probation practitioner has been sent a copy of the session feedback form.'
  }

  private get hasNextSessionDate() {
    return (
      this.nextAppointment !== null && DateUtils.getDateStringFromDateTimeString(this.nextAppointment!.appointmentTime)
    )
  }

  private get isFinalSession() {
    return this.currentAppointment.sessionNumber === this.actionPlan.numberOfSessions
  }
}
