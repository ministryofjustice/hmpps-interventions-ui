import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import CalendarDay from '../../utils/calendarDay'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import utils from '../../utils/utils'

export default class CompletionDeadlinePresenter {
  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What date does the ${utils.convertToProperCase(
    this.serviceCategory.name
  )} service need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly referral: DraftReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private readonly utils = new PresenterUtils(this.userInputData)

  fields = {
    completionDeadline: this.utils.dateValue(
      this.referral.completionDeadline === null ? null : CalendarDay.parseIso8601Date(this.referral.completionDeadline),
      'completion-deadline',
      this.error
    ),
  }
}
