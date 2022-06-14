import { Request } from 'express'
import CalendarDay from '../../calendarDay'
import ClockTime from '../../clockTime'
import { FormValidationError } from '../../formValidationError'
import { FormValidationResult } from '../formValidationResult'
import CalendarDayInput, { CalendarDayErrorMessages } from './calendarDayInput'
import TwelveHourClockTimeInput, { TwelveHourClockTimeErrorMessages } from './twelveHourClockTimeInput'

export interface TwelveHourBritishDateTimeErrorMessages {
  calendarDay: CalendarDayErrorMessages
  clockTime: TwelveHourClockTimeErrorMessages
  invalidTime: string
  pastTime: string
}

export default class TwelveHourBritishDateTimeInput {
  constructor(
    private readonly request: Request,
    private readonly dayKey: string,
    private readonly timeKey: string,
    private readonly errorMessages: TwelveHourBritishDateTimeErrorMessages,
    private readonly earliestAllowedTime: Date | null = null,
    private readonly referralDate: string | null = null
  ) {}

  async validate(): Promise<FormValidationResult<Date>> {
    const [dayResult, timeResult] = await Promise.all([
      new CalendarDayInput(this.request, this.dayKey, this.errorMessages.calendarDay, this.referralDate).validate(),
      new TwelveHourClockTimeInput(this.request, this.timeKey, this.errorMessages.clockTime).validate(),
    ])

    const error = this.error(dayResult, timeResult)
    if (error) {
      return { value: null, error }
    }

    return {
      value: this.date(dayResult, timeResult)!,
      error: null,
    }
  }

  private error(
    dayResult: FormValidationResult<CalendarDay>,
    timeResult: FormValidationResult<ClockTime>
  ): FormValidationError | null {
    if (dayResult.error || timeResult.error) {
      return { errors: [...(dayResult.error?.errors ?? []), ...(timeResult.error?.errors ?? [])] }
    }

    const result = this.date(dayResult, timeResult)
    if (result === null) {
      return {
        errors: [
          {
            errorSummaryLinkedField: `${this.timeKey}-hour`,
            formFields: [`${this.timeKey}-hour`, `${this.timeKey}-minute`, `${this.timeKey}-part-of-day`],
            message: this.errorMessages.invalidTime,
          },
        ],
      }
    }

    if (this.earliestAllowedTime !== null && result < this.earliestAllowedTime) {
      const isSameDate =
        this.earliestAllowedTime.getDate() === result.getDate() &&
        this.earliestAllowedTime.getMonth() === result.getMonth() &&
        this.earliestAllowedTime.getFullYear() === result.getFullYear()

      return isSameDate
        ? {
            // the error is in the time field
            errors: [
              {
                errorSummaryLinkedField: `${this.timeKey}-hour`,
                formFields: [`${this.timeKey}-hour`, `${this.timeKey}-minute`, `${this.timeKey}-part-of-day`],
                message: this.errorMessages.pastTime,
              },
            ],
          }
        : {
            // the error is in the date field
            errors: [
              {
                errorSummaryLinkedField: `${this.dayKey}-day`,
                formFields: [`${this.dayKey}-day`, `${this.dayKey}-month`, `${this.dayKey}-year`],
                message: this.errorMessages.pastTime,
              },
            ],
          }
    }

    return null
  }

  private date(dayResult: FormValidationResult<CalendarDay>, timeResult: FormValidationResult<ClockTime>): Date | null {
    if (dayResult.value === null || timeResult.value === null) {
      return null
    }

    const date = dayResult.value.atTimeInBritain(timeResult.value)
    return date
  }
}
