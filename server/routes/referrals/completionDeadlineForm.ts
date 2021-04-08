import { Request } from 'express'
import { DraftReferral } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import CalendarDayInput from '../../utils/forms/inputs/calendarDayInput'
import { FormData } from '../../utils/forms/formData'

export default class CompletionDeadlineForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormData<Partial<DraftReferral>>> {
    const input = new CalendarDayInput(this.request, 'completion-deadline', errorMessages.completionDeadline)
    const result = await input.validate()

    if (result.value) {
      return { error: null, paramsForUpdate: { completionDeadline: result.value.iso8601 } }
    }

    return { error: result.error, paramsForUpdate: null }
  }
}
