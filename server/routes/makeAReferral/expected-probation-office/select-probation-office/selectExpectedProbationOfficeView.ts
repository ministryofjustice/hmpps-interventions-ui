import { SelectArgs, SelectArgsItem } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import SelectExpectedProbationOfficePresenter from './selectExpectedProbationOfficePresenter'

export default class SelectExpectedProbationOfficeView {
  constructor(private readonly presenter: SelectExpectedProbationOfficePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get expectedProbationOfficeSelectArgs(): SelectArgs {
    const officeLocationItems: SelectArgsItem[] = this.presenter.deliusOfficeLocations.map(officeLocation => ({
      text: officeLocation.name,
      value: officeLocation.name.toString(),
      selected: this.presenter.fields.expectedProbationOffice
        ? this.presenter.fields.expectedProbationOffice === officeLocation.name
        : false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Probation Office --',
      },
    ]

    items.push(...officeLocationItems)

    return {
      id: 'expected-probation-office',
      name: 'expected-probation-office',
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
      'makeAReferral/expectedProbationOffice',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        expectedProbationOfficeSelectArgs: this.expectedProbationOfficeSelectArgs,
      },
    ]
  }
}
