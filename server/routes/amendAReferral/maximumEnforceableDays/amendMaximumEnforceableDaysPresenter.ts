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

  readonly backLinkUrl: string

  constructor(
    referralId: string,
    private readonly maximumEnforceableDays: number,
    private readonly firstName: string | null,
    private readonly lastName: string | null,
    private readonly crn: string,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.enforceableDaysPresenter = new EnforceableDaysPresenter(
      crn,
      maximumEnforceableDays,
      firstName,
      lastName,
      error,
      userInputData
    )
    this.fields = {
      reasonForChange: this.utils.stringValue(null, AmendMaximumEnforceableDaysForm.reasonForChangeId),
      ...this.enforceableDaysPresenter.fields,
    }
    this.backLinkUrl = `/probation-practitioner/referrals/${referralId}/details`
  }
}
