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

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalRiskInformation: this.utils.stringValue(
      this.referral.additionalRiskInformation,
      'additional-risk-information'
    ),
  }

  get additionalRiskInformation(): Record<string, string | null> {
    return this.riskPresenter.riskSummaryEnabled
      ? {
          label: 'Additional risk information',
          labelClasses: 'govuk-label--l',
          hint: 'Give any other information that is relevant to this referral. Do not include sensitive information about the individual or third parties.',
          errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
        }
      : {
          label: `Information for the service provider about ${this.referral.serviceUser?.firstName}’s risks`,
          labelClasses: 'govuk-label--s',
          hint: 'Give any other information that is relevant to this referral. Do not include sensitive information about the individual or third parties.',
          errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
        }
  }
}
