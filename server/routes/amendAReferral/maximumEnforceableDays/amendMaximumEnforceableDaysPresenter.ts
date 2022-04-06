import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import EnforceableDaysPresenter from '../../makeAReferral/enforceable-days/enforceableDaysPresenter'
import AmendMaximumEnforceableDaysForm from './amendMaximumEnforceableDaysForm'

export default class AmendMaximumEnforceableDaysPresenter {
  private readonly utils = new PresenterUtils(this.userInputData)

  readonly errorMessage = PresenterUtils.errorMessage(this.error, AmendMaximumEnforceableDaysForm.reasonForChangeId)

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly enforceableDaysPresenter: EnforceableDaysPresenter

  fields: Record<string, unknown>

  readonly title = 'What is the reason for changing the maximum number of days?'

  constructor(
    private readonly maximumEnforceableDays: number,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.enforceableDaysPresenter = new EnforceableDaysPresenter(maximumEnforceableDays, error, userInputData)
    this.fields = {
      reasonForChange: this.utils.stringValue(null, AmendMaximumEnforceableDaysForm.reasonForChangeId),
      ...this.enforceableDaysPresenter.fields,
    }
  }
}
