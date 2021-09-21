import OasysRiskInformationPresenter from './oasysRiskInformationPresenter'
import { Risk } from '../../../../../models/assessRisksAndNeeds/riskSummary'

export default class OasysRiskInformationView {
  constructor(private readonly presenter: OasysRiskInformationPresenter) {}

  private get additionalRiskInformationResponse(): { class: string; text: string } | undefined {
    if (this.presenter.additionalInformation) {
      return undefined
    }
    return {
      class: 'app-oasys-text app-oasys-text--dark-grey',
      text: 'None',
    }
  }

  private readonly noInformationProvidedResponse = {
    class: 'app-oasys-text app-oasys-text--dark-grey',
    text: 'No information provided',
  }

  private riskSummaryResponse = {
    whoIsAtRisk: this.presenter.riskSummary.summary.whoIsAtRisk ? undefined : this.noInformationProvidedResponse,
    natureOfRisk: this.presenter.riskSummary.summary.natureOfRisk ? undefined : this.noInformationProvidedResponse,
    riskImminence: this.presenter.riskSummary.summary.riskImminence ? undefined : this.noInformationProvidedResponse,
  }

  private riskToSelfResponse = {
    suicide: {
      class: this.riskToSelfResponseTextClass(this.presenter.riskSummary.riskToSelf.suicide),
      text: this.riskToSelfResponseText(this.presenter.riskSummary.riskToSelf.suicide),
    },
    selfHarm: {
      class: this.riskToSelfResponseTextClass(this.presenter.riskSummary.riskToSelf.selfHarm),
      text: this.riskToSelfResponseText(this.presenter.riskSummary.riskToSelf.selfHarm),
    },
    hostelSetting: {
      class: this.riskToSelfResponseTextClass(this.presenter.riskSummary.riskToSelf.hostelSetting),
      text: this.riskToSelfResponseText(this.presenter.riskSummary.riskToSelf.hostelSetting),
    },
    vulnerability: {
      class: this.riskToSelfResponseTextClass(this.presenter.riskSummary.riskToSelf.vulnerability),
      text: this.riskToSelfResponseText(this.presenter.riskSummary.riskToSelf.vulnerability),
    },
  }

  private riskToSelfResponseText(risk: Risk | undefined | null): string {
    if (!risk) {
      return "Don't know"
    }
    switch (risk.current) {
      case 'YES':
        return 'Yes'
      case 'NO':
        return 'No'
      default:
        return "Don't know"
    }
  }

  private riskToSelfResponseTextClass(risk: Risk | undefined | null): string {
    if (!risk) {
      return 'app-oasys-text app-oasys-text--dark-grey'
    }
    switch (risk.current) {
      case 'YES':
        return 'app-oasys-text app-oasys-text--green'
      case 'NO':
        return 'app-oasys-text app-oasys-text--red'
      default:
        return 'app-oasys-text app-oasys-text--dark-grey'
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'referrals/riskInformationOasys',
      {
        riskSummary: this.presenter.riskSummary.summary,
        riskSummaryResponse: this.riskSummaryResponse,
        riskToSelf: this.presenter.riskSummary.riskToSelf,
        riskToSelfResponse: this.riskToSelfResponse,
        additionalRiskInformation: this.presenter.additionalInformation,
        additionalRiskInformationResponse: this.additionalRiskInformationResponse,
        latestAssessment: this.presenter.latestAssessment,
      },
    ]
  }
}
