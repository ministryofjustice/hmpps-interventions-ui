import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class CompletionDeadlinePresenter {
  readonly day: string

  readonly month: string

  readonly year: string

  readonly errorMessage: string | null

  readonly hasMonthError: boolean

  readonly hasDayError: boolean

  readonly hasYearError: boolean

  readonly errorSummary: { field: string; message: string }[] | null

  readonly title = `What date does the ${this.serviceCategory.name} service need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    error: FormValidationError | null = null,
    userInputData: Record<string, unknown> | null = null
  ) {
    if (!userInputData) {
      const calendarDay = this.referral.completionDeadline
        ? CalendarDay.parseIso8601(this.referral.completionDeadline)
        : null

      if (!calendarDay) {
        this.day = ''
        this.month = ''
        this.year = ''
      } else {
        this.day = String(calendarDay.day)
        this.month = String(calendarDay.month)
        this.year = String(calendarDay.year)
      }
    } else {
      this.day = String(userInputData['completion-deadline-day'] || '')
      this.month = String(userInputData['completion-deadline-month'] || '')
      this.year = String(userInputData['completion-deadline-year'] || '')
    }

    this.errorSummary = PresenterUtils.errorSummary(error)
    this.errorMessage =
      PresenterUtils.errorMessage(error, 'completion-deadline-day') ??
      PresenterUtils.errorMessage(error, 'completion-deadline-month') ??
      PresenterUtils.errorMessage(error, 'completion-deadline-year')

    this.hasDayError = PresenterUtils.hasError(error, 'completion-deadline-day')
    this.hasMonthError = PresenterUtils.hasError(error, 'completion-deadline-month')
    this.hasYearError = PresenterUtils.hasError(error, 'completion-deadline-year')
  }
}
