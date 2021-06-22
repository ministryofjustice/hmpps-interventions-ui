import DraftReferral from '../../models/draftReferral'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import config from '../../config'
import RiskToSelf, { RiskResponse } from '../../models/assessRisksAndNeeds/riskToSelf'

export interface RoshAnalysisTableRow {
  riskTo: string
  riskScore: string
}

export interface RiskToSelfSummaryListRow {
  riskConcern: string
  riskResponse: string
  riskCurrent: string
}

export default class RiskInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly riskSummary: RiskSummary | null,
    private readonly riskToSelf: RiskToSelf,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  readonly riskSummaryEnabled = config.apis.assessRisksAndNeedsApi.riskSummaryEnabled

  readonly text = {
    title: `${this.referral.serviceUser?.firstName}’s risk information`,
    additionalRiskInformation: this.riskSummaryEnabled
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
        },
    whoIsAtRisk: this.riskSummary?.whoIsAtRisk,
    natureOfRisk: this.riskSummary?.natureOfRisk,
    riskImminence: this.riskSummary?.riskImminence,
  }

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

  get riskToSelfRows(): RiskToSelfSummaryListRow[] {
    return [
      {
        riskConcern: 'suicide',
        riskResponse: this.riskResponseToText(this.riskToSelf.suicide?.risk),
        riskCurrent: this.riskToSelf.suicide?.current || '',
      },
      {
        riskConcern: 'self-harm',
        riskResponse: this.riskResponseToText(this.riskToSelf.selfHarm?.risk),
        riskCurrent: this.riskToSelf.selfHarm?.current || '',
      },
      {
        riskConcern: 'coping in a hostel setting',
        riskResponse: this.riskResponseToText(this.riskToSelf.hostelSetting?.risk),
        riskCurrent: this.riskToSelf.hostelSetting?.current || '',
      },
      {
        riskConcern: 'vulnerability',
        riskResponse: this.riskResponseToText(this.riskToSelf.vulnerability?.risk),
        riskCurrent: this.riskToSelf.vulnerability?.current || '',
      },
    ]
  }

  private riskResponseToText(riskResponse?: RiskResponse | null): string {
    switch (riskResponse) {
      case 'YES':
        return 'Yes'
      case 'NO':
        return 'No'
      default:
        return "Don't know"
    }
  }
}
