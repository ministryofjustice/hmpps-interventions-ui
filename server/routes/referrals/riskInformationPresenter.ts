import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export default class RiskInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly riskSummary: RiskSummary | null,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s risk information`,
    additionalRiskInformation: {
      label: `Information for the service provider about ${this.referral.serviceUser?.firstName}’s risks`,
      errorMessage: PresenterUtils.errorMessage(this.error, 'additional-risk-information'),
    },
  }

  readonly riskSummaryEnabled = config.apis.assessRisksAndNeedsApi.riskSummaryEnabled

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    additionalRiskInformation: this.utils.stringValue(
      this.referral.additionalRiskInformation,
      'additional-risk-information'
    ),
  }

  get roshAnalysisHeaders(): string[] {
    return ['Risk to', 'Risk in community']
  }

  get roshAnalysisRows(): RoshAnalysisTableRow[] {
    if (this.riskSummary === null) return []

    return Object.entries(this.riskSummary.riskInCommunity).flatMap(([riskScore, riskGroups]) => {
      return riskGroups.map(riskTo => {
        return { riskTo, riskScore }
      })
    })
  }
}
