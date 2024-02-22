import { InputArgs } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import UpdateProbationPractitionerTeamPhoneNumberPresenter from './updateProbationPractitionerTeamPhoneNumberPresenter'

export default class UpdateProbationPractitionerTeamPhoneNumberView {
  constructor(private readonly presenter: UpdateProbationPractitionerTeamPhoneNumberPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get updateProbationPractitionerTeamTelephoneNumberInputArgs(): InputArgs {
    return {
      id: 'delius-probation-practitioner-team-phone-number',
      name: 'delius-probation-practitioner-team-phone-number',
      classes: 'govuk-input--width-20',
      label: {
        text: this.presenter.text.inputHeading,
        classes: 'govuk-label',
      },

      value: this.presenter.fields.ppTeamPhoneNumber,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/updateProbationPractitionerTeamTelephoneNumber',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        updateProbationPractitionerTeamTelephoneNumberInputArgs:
          this.updateProbationPractitionerTeamTelephoneNumberInputArgs,
      },
    ]
  }
}
