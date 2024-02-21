import { InputArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerPhoneNumberPresenter from './updateProbationPractitionerPhoneNumberPresenter'

export default class UpdateProbationPractitionerPhoneNumberView {
  constructor(private readonly presenter: UpdateProbationPractitionerPhoneNumberPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerTelephoneNumberInputArgs(): InputArgs {
    return {
      id: 'delius-probation-practitioner-phone-number',
      name: 'delius-probation-practitioner-phone-number',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.inputHeading,
        classes: 'govuk-label',
      },

      value: this.presenter.fields.ndeliusTelephoneNumber,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerTelephoneNumber',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerTelephoneNumberInputArgs: this.updateProbationPractitionerTelephoneNumberInputArgs,
      },
    ]
  }
}
