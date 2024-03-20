import ViewUtils from '../../../utils/viewUtils'
import { SelectArgs, SelectArgsItem } from '../../../utils/govukFrontendTypes'
import CurrentLocationPresenter from './currentLocationPresenter'

export default class CurrentLocationView {
  constructor(private readonly presenter: CurrentLocationPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get prisonSelectArgs(): SelectArgs {
    const prisonItems = this.presenter.prisonAndSecureChildAgency.map(prisonAndSecureChildAgency => {
      return {
        text: prisonAndSecureChildAgency.description,
        value: prisonAndSecureChildAgency.id,
        selected: this.presenter.referral.personCustodyPrisonId
          ? this.presenter.referral.personCustodyPrisonId === prisonAndSecureChildAgency.id
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
      id: 'prison-select',
      name: 'prison-select',
      classes: 'select-location',
      items,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.submitLocationInput.errorMessage),
      label: {
        text: this.presenter.text.submitLocationInput.label,
      },
      hint: {
        text: this.presenter.text.submitLocationInput.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/submitLocation',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        warningText: this.presenter.text.warningText,
        prisonSelectArgs: this.prisonSelectArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
