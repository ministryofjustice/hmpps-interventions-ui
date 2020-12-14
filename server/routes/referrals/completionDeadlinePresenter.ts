import { DraftReferral } from '../../services/interventionsService'
import { CompletionDeadlineErrors } from './completionDeadlineForm'
import CalendarDay from '../../utils/calendarDay'

export default class CompletionDeadlinePresenter {
  readonly day: string

  readonly month: string

  readonly year: string

  readonly errorMessage: string | null

  readonly erroredFields: ('day' | 'month' | 'year')[]

  readonly errorSummary: CompletionDeadlineErrorSummaryPresenter | null

  readonly title = `What date does the ${this.referral.serviceCategory.name} service need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly referral: DraftReferral,
    errors: CompletionDeadlineErrors | null = null,
    userInputData: Record<string, unknown> | null = null
  ) {
    if (!userInputData) {
      const calendarDay = referral.completionDeadline ? CalendarDay.parseIso8601(referral.completionDeadline) : null

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

    if (!errors) {
      this.errorSummary = null
      this.errorMessage = null
      this.erroredFields = []
    } else {
      this.errorSummary = {
        errors: [{ message: errors.message, linkedField: errors.firstErroredField }],
      }
      this.errorMessage = errors.message
      this.erroredFields = errors.erroredFields
    }
  }
}

export interface CompletionDeadlineErrorSummaryPresenter {
  errors: { message: string; linkedField: 'day' | 'month' | 'year' }[]
}
