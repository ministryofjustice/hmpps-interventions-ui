import { SummaryListItem } from '../../utils/summaryList'
import InterventionsFilter from './interventionsFilter'
import utils from '../../utils/utils'
import PCCRegion from '../../models/pccRegion'

export default class SearchSummaryPresenter {
  constructor(private readonly filter: InterventionsFilter, private readonly pccRegions: PCCRegion[]) {}

  get summary(): SummaryListItem[] {
    const result: SummaryListItem[] = []

    if (this.regionItem !== null) {
      result.push(this.regionItem)
    }

    if (this.genderItem !== null) {
      result.push(this.genderItem)
    }

    if (this.ageItem !== null) {
      result.push(this.ageItem)
    }

    return result
  }

  private get regionItem(): SummaryListItem | null {
    if (this.filter.pccRegionIds === undefined) {
      return null
    }

    const names = this.filter.pccRegionIds.map(id => {
      const region = this.pccRegions.find(aRegion => aRegion.id === id)
      if (region === undefined) {
        throw new Error(`Could not find PCC region with ID ${id}`)
      }
      return region.name
    })

    names.sort()

    return { key: 'In', lines: [names.join(', ')], isList: false }
  }

  private get genderItem(): SummaryListItem | null {
    if (this.filter.gender === undefined) {
      return null
    }

    return { key: 'For', lines: [this.filter.gender.map(utils.convertToProperCase).join(', ')], isList: false }
  }

  private get ageItem(): SummaryListItem | null {
    if (this.filter.age === undefined) {
      return null
    }

    const names = this.filter.age.map(age => {
      switch (age) {
        case '18-to-25-only':
          return '18 to 25 only'
        default:
          throw new Error(`No message for age filter ${age}`)
      }
    })

    return { key: 'Aged', lines: [names.join(', ')], isList: false }
  }
}
