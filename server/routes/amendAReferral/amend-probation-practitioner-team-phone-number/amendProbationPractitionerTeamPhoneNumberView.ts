import AmendProbationPractitionerTeamPhoneNumberPresenter from './amendProbationPractitionerTeamPhoneNumberPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DetailsArgs, InputArgs } from '../../../utils/govukFrontendTypes'

export default class AmendProbationPractitionerTeamPhoneNumberView {
  constructor(private readonly presenter: AmendProbationPractitionerTeamPhoneNumberPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get probationPractitionerPhoneNumberArgs(): InputArgs {
    return {
      id: 'amend-probation-practitioner-team-phone-number',
      name: 'amend-probation-practitioner-team-phone-number',
      label: {
        text: this.presenter.text.inputTitle,
      },
      classes: 'govuk-input--width-20',
      value: this.presenter.fields.ppTeamPhoneNumber,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get reasonDetailsArgs(): DetailsArgs {
    const { referral } = this.presenter.referral
    return {
      summaryText: 'Will your changes make the referral ineligible?',
      html: `<p class="govuk-body">You can only change the probation practitioner details if they stay within the current PDU (probation delivery unit).</p>
      <p>If ${referral.serviceUser?.firstName} ${referral.serviceUser?.lastName} is moving out of the area to a different PDU (or has already) you will need to 
      <a href="/probation-practitioner/referrals/${this.presenter.referral.id}/withdrawal/start">withdraw this referral</a></p>`,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/probationPractitionerTeamPhoneNumber',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonDetailsArgs: this.reasonDetailsArgs,
        probationPractitionerPhoneNumberArgs: this.probationPractitionerPhoneNumberArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
