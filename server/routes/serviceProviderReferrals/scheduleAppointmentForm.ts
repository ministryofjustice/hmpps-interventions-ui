import { Request } from 'express'
import { body, ValidationChain } from 'express-validator'
import TwelveHourBritishDateTimeInput from '../../utils/forms/inputs/twelveHourBritishDateTimeInput'
import { FormData } from '../../utils/forms/formData'
import DurationInput from '../../utils/forms/inputs/durationInput'
import errorMessages from '../../utils/errorMessages'
import MeetingMethodInput from '../../utils/forms/inputs/meetingMethodInput'
import AddressInput from '../../utils/forms/inputs/addressInput'
import { FormValidationResult } from '../../utils/forms/formValidationResult'
import Address from '../../models/address'
import { AppointmentSchedulingDetails } from '../../models/appointment'
import DeliusOfficeLocationInput from '../../utils/forms/inputs/deliusOfficeLocationInput'
import DeliusOfficeLocation from '../../models/deliusOfficeLocation'
import FormUtils from '../../utils/formUtils'

export default class ScheduleAppointmentForm {
  constructor(
    private readonly request: Request,
    private readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly allowPastAppointments = false,
    private readonly referralDate: string | null = null,
    private readonly hasExistingScheduledAppointment: boolean = false
  ) {}

  async data(): Promise<FormData<AppointmentSchedulingDetails>> {
    const [dateResult, durationResult, sessionTypeResult, appointmentDeliveryType, rescheduledReasonResult] =
      await Promise.all([
        new TwelveHourBritishDateTimeInput(
          this.request,
          'date',
          'time',
          errorMessages.scheduleAppointment.time,
          null,
          this.referralDate
        ).validate(),
        new DurationInput(this.request, 'duration', errorMessages.scheduleAppointment.duration).validate(),
        FormUtils.runValidations({ request: this.request, validations: this.validateSessionType() }),
        new MeetingMethodInput(
          this.request,
          'meeting-method',
          errorMessages.scheduleAppointment.meetingMethod
        ).validate(),
        FormUtils.runValidations({ request: this.request, validations: this.validateRescheduledReason() }),
      ])

    const sessionTypeError = FormUtils.validationErrorFromResult(sessionTypeResult)
    const rescheduledReasonError = FormUtils.validationErrorFromResult(rescheduledReasonResult)

    let appointmentDeliveryAddress: FormValidationResult<Address | null> = { value: null, error: null }

    if (appointmentDeliveryType.value === 'IN_PERSON_MEETING_OTHER') {
      appointmentDeliveryAddress = await new AddressInput(
        this.request,
        'method-other-location',
        errorMessages.scheduleAppointment.address
      ).validate()
    }
    let deliusOfficeLocation: FormValidationResult<string | null> = { value: null, error: null }
    if (appointmentDeliveryType.value === 'IN_PERSON_MEETING_PROBATION_OFFICE') {
      deliusOfficeLocation = await new DeliusOfficeLocationInput(
        this.request,
        'delius-office-location-code',
        this.deliusOfficeLocations,
        errorMessages.scheduleAppointment.deliusOfficeLocation
      ).validate()
    }

    if (
      dateResult.error ||
      durationResult.error ||
      appointmentDeliveryType.error ||
      appointmentDeliveryAddress.error ||
      sessionTypeError ||
      deliusOfficeLocation.error ||
      rescheduledReasonError
    ) {
      return {
        paramsForUpdate: null,
        error: {
          errors: [
            ...(dateResult.error?.errors ?? []),
            ...(durationResult.error?.errors ?? []),
            ...(sessionTypeError?.errors ?? []),
            ...(appointmentDeliveryType.error?.errors ?? []),
            ...(appointmentDeliveryAddress.error?.errors ?? []),
            ...(deliusOfficeLocation.error?.errors ?? []),
            ...(rescheduledReasonError?.errors ?? []),
          ],
        },
      }
    }

    return {
      error: null,
      paramsForUpdate: {
        appointmentTime: dateResult.value.toISOString(),
        durationInMinutes: durationResult.value.minutes!,
        sessionType: this.request.body['session-type'],
        appointmentDeliveryType: appointmentDeliveryType.value!,
        appointmentDeliveryAddress: appointmentDeliveryAddress.value,
        npsOfficeCode: deliusOfficeLocation.value,
        rescheduleRequestedBy: this.request.body['reschedule-requested-by'],
        rescheduledReason: this.request.body['rescheduled-reason'],
      },
    }
  }

  private validateSessionType(): ValidationChain[] {
    return [
      body('session-type')
        .isIn(['ONE_TO_ONE', 'GROUP'])
        .withMessage(errorMessages.scheduleAppointment.sessionType.empty),
    ]
  }

  private validateRescheduledReason(): ValidationChain[] {
    return this.hasExistingScheduledAppointment
      ? [
          body('reschedule-requested-by')
            .notEmpty()
            .withMessage(errorMessages.scheduleAppointment.rescheduleRequestedBy.emptyRadio),
          body('rescheduled-reason').notEmpty().withMessage(errorMessages.scheduleAppointment.rescheduledReason.empty),
        ]
      : []
  }
}
