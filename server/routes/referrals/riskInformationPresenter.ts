import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class RiskInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s risk information`,
    additionalRiskInformation: {
      label: `Additional information for the provider about ${this.referral.serviceUser?.firstName}’s risks (optional)`,
      errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalRiskInformation: this.utils.stringValue(
      this.referral.additionalRiskInformation,
      'additional-risk-information'
    ),
  }
}
