import AmendPrisonEstablishmentPresenter from './amendPrisonEstablishmentPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { SelectArgs, SelectArgsItem, TextareaArgs } from '../../../utils/govukFrontendTypes'

export default class AmendPrisonEstablishmentView {
  constructor(private readonly presenter: AmendPrisonEstablishmentPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get reasonForChangeInputArgs(): TextareaArgs {
    return {
      name: 'reason-for-change',
      id: 'reason-for-change',
      label: {
        text: this.presenter.text.reasonForChangeHeading,
        classes: 'govuk-label--m',
        isPageHeading: false,
      },
      rows: '5',
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.reasonForChangeErrorMessage),
      value: this.presenter.fields.reasonForChange,
    }
  }

  private get prisonSelectArgs(): SelectArgs {
    const prisonItems = this.presenter.prisonAndSecureChildAgency.map(prisonAndSecureChildAgency => {
      return {
        text: prisonAndSecureChildAgency.description,
        value: prisonAndSecureChildAgency.id,
        selected: this.presenter.referral.referral.personCustodyPrisonId
          ? this.presenter.referral.referral.personCustodyPrisonId === prisonAndSecureChildAgency.id
          : false,
      }
    })

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Prison Location --',
      },
    ]

    items.push(...prisonItems)

    return {
      id: 'amend-prison-establishment',
      name: 'amend-prison-establishment',
      classes: 'select-location',
      items,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.submitLocationInput.errorMessage),
      label: {
        text: this.presenter.text.submitLocationInput.label,
        classes: 'govuk-label--m',
      },
      hint: {
        text: this.presenter.text.submitLocationInput.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/prisonEstablishment',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        reasonForChangeInputArgs: this.reasonForChangeInputArgs,
        prisonSelectArgs: this.prisonSelectArgs,
        suppressServiceUserBanner: true,
      },
    ]
  }
}
