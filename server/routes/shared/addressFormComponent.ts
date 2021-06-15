import { InputArgs } from '../../utils/govukFrontendTypes'
import { Address } from '../../models/actionPlan'

export default class AddressFormComponent {
  constructor(private address: Address | null = null, private key: string) {}

  get inputArgs(): Record<string, unknown> {
    return {
      firstAddressLineInputArgs: this.firstAddressLineInputArgs,
      secondAddressLineInputArgs: this.secondAddressLineInputArgs,
      townOrCityInputArgs: this.townOrCityInputArgs,
      countyInputArgs: this.countyInputArgs,
      postCodeInputArgs: this.postCodeInputArgs,
    }
  }

  private get firstAddressLineInputArgs(): InputArgs {
    return {
      label: {
        html: 'Address line 1<span class="govuk-visually-hidden">line 1 of 2</span>',
      },
      id: `${this.key}-address-line-1`,
      name: 'address-line-1',
      value: this.address?.firstAddressLine,
    }
  }

  private get secondAddressLineInputArgs(): InputArgs {
    return {
      label: {
        html: 'Address line 2 (optional) <span class="govuk-visually-hidden">line 2 of 2</span>',
      },
      id: `${this.key}-address-line-2`,
      name: 'address-line-2',
      value: this.address?.secondAddressLine,
    }
  }

  private get townOrCityInputArgs(): InputArgs {
    return {
      label: {
        text: 'Town or city',
      },
      classes: 'govuk-!-width-two-thirds',
      id: `${this.key}-address-town-or-city`,
      name: 'address-town-or-city',
      value: this.address?.townOrCity,
    }
  }

  private get countyInputArgs(): InputArgs {
    return {
      label: {
        text: 'County',
      },
      classes: 'govuk-!-width-two-thirds',
      id: `${this.key}-address-county`,
      name: 'address-county',
      value: this.address?.county,
    }
  }

  private get postCodeInputArgs(): InputArgs {
    return {
      label: {
        text: 'Postcode',
      },
      classes: 'govuk-input--width-10',
      id: `${this.key}-address-postcode`,
      name: 'address-postcode',
      value: this.address?.postCode,
    }
  }
}
