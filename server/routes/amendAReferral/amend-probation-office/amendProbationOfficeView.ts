import AmendProbationOfficePresenter from './amendProbationOfficePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { SelectArgs, SelectArgsItem } from '../../../utils/govukFrontendTypes'

export default class AmendProbationOfficeView {
  constructor(private readonly presenter: AmendProbationOfficePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get probationOfficeSelectArgs(): SelectArgs {
    const officeLocationItems: SelectArgsItem[] = this.presenter.deliusOfficeLocations.map(officeLocation => ({
      text: officeLocation.name,
      value: officeLocation.name.toString(),
      selected: false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Probation Office --',
      },
    ]

    items.push(...officeLocationItems)

    return {
      id: 'probation-office',
      name: 'probation-office',
      classes: 'confirm-probation-office',
      items,
      label: {
        text: this.presenter.text.inputHeading,
      },
      hint: {
        text: this.presenter.text.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/amendProbationOffice',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        probationOfficeSelectArgs: this.probationOfficeSelectArgs,
      },
    ]
  }
}
