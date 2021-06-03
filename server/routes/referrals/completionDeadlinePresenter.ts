import DraftReferral from '../../models/draftReferral'
import CalendarDay from '../../utils/calendarDay'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import Intervention from '../../models/intervention'
import utils from '../../utils/utils'

export default class CompletionDeadlinePresenter {
  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What date does the ${utils.convertToProperCase(
    this.intervention.contractType.name
  )} referral need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
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
