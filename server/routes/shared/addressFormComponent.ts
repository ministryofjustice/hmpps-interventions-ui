import { InputArgs } from '../../utils/govukFrontendTypes'
import { AddressInputPresenter } from '../../utils/presenterUtils'
import ViewUtils from '../../utils/viewUtils'

export default class AddressFormComponent {
  constructor(private address: AddressInputPresenter, private key: string) {}

  get inputArgs(): Record<string, InputArgs> {
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
      errorMessage: ViewUtils.govukErrorMessage(this.address.errors.firstAddressLine),
      id: `${this.key}-address-line-1`,
      name: `${this.key}-address-line-1`,
      value: this.address.value?.firstAddressLine,
    }
  }

  private get secondAddressLineInputArgs(): InputArgs {
    return {
      label: {
        html: 'Address line 2 (optional) <span class="govuk-visually-hidden">line 2 of 2</span>',
      },
      id: `${this.key}-address-line-2`,
      name: `${this.key}-address-line-2`,
      value: this.address.value?.secondAddressLine,
    }
  }

  private get townOrCityInputArgs(): InputArgs {
    return {
      label: {
        text: 'Town or city (optional)',
      },
      classes: 'govuk-!-width-two-thirds',
      id: `${this.key}-address-town-or-city`,
      name: `${this.key}-address-town-or-city`,
      value: this.address.value?.townOrCity,
    }
  }

  private get countyInputArgs(): InputArgs {
    return {
      label: {
        text: 'County (optional)',
      },
      classes: 'govuk-!-width-two-thirds',
      id: `${this.key}-address-county`,
      name: `${this.key}-address-county`,
      value: this.address.value?.county,
    }
  }

  private get postCodeInputArgs(): InputArgs {
    return {
      label: {
        text: 'Postcode',
      },
      errorMessage: ViewUtils.govukErrorMessage(this.address.errors.postcode),
      classes: 'govuk-input--width-10',
      id: `${this.key}-address-postcode`,
      name: `${this.key}-address-postcode`,
      value: this.address.value?.postCode,
    }
  }
}
