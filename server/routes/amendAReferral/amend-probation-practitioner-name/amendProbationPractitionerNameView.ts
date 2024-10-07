import AmendProbationPractitionerNamePresenter from './amendProbationPractitionerNamePresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DetailsArgs, InputArgs } from '../../../utils/govukFrontendTypes'

export default class AmendProbationPractitionerNameView {
  constructor(private readonly presenter: AmendProbationPractitionerNamePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get probationPractitionerNameArgs(): InputArgs {
    return {
      id: 'amend-probation-practitioner-name',
      name: 'amend-probation-practitioner-name',
      label: {
        text: this.presenter.text.inputTitle,
      },
      classes: 'govuk-input--width-20',
      value: this.presenter.fields.ppName,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
    }
  }

  get reasonDetailsArgs(): DetailsArgs {
    const { referral } = this.presenter.referral
    return {
      summaryText: 'Will your changes make the referral ineligible?',
      html: `<p class="govuk-body">You can only change the probation practitioner details if they stay within the current PDU (probation delivery unit).</p>
      <p>If ${referral.serviceUser?.firstName} ${referral.serviceUser?.lastName} is moving out of the area to a different PDU (or has already) you will need to 
      <a href="/probation-practitioner/referrals/${this.presenter.referral.id}/withdrawal/start" target="_blank" rel="noopener noreferrer">withdraw this referral</a></p>`,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/probationPractitionerName',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonDetailsArgs: this.reasonDetailsArgs,
        probationPractitionerNameArgs: this.probationPractitionerNameArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
