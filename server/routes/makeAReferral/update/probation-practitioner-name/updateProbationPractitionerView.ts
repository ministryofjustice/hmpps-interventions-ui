import { InputArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerPresenter from './updateProbationPractitionerPresenter'

export default class UpdateProbationPractitionerView {
  constructor(private readonly presenter: UpdateProbationPractitionerPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerNameInputArgs(): InputArgs {
    return {
      id: 'delius-probation-practitioner-name',
      name: 'delius-probation-practitioner-name',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.inputHeading,
        classes: 'govuk-label',
      },

      value: this.presenter.fields.ndeliusPPName,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerName',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerNameInputArgs: this.updateProbationPractitionerNameInputArgs,
      },
    ]
  }
}
