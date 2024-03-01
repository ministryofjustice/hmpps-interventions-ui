import ReasonForReferralPresenter from './reasonForReferralPresenter'
import ViewUtils from '../../../utils/viewUtils'
import { HintArgs, TextareaArgs } from '../../../utils/govukFrontendTypes'
import { CurrentLocationType } from '../../../models/draftReferral'

export default class ReasonForReferralView {
  constructor(private readonly presenter: ReasonForReferralPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get reasonForReferralArgs(): TextareaArgs {
    return {
      id: 'reason-for-referral',
      name: 'reason-for-referral',
      value: this.presenter.fields.reasonForReferral,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.errorMessage),
      label: {},
      hint: this.renderHints,
    }
  }

  get renderHints(): HintArgs {
    const { referral } = this.presenter

    const preReleaseWithCom =
      referral.personCurrentLocationType === CurrentLocationType.custody &&
      referral.isReferralReleasingIn12Weeks === null
    const community =
      referral.personCurrentLocationType === CurrentLocationType.community &&
      referral.isReferralReleasingIn12Weeks === null
    const unallocatedPreRelease = referral.isReferralReleasingIn12Weeks

    if (preReleaseWithCom || unallocatedPreRelease) {
      return {
        html: `<p class="govuk-body">Reason for the referral:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>why ${this.presenter.referral.serviceUser?.firstName} wants the intervention</li>
          <li>what ${this.presenter.referral.serviceUser?.firstName} hopes to achieve</li>
          <li>previously completed intervention programmes</li>
          <li>other support services ${this.presenter.referral.serviceUser?.firstName} is currently engaging with</li>
        </ul>
        <p class="govuk-body">Further information could include:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>safety warnings (sexual or violent offences, racist behaviour, arson) not covered elsewhere in the referral</li>
          <li>if ${this.presenter.referral.serviceUser?.firstName} is currently NFA (no fixed address) leaving custody</li>
          <li>${this.presenter.referral.serviceUser?.firstName}’s gender identity (if relevant)</li>
        </ul>
        `,
      }
    }
    if (community) {
      return {
        html: `<p class="govuk-body">Reason for the referral:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>why ${this.presenter.referral.serviceUser?.firstName} wants the intervention</li>
          <li>what ${this.presenter.referral.serviceUser?.firstName} hopes to achieve</li>
          <li>previously completed intervention programmes</li>
          <li>other support services ${this.presenter.referral.serviceUser?.firstName} is currently engaging with</li>
        </ul>
        <p class="govuk-body">Further information could include:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>safety warnings (sexual or violent offences, racist behaviour, arson) not covered elsewhere in the referral</li>
          <li>if ${this.presenter.referral.serviceUser?.firstName} is currently NFA (no fixed address)</li>
          <li>${this.presenter.referral.serviceUser?.firstName}’s gender identity (if relevant)</li>
        </ul>
        `,
      }
    }
    return {
      html: `<p class="govuk-body">Reason for the referral:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>why ${this.presenter.referral.serviceUser?.firstName} wants the intervention</li>
          <li>what ${this.presenter.referral.serviceUser?.firstName} hopes to achieve</li>
        </ul>
        `,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/reasonForReferral',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        reasonForReferralArgs: this.reasonForReferralArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
