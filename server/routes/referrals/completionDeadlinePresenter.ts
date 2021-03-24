import { DraftReferral, ServiceCategory } from '../../services/interventionsService'
import CalendarDay from '../../utils/calendarDay'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class CompletionDeadlinePresenter {
  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What date does the ${this.serviceCategory.name} service need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  fields = (() => {
    const errorMessage =
      PresenterUtils.errorMessage(this.error, 'completion-deadline-day') ??
      PresenterUtils.errorMessage(this.error, 'completion-deadline-month') ??
      PresenterUtils.errorMessage(this.error, 'completion-deadline-year')

    let dayValue = ''
    let monthValue = ''
    let yearValue = ''

    if (this.userInputData === null) {
      const calendarDay = this.referral.completionDeadline
        ? CalendarDay.parseIso8601(this.referral.completionDeadline)
        : null

      if (calendarDay !== null) {
        dayValue = String(calendarDay?.day ?? '')
        monthValue = String(calendarDay?.month ?? '')
        yearValue = String(calendarDay?.year ?? '')
      }
    } else {
      dayValue = String(this.userInputData['completion-deadline-day'] || '')
      monthValue = String(this.userInputData['completion-deadline-month'] || '')
      yearValue = String(this.userInputData['completion-deadline-year'] || '')
    }

    return {
      completionDeadline: {
        errorMessage,
        day: {
          value: dayValue,
          hasError: PresenterUtils.hasError(this.error, 'completion-deadline-day'),
        },
        month: {
          value: monthValue,
          hasError: PresenterUtils.hasError(this.error, 'completion-deadline-month'),
        },
        year: {
          value: yearValue,
          hasError: PresenterUtils.hasError(this.error, 'completion-deadline-year'),
        },
      },
    }
  })()
}
