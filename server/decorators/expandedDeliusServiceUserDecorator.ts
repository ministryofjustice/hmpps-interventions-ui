import DeliusServiceUser, { Address } from '../models/delius/deliusServiceUser'

export default class ExpandedDeliusServiceUserDecorator {
  constructor(private readonly deliusServiceUser: DeliusServiceUser) {}

  get address(): string[] | null {
    if (this.deliusServiceUser.contactDetails?.mainAddress) {
      return this.deliusAddressToArray(this.deliusServiceUser.contactDetails!.mainAddress)
    }
    return null
  }

  get email(): string[] | null {
    if (
      this.deliusServiceUser.contactDetails?.emailAddress &&
      this.deliusServiceUser.contactDetails!.emailAddress.length > 0
    ) {
      return [this.deliusServiceUser.contactDetails!.emailAddress]
    }
    return null
  }

  private deliusAddressToArray(address: Address): string[] {
    // required to force removal of null from (string | null)[] and stop compiler complaining
    // taken from https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
    function notEmpty(value: string | null | undefined): value is string {
      return value !== null && value !== undefined
    }

    const numberAndOrBuildingName =
      address.buildingNumber && address.buildingName
        ? `${address.buildingNumber} ${address.buildingName},`
        : ((address.buildingNumber || address.buildingName) ?? '')

    const firstLine = `${numberAndOrBuildingName} ${address.streetName}`.trim()

    return [firstLine, address.town, address.district, address.county, address.postcode].filter(notEmpty)
  }
}
