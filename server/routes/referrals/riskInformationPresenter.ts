import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import RiskPresenter from '../shared/riskPresenter'

export default class RiskInformationPresenter {
  riskPresenter: RiskPresenter

  constructor(
    private readonly referral: DraftReferral,
    private readonly riskSummary: RiskSummary | null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.riskPresenter = new RiskPresenter(riskSummary)
  }

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s risk information`,
  }

  get introText(): string {
    return `Write a description of risks that will help the service provider. Do not use any sensitive or protected information.${
      this.riskPresenter.riskInformationAvailable
        ? ' We will share basic risk information with the service provider, including ROSH levels, categories of those at risk, and risk to self.'
        : ''
    }`
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
    const hintText = `Include specific advice or considerations${
      this.riskPresenter.riskInformationAvailable ? ' from the information above' : ''
    }; for example, exclusion zones, restraining orders, or triggers that may lead to risky behaviour. Do not include any sensitive or protected details.`

    return {
      label: 'Add information for the service provider',
      hint: hintText,
      errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
    }
  }
}
