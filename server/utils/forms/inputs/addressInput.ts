import { Request } from 'express'
import { FormValidationResult } from '../formValidationResult'
import { Address } from '../../../models/actionPlan'

export default class AddressInput {
  constructor(private readonly request: Request, private readonly key: string) {}

  private get keys() {
    return {
      addressLine1: `${this.key}-address-line-1`,
      addressLine2: `${this.key}-address-line-2`,
      townOrCity: `${this.key}-address-town-or-city`,
      county: `${this.key}-address-county`,
      postCode: `${this.key}-address-postcode`,
    }
  }

  async validate(): Promise<FormValidationResult<Address>> {
    return {
      value: this.address!,
      error: null,
    }
  }

  get address(): Address | null {
    return {
      firstAddressLine: this.request.body[this.keys.addressLine1],
      secondAddressLine: this.request.body[this.keys.addressLine2],
      townOrCity: this.request.body[this.keys.townOrCity],
      county: this.request.body[this.keys.county],
      postCode: this.request.body[this.keys.postCode],
    }
  }
}
