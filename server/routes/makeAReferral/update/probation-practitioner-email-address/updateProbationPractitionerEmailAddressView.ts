import { InputArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerEmailAddressPresenter from './updateProbationPractitionerEmailAddressPresenter'

export default class UpdateProbationPractitionerEmailAddressView {
  constructor(private readonly presenter: UpdateProbationPractitionerEmailAddressPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerEmailAddressInputArgs(): InputArgs {
    return {
      id: 'delius-probation-practitioner-email-address',
      name: 'delius-probation-practitioner-email-address',
      classes: 'govuk-input--width-30',
      label: {
        text: this.presenter.text.inputHeading,
        classes: 'govuk-label',
      },

      value: this.presenter.fields.ndeliusPPEmailAddress,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerEmailAddress',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerEmailAddressInputArgs: this.updateProbationPractitionerEmailAddressInputArgs,
      },
    ]
  }
}
