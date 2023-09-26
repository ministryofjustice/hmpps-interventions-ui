import { InitialAssessmentAppointment } from '../../../../../models/appointment'
import DeliusServiceUser from '../../../../../models/delius/deliusServiceUser'
import { FormValidationError } from '../../../../../utils/formValidationError'
import AttendanceFeedbackPresenter from '../../shared/attendance/attendanceFeedbackPresenter'
import AttendanceFeedbackQuestionnaire from '../../shared/attendance/attendanceFeedbackQuestionnaire'
import AppointmentSummary from '../../../appointmentSummary'

export default class InitialAssessmentAttendanceFeedbackPresenter extends AttendanceFeedbackPresenter {
  constructor(
    private readonly initialAssessmentAppointment: InitialAssessmentAppointment,
    private readonly serviceUser: DeliusServiceUser,
    readonly appointmentSummary: AppointmentSummary,
    private readonly referralId: string | null = null,
    private readonly draftId: string | null = null,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null
  ) {
    super(
      initialAssessmentAppointment,
      'Record appointment attendance',
      'The date and time of the appointment are a permanent record of where this person was.',
      'Appointment details',
      'Record appointment attendance',
      new AttendanceFeedbackQuestionnaire(initialAssessmentAppointment, serviceUser),
      appointmentSummary,
      error,
      userInputData
    )
  }

  get getBackLinkHref(): string | null {
    if (this.draftId && this.referralId) {
      return `/service-provider/referrals/${this.referralId}/supplier-assessment/schedule/${this.draftId}/check-answers`
    }
    if (this.referralId) {
      return `/service-provider/referrals/${this.referralId}/progress`
    }
    return null
  }

  readonly backLinkHref = this.getBackLinkHref
}
