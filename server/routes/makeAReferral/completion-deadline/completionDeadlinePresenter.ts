import CalendarDay from '../../../utils/calendarDay'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import Intervention from '../../../models/intervention'
import utils from '../../../utils/utils'
import CompletionDeadlineForm from './completionDeadlineForm'

export default class CompletionDeadlinePresenter {
  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly title = `What date does the ${utils.convertToProperCase(
    this.intervention.contractType.name
  )} intervention need to be completed by?`

  readonly completionDeadlineHint = 'For example, 27 10 2021'

  readonly reasonForChangeHint =
    'For example, there are not enough days to delivery the intervention based on the complexity levels.'

  constructor(
    private readonly completionDeadline: string | null,
    private readonly intervention: Intervention,
    readonly sentReferral: boolean | undefined = undefined,
    private readonly referralId: string,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private readonly utils = new PresenterUtils(this.userInputData)

  get backLinkHref(): string | null {
    return this.sentReferral ? `/probation-practitioner/referrals/${this.referralId}/details` : null
  }

  fields = {
    completionDeadline: this.utils.dateValue(
      this.completionDeadline === null ? null : CalendarDay.parseIso8601Date(this.completionDeadline),
      'completion-deadline',
      this.error
    ),
    reasonForChange: {
      value: this.utils.stringValue(null, CompletionDeadlineForm.reasonForChangeFieldId),
      errorMessage: PresenterUtils.errorMessage(this.error, CompletionDeadlineForm.reasonForChangeFieldId),
    },
  }
}
