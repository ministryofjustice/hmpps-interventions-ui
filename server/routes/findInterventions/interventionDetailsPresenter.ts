import Intervention, { Eligibility } from '../../models/intervention'
import { ListStyle, SummaryListItem } from '../../utils/summaryList'
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

  get description(): string {
    return this.intervention.description
  }

  get truncatedDescription(): string {
    // take just the first line of the description, up to a maximum of 500 characters
    const firstLine = this.intervention.description.split('\n')[0]
    return `${firstLine.substring(0, 500)}${firstLine.length > 500 ? '...' : ''}`
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
        lines: ['Commissioned Rehabilitative Service'],
      },
      {
        key: 'Location',
        lines: [this.intervention.pccRegions.map(region => region.name).join(', ')],
      },
      {
        key: this.intervention.serviceCategories.length > 1 ? 'Service categories' : 'Service category',
        lines: this.intervention.serviceCategories.map(serviceCategory =>
          utils.convertToProperCase(serviceCategory.name)
        ),
        listStyle: this.intervention.serviceCategories.length > 1 ? ListStyle.bulleted : undefined,
      },
      {
        key: 'Provider',
        lines: [this.intervention.serviceProvider.name],
      },
      {
        key: 'Age group',
        lines: [InterventionDetailsPresenter.ageGroupDescription(this.intervention.eligibility)],
      },
      {
        key: 'Gender',
        lines: [InterventionDetailsPresenter.genderDescription(this.intervention.eligibility)],
      },
    ]

    if (this.intervention.npsRegion !== null) {
      summary.splice(1, 0, {
        key: 'Region',
        lines: [utils.convertToTitleCase(this.intervention.npsRegion.name)],
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
      },
    ]
  }
}
