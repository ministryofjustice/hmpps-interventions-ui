import ActionPlan from '../../../../../models/actionPlan'
import { ActionPlanAppointment } from '../../../../../models/appointment'
import DateUtils from '../../../../../utils/dateUtils'

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
    if (this.nextAppointment !== null && this.nextAppointment.appointmentTime !== null) {
      const formattedDate = DateUtils.formattedDate(this.nextAppointment.appointmentTime)
      return `You can now deliver the next session scheduled for ${formattedDate}.`
    }

    if (this.isFinalSession) {
      return 'Please submit the end of service report within 5 working days.'
    }

    return 'The probation practitioner has been sent a copy of the session feedback form.'
  }

  private get isFinalSession() {
    return this.currentAppointment.sessionNumber === this.actionPlan.numberOfSessions
  }
}
