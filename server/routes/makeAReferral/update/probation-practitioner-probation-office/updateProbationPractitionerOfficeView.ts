import { SelectArgs, SelectArgsItem } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerOfficePresenter from './updateProbationPractitionerOfficePresenter'

export default class UpdateProbationPractitionerOfficeView {
  constructor(private readonly presenter: UpdateProbationPractitionerOfficePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerOfficeSelectArgs(): SelectArgs {
    const officeLocationItems: SelectArgsItem[] = this.presenter.deliusOfficeLocations.map(officeLocation => ({
      text: officeLocation.name,
      value: officeLocation.name.toString(),
      selected: this.presenter.fields.ppProbationOffice
        ? this.presenter.fields.ppProbationOffice === officeLocation.name
        : false,
    }))

    const items: SelectArgsItem[] = [
      {
        text: '-- Select a Probation Office --',
      },
    ]

    items.push(...officeLocationItems)

    return {
      id: 'delius-probation-practitioner-office',
      name: 'delius-probation-practitioner-office',
      classes: 'confirm-probation-office',
      items,
      label: {
        text: this.presenter.text.label,
      },
      hint: {
        text: this.presenter.text.hint,
      },
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerOffice',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerOfficeSelectArgs: this.updateProbationPractitionerOfficeSelectArgs,
      },
    ]
  }
}
