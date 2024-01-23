import { InputArgs } from '../../../../utils/govukFrontendTypes'
import DeleteProbationPractitionerPresenter from './deleteProbationPractitionerPresenter'

export default class DeleteProbationPractitionerView {
  constructor(private readonly presenter: DeleteProbationPractitionerPresenter) {}

  // private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get deleteProbationPractitionerEmailInputArgs(): InputArgs {
    return {
      id: 'delius-probation-practitioner-email',
      name: 'delius-probation-practitioner-email',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.inputHeading,
        classes: 'govuk-label',
      },

      value: this.presenter.fields.ndeliusPPEmailAddress,
      // errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/deleteProbationPractitionerEmail',
      {
        presenter: this.presenter,
        // errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        deleteProbationPractitionerEmailInputArgs: this.deleteProbationPractitionerEmailInputArgs,
      },
    ]
  }
}
