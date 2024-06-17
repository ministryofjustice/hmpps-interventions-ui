import AmendReasonForReferralPresenter from './amendReasonForReferralPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { DetailsArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'
import { CurrentLocationType } from '../../../models/draftReferral'

export default class AmendReasonForReferralView {
  constructor(private readonly presenter: AmendReasonForReferralPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get reasonForReferralArgs(): TextareaArgs {
    return {
      id: 'amend-reason-for-referral',
      name: 'amend-reason-for-referral',
      rows: '12',
      value: this.presenter.fields.reasonForReferral,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      label: {},
    }
  }

  get reasonDetailsArgs(): DetailsArgs {
    const { referral } = this.presenter.referral
    const preReleaseWithCom =
      referral.personCurrentLocationType === CurrentLocationType.custody &&
      referral.isReferralReleasingIn12Weeks === null
    const commentsSuggestion = `if ${referral.serviceUser?.firstName} is currently NFA (no fixed address) ${
      preReleaseWithCom ? 'leaving custody' : ''
    }`
    return {
      summaryText: 'Suggestions on what to include in this section',
      html: `<p class="govuk-body">Reason for the referral:</p>
      <ul class="govuk-list govuk-list--bullet">
        <li>why ${referral.serviceUser?.firstName} wants the intervention</li>
        <li>what ${referral.serviceUser?.firstName} hopes to achieve</li>
        <li>previously completed intervention programmes</li>
        <li>other support services ${referral.serviceUser?.firstName} is currently engaging with</li>
      </ul>
      <p class="govuk-body">Further information could include:</p>
      <ul class="govuk-list govuk-list--bullet">
        <li>safety warnings (sexual or violent offences, racist behaviour) not covered elsewhere in the referral</li>
        <li>${commentsSuggestion}</li>
        <li>${referral.serviceUser?.firstName}’s gender identity (if relevant)</li>
      </ul>
      `,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'amendAReferral/reasonForReferral',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonDetailsArgs: this.reasonDetailsArgs,
        reasonForReferralArgs: this.reasonForReferralArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
