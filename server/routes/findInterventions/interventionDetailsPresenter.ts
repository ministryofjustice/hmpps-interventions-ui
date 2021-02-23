import { Eligibility, Intervention } from '../../services/interventionsService'
import { SummaryListItem } from '../../utils/summaryList'
import utils from '../../utils/utils'

export default class InterventionDetailsPresenter {
  constructor(private readonly intervention: Intervention) {}

  get title(): string {
    return this.intervention.title
  }

  get hrefReferralStart(): string {
    return `/intervention/${this.intervention.id}/refer`
  }

  get hrefInterventionDetails(): string {
    return `/find-interventions/intervention/${this.intervention.id}`
  }

  get body(): string {
    return this.intervention.description
  }

  get tabs(): { id: string; title: string; items: SummaryListItem[] }[] {
    return [
      {
        id: 'service-provider-tab',
        title: 'Service Provider',
        items: this.serviceProviderSummary,
      },
    ]
  }

  get summary(): SummaryListItem[] {
    const summary = [
      {
        key: 'Type',
        lines: ['Dynamic Framework'],
        isList: false,
      },
      {
        key: 'Location',
        lines: [this.intervention.pccRegions.map(region => region.name).join(', ')],
        isList: false,
      },
      {
        key: 'Criminogenic needs',
        lines: [utils.convertToProperCase(this.intervention.serviceCategory.name)],
        isList: false,
      },
      {
        key: 'Provider',
        lines: [this.intervention.serviceProvider.name],
        isList: false,
      },
      {
        key: 'Age group',
        lines: [InterventionDetailsPresenter.ageGroupDescription(this.intervention.eligibility)],
        isList: false,
      },
      {
        key: 'Gender',
        lines: [InterventionDetailsPresenter.genderDescription(this.intervention.eligibility)],
        isList: false,
      },
    ]

    if (this.intervention.npsRegion !== null) {
      summary.splice(1, 0, {
        key: 'Region',
        lines: [utils.convertToTitleCase(this.intervention.npsRegion.name)],
        isList: false,
      })
    }

    return summary
  }

  static ageGroupDescription(eligibility: Eligibility): string {
    if (eligibility.maximumAge === null) {
      return `${eligibility.minimumAge}+`
    }
    return `${eligibility.minimumAge}–${eligibility.maximumAge}`
  }

  static genderDescription(eligibility: Eligibility): string {
    if (eligibility.allowsMale && eligibility.allowsFemale) {
      return 'Male and female'
    }
    if (eligibility.allowsMale) {
      return 'Male'
    }
    if (eligibility.allowsFemale) {
      return 'Female'
    }

    return ''
  }

  private get serviceProviderSummary(): SummaryListItem[] {
    return [
      {
        key: 'Name',
        lines: [this.intervention.serviceProvider.name],
        isList: false,
      },
    ]
  }
}
