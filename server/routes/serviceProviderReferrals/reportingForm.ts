import { Request } from 'express'
import { CreateReportDateParams } from '../../services/interventionsService'
import errorMessages from '../../utils/errorMessages'
import { FormValidationResult } from '../../utils/forms/formValidationResult'
import CalendarDayInput from '../../utils/forms/inputs/calendarDayInput'

export default class ReportingForm {
  constructor(private readonly request: Request) {}

  async data(): Promise<FormValidationResult<CreateReportDateParams>> {
    const [fromDateResult, toDateResult] = await Promise.all([
      new CalendarDayInput(this.request, 'from-date', errorMessages.reportingDate.from).validate(),
      new CalendarDayInput(this.request, 'to-date', errorMessages.reportingDate.to).validate(),
    ])
    const errors: { formFields: string[]; errorSummaryLinkedField: string; message: string }[][] = []

    if (fromDateResult.error) {
      errors.push(fromDateResult.error.errors)
    }

    if (toDateResult.error) {
      errors.push(toDateResult.error.errors)
    }

    const dayOneDate = new Date('2021-06-01')
    if (fromDateResult.value && new Date(fromDateResult.value.iso8601) < dayOneDate) {
      errors.push(CalendarDayInput.createError('from-date', errorMessages.reportingDate.from.mustBeAfterDayOne).errors)
    }

    if (
      fromDateResult.value &&
      toDateResult.value &&
      new Date(fromDateResult.value.iso8601) > new Date(toDateResult.value.iso8601)
    ) {
      errors.push(CalendarDayInput.createError('from-date', errorMessages.reportingDate.from.mustBeBeforeToDate).errors)
      errors.push(CalendarDayInput.createError('to-date', errorMessages.reportingDate.from.mustBeBeforeToDate).errors)
    }

    const todayDate = new Date()

    if (fromDateResult.value && new Date(fromDateResult.value.iso8601) > todayDate) {
      errors.push(CalendarDayInput.createError('from-date', errorMessages.reportingDate.to.mustNotBeInFuture).errors)
    }

    if (toDateResult.value && new Date(toDateResult.value.iso8601) > todayDate) {
      errors.push(CalendarDayInput.createError('to-date', errorMessages.reportingDate.from.mustNotBeInFuture).errors)
    }

    if (errors.length > 0 || fromDateResult.error || toDateResult.error) {
      return {
        error: {
          errors: errors.flat(),
        },
        value: null,
      }
    }

    return {
      error: null,
      value: {
        fromIncludingDate: fromDateResult.value,
        toIncludingDate: toDateResult.value,
      },
    }
  }
}
