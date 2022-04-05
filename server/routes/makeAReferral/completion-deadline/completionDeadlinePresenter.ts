import CalendarDay from '../../../utils/calendarDay'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import Intervention from '../../../models/intervention'
import utils from '../../../utils/utils'

export default class CompletionDeadlinePresenter {
  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What date does the ${utils.convertToProperCase(
    this.intervention.contractType.name
  )} intervention need to be completed by?`

  readonly hint = 'For example, 27 10 2021'

  constructor(
    private readonly completionDeadline: string | null,
    private readonly intervention: Intervention,
    readonly sentReferral: Boolean | undefined = undefined,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private readonly utils = new PresenterUtils(this.userInputData)

  fields = {
    completionDeadline: this.utils.dateValue(
      this.completionDeadline === null ? null : CalendarDay.parseIso8601Date(this.completionDeadline),
      'completion-deadline',
      this.error
    ),
  }

  // get value(): string {
  //   if (this.userInputData !== null) {
  //     return this.userInputData['further-information'] ?? ''
  //   }
  //
  //   if (this.referral.furtherInformation) {
  //     return this.referral.furtherInformation
  //   }
  //
  //   return ''
  // }
}
