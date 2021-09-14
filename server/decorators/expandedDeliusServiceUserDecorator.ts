import logger from '../../log'
import { Address, ExpandedDeliusServiceUser } from '../models/delius/deliusServiceUser'
import CalendarDay from '../utils/calendarDay'

export default class ExpandedDeliusServiceUserDecorator {
  constructor(private readonly deliusServiceUser: ExpandedDeliusServiceUser) {}

  get address(): string[] | null {
    const { addresses } = this.deliusServiceUser.contactDetails

    if (!addresses) {
      return null
    }

    if (addresses.length === 0) {
      return null
    }

    if (addresses.length === 1) {
      return this.deliusAddressToArray(addresses[0])
    }

    const nDeliusMainAddress = addresses.find(address => address.status?.code === 'M')

    if (nDeliusMainAddress) {
      return this.deliusAddressToArray(nDeliusMainAddress)
    }

    // If we have no "from" date, how do we know which is the most recent?
    if (addresses.every(address => address.from === null || address.from === undefined)) {
      logger.error({ err: `No 'from' value in addresses for user ${this.deliusServiceUser.otherIds.crn}.` })
      return null
    }

    const today = CalendarDay.britishDayForDate(new Date()).utcDate

    const currentAddresses = addresses.filter(address => {
      // If we have no "to" date, assume it's still current
      if (!address.to) {
        return true
      }

      return today < CalendarDay.britishDayForDate(new Date(address.to)).utcDate
    })

    if (currentAddresses.length === 0) {
      return null
    }
    const mostRecentAddress = currentAddresses.sort(
      (a, b) => new Date(b.from!).getTime() - new Date(a.from!).getTime()
    )[0]

    return this.deliusAddressToArray(mostRecentAddress)
  }

  private deliusAddressToArray(address: Address): string[] {
    // required to force removal of null from (string | null)[] and stop compiler complaining
    // taken from https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
    function notEmpty(value: string | null | undefined): value is string {
      return value !== null && value !== undefined
    }

    const numberAndOrBuildingName =
      address.addressNumber && address.buildingName
        ? `${address.addressNumber} ${address.buildingName},`
        : (address.addressNumber || `${address.buildingName},`) ?? ''

    const firstLine = `${numberAndOrBuildingName} ${address.streetName}`.trim()

    return [firstLine, address.town, address.district, address.county, address.postcode].filter(notEmpty)
  }
}
