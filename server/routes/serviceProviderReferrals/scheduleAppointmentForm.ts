import { Request } from 'express'
import { AppointmentUpdate } from '../../services/interventionsService'
import TwelveHourBritishDateTimeInput from '../../utils/forms/inputs/twelveHourBritishDateTimeInput'
import { FormData } from '../../utils/forms/formData'
import DurationInput from '../../utils/forms/inputs/durationInput'
import errorMessages from '../../utils/errorMessages'

export default class ScheduleAppointmentForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<AppointmentUpdate>> {
    const [dateResult, durationResult] = await Promise.all([
      new TwelveHourBritishDateTimeInput(
        this.request,
        'date',
        'time',
        errorMessages.scheduleAppointment.time
      ).validate(),
      new DurationInput(this.request, 'duration', errorMessages.scheduleAppointment.duration).validate(),
    ])

    if (dateResult.error || durationResult.error) {
      return {
        paramsForUpdate: null,
        error: { errors: [...(dateResult.error?.errors ?? []), ...(durationResult.error?.errors ?? [])] },
      }
    }

    return {
      error: null,
      paramsForUpdate: {
        appointmentTime: dateResult.value.toISOString(),
        durationInMinutes: durationResult.value.minutes!,
      },
    }
  }
}
