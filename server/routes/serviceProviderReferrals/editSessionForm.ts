import { Request } from 'express'
import { ActionPlanAppointmentUpdate } from '../../services/interventionsService'
import TwelveHourBritishDateTimeInput from '../../utils/forms/inputs/twelveHourBritishDateTimeInput'
import { FormData } from '../../utils/forms/formData'
import DurationInput from '../../utils/forms/inputs/durationInput'
import errorMessages from '../../utils/errorMessages'
import MeetingMethodInput from '../../utils/forms/inputs/meetingMethodInput'
import AddressInput from '../../utils/forms/inputs/addressInput'
import { FormValidationResult } from '../../utils/forms/formValidationResult'
import { Address } from '../../models/actionPlan'

export default class EditSessionForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<ActionPlanAppointmentUpdate>> {
    const [dateResult, durationResult, appointmentDeliveryType] = await Promise.all([
      new TwelveHourBritishDateTimeInput(this.request, 'date', 'time', errorMessages.editSession.time).validate(),
      new DurationInput(this.request, 'duration', errorMessages.editSession.duration).validate(),
      new MeetingMethodInput(this.request, 'meeting-method', errorMessages.editSession.meetingMethod).validate(),
    ])
    let appointmentDeliveryAddress: FormValidationResult<Address | null> = { value: null, error: null }
    if (appointmentDeliveryType.value === 'IN_PERSON_MEETING_OTHER') {
      appointmentDeliveryAddress = await new AddressInput(
        this.request,
        'method-other-location',
        errorMessages.editSession.address
      ).validate()
    }

    if (dateResult.error || durationResult.error || appointmentDeliveryType.error || appointmentDeliveryAddress.error) {
      return {
        paramsForUpdate: null,
        error: {
          errors: [
            ...(dateResult.error?.errors ?? []),
            ...(durationResult.error?.errors ?? []),
            ...(appointmentDeliveryType.error?.errors ?? []),
            ...(appointmentDeliveryAddress.error?.errors ?? []),
          ],
        },
      }
    }

    return {
      error: null,
      paramsForUpdate: {
        appointmentTime: dateResult.value.toISOString(),
        durationInMinutes: durationResult.value.minutes!,
        appointmentDeliveryType: appointmentDeliveryType.value!,
        appointmentDeliveryAddress: appointmentDeliveryAddress.value,
      },
    }
  }
}
