import PresenterUtils from '../../utils/presenterUtils'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../../models/appointment'
import { FormValidationError } from '../../utils/formValidationError'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import SentReferral from '../../models/sentReferral'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'
import AppointmentSummary from '../appointments/appointmentSummary'
import { SummaryListItem } from '../../utils/summaryList'
import AuthUserDetails from '../../models/hmppsAuth/authUserDetails'

export default class ScheduleAppointmentPresenter {
  constructor(
    private readonly referral: SentReferral,
    private readonly currentAppointment: InitialAssessmentAppointment | ActionPlanAppointment | null,
    private readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly assignedCaseworker: AuthUserDetails | null = null,
    private readonly validationError: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly serverError: FormValidationError | null = null,
    private readonly overrideBackLinkHref?: string,
    private readonly appointmentDecorator = currentAppointment ? new AppointmentDecorator(currentAppointment) : null
  ) {}

  readonly text = {
    title:
      this.currentAppointment && !this.appointmentAlreadyAttended
        ? 'Change appointment details'
        : 'Add appointment details',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  get appointmentSummary(): SummaryListItem[] {
    if (this.appointmentAlreadyAttended) {
      return new AppointmentSummary(this.currentAppointment!, this.assignedCaseworker).appointmentSummaryList
    }
    return []
  }

  readonly errorSummary = this.serverError
    ? PresenterUtils.errorSummary(this.serverError)
    : PresenterUtils.errorSummary(this.validationError)

  readonly serverErrorMessage = PresenterUtils.errorMessage(this.serverError, 'session-input')

  get appointmentAlreadyAttended(): boolean {
    if (this.appointmentDecorator !== null) {
      // Remove this check once action plan appointments allow rescheduling
      if (this.appointmentDecorator.isInitialAssessmentAppointment) {
        return this.currentAppointment!.sessionFeedback.submitted
      }
    }
    return false
  }

  get deliusOfficeLocationsDetails(): { value: string; text: string; selected: boolean }[] {
    return this.deliusOfficeLocations.map(officeLocation => {
      return {
        value: officeLocation.deliusCRSLocationId,
        text: officeLocation.name,
        selected: this.fields.deliusOfficeLocation.value === officeLocation.deliusCRSLocationId,
      }
    })
  }

  readonly fields = this.appointmentAlreadyAttended
    ? {
        date: this.utils.dateValue(null, 'date', this.validationError),
        time: this.utils.twelveHourTimeValue(null, 'time', this.validationError),
        duration: this.utils.durationValue(null, 'duration', this.validationError),
        meetingMethod: this.utils.meetingMethodValue(null, 'meeting-method', this.validationError),
        address: this.utils.addressValue(null, 'method-other-location', this.validationError),
        deliusOfficeLocation: this.utils.selectionValue(null, 'delius-office-location-code', this.validationError),
      }
    : {
        date: this.utils.dateValue(this.appointmentDecorator?.britishDay ?? null, 'date', this.validationError),
        time: this.utils.twelveHourTimeValue(
          this.appointmentDecorator?.britishTime ?? null,
          'time',
          this.validationError
        ),
        duration: this.utils.durationValue(
          this.appointmentDecorator?.duration ?? null,
          'duration',
          this.validationError
        ),
        meetingMethod: this.utils.meetingMethodValue(
          this.currentAppointment?.appointmentDeliveryType ?? null,
          'meeting-method',
          this.validationError
        ),
        address: this.utils.addressValue(
          this.currentAppointment?.appointmentDeliveryAddress ?? null,
          'method-other-location',
          this.validationError
        ),
        deliusOfficeLocation: this.utils.selectionValue(
          this.currentAppointment?.npsOfficeCode ?? null,
          'delius-office-location-code',
          this.validationError
        ),
      }

  readonly backLinkHref = this.overrideBackLinkHref ?? `/service-provider/referrals/${this.referral.id}/progress`
}
