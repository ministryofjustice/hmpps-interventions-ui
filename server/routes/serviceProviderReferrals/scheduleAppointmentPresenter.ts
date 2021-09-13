import PresenterUtils from '../../utils/presenterUtils'
import {
  ActionPlanAppointment,
  AppointmentSchedulingDetails,
  InitialAssessmentAppointment,
} from '../../models/appointment'
import { FormValidationError } from '../../utils/formValidationError'
import AppointmentDecorator from '../../decorators/appointmentDecorator'
import SentReferral from '../../models/sentReferral'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'
import AppointmentSummary from '../appointments/appointmentSummary'
import { SummaryListItem } from '../../utils/summaryList'

export default class ScheduleAppointmentPresenter {
  constructor(
    private readonly formType: 'supplierAssessment' | 'actionPlan',
    private readonly referral: SentReferral,
    private readonly currentAppointment: InitialAssessmentAppointment | ActionPlanAppointment | null,
    private readonly currentAppointmentSummary: AppointmentSummary | null,
    private readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly validationError: FormValidationError | null = null,
    private readonly draftSchedulingDetails: AppointmentSchedulingDetails | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    private readonly serverError: FormValidationError | null = null,
    private readonly overrideBackLinkHref?: string
  ) {}

  private readonly appointmentDecorator = this.currentAppointment
    ? new AppointmentDecorator(this.currentAppointment)
    : null

  readonly text = {
    title:
      this.currentAppointment && !this.appointmentAlreadyAttended
        ? 'Change appointment details'
        : 'Add appointment details',
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  get appointmentSummary(): SummaryListItem[] {
    if (this.appointmentAlreadyAttended && this.currentAppointmentSummary) {
      return this.currentAppointmentSummary.appointmentSummaryList
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

  get allowSessionTypeSelection(): boolean {
    return this.formType !== 'supplierAssessment'
  }

  // Supplier assessment appointments are always one to one
  readonly sessionTypeWhenSelectionNotAllowed = 'ONE_TO_ONE'

  private get schedulingDetailsToEdit() {
    if (this.draftSchedulingDetails !== null) {
      return this.draftSchedulingDetails
    }

    return this.appointmentAlreadyAttended ? null : this.currentAppointment
  }

  readonly fields = (() => {
    const schedulingDetailsToEditDecorator = this.schedulingDetailsToEdit
      ? new AppointmentDecorator(this.schedulingDetailsToEdit)
      : null

    return {
      date: this.utils.dateValue(schedulingDetailsToEditDecorator?.britishDay ?? null, 'date', this.validationError),
      time: this.utils.twelveHourTimeValue(
        schedulingDetailsToEditDecorator?.britishTime ?? null,
        'time',
        this.validationError
      ),
      duration: this.utils.durationValue(
        schedulingDetailsToEditDecorator?.duration ?? null,
        'duration',
        this.validationError
      ),
      sessionType: {
        errorMessage: PresenterUtils.errorMessage(this.validationError, 'session-type'),
        value: this.utils.stringValue(this.schedulingDetailsToEdit?.sessionType ?? null, 'session-type'),
      },
      meetingMethod: this.utils.meetingMethodValue(
        this.schedulingDetailsToEdit?.appointmentDeliveryType ?? null,
        'meeting-method',
        this.validationError
      ),
      address: this.utils.addressValue(
        this.schedulingDetailsToEdit?.appointmentDeliveryAddress ?? null,
        'method-other-location',
        this.validationError
      ),
      deliusOfficeLocation: this.utils.selectionValue(
        this.schedulingDetailsToEdit?.npsOfficeCode ?? null,
        'delius-office-location-code',
        this.validationError
      ),
    }
  })()

  readonly backLinkHref = this.overrideBackLinkHref ?? `/service-provider/referrals/${this.referral.id}/progress`
}
