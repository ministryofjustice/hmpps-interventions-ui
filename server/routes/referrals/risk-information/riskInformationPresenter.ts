import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class RiskInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s risk information`,
  }

  get introText(): string {
    return `Write a description of risks that will help the service provider. Do not use any sensitive or protected information.`
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalRiskInformation: this.utils.stringValue(
      this.referral.additionalRiskInformation,
      'additional-risk-information'
    ),
  }

  get additionalRiskInformation(): Record<string, string | null> {
    const hintText = `Include specific advice or considerations; for example, exclusion zones, restraining orders, or triggers that may lead to risky behaviour. Do not include any sensitive or protected details.`

    return {
      label: 'Add information for the service provider',
      hint: hintText,
      errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
    }
  }
}
