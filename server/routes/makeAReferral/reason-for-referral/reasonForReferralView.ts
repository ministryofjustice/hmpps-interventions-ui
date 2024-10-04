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
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.reasonForReferralErrorMessage),
      label: {},
      hint: this.renderReasonForReferralHints,
    }
  }

  get renderReasonForReferralHints(): HintArgs {
    const { referral } = this.presenter

    const preReleaseWithCom =
      referral.personCurrentLocationType === CurrentLocationType.custody &&
      referral.isReferralReleasingIn12Weeks === null
    // const community =
    //   referral.personCurrentLocationType === CurrentLocationType.community &&
    //   referral.isReferralReleasingIn12Weeks === null
    const unallocatedPreRelease = referral.isReferralReleasingIn12Weeks

    if (preReleaseWithCom || unallocatedPreRelease) {
      return {
        html: `<p class="govuk-body">Referral Details:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>why ${this.presenter.referral.serviceUser?.firstName} is being referred</li>
          <li>what ${this.presenter.referral.serviceUser?.firstName} hopes to achieve</li>
          <li>details of any pre-release transition support ${referral.serviceUser?.firstName} needs and ongoing post-release support required in the community</li>
          <li>any relevant licence/PSS conditions that require consideration to ensure safe delivery of CRS services</li>
          <li>previous interventions or activities undertaken in relation to this service need</li>
          <li>other support services ${this.presenter.referral.serviceUser?.firstName} is currently engaging with (and times of regular appointments)</li>
        </ul>
        `,
      }
    }
    // Community or prison
    return {
      html: `<p class="govuk-body">Referral Details:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>why ${this.presenter.referral.serviceUser?.firstName} is being referred</li>
          <li>what ${this.presenter.referral.serviceUser?.firstName} hopes to achieve</li>
          <li>any relevant licence/PSS conditions that require consideration to ensure safe delivery of CRS services</li>
          <li>previous interventions or activities undertaken in relation to this service need</li>
          <li>other support services ${this.presenter.referral.serviceUser?.firstName} is currently engaging with (and times of regular appointments)</li>
        </ul>
        `,
    }
  }

  private get reasonForReferralFurtherInformationArgs(): TextareaArgs {
    return {
      id: 'reason-for-referral-further-information',
      name: 'reason-for-referral-further-information',
      value: this.presenter.fields.reasonForReferralFurtherInformation,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.reasonForReferralFurtherInformationErrorMessage),
      label: {},
      hint: this.renderFurtherInformationHints,
    }
  }

  get renderFurtherInformationHints(): HintArgs {
    return {
      html: `<p class="govuk-body">Further information about ${this.presenter.referral.serviceUser?.firstName}:</p>
        <ul class="govuk-list govuk-list--bullet">
          <li>any relevant registration flags on nDelius such as sexual or violent offences, racist behaviour, arson, 
          risk to staff, MAPPA, domestic abuse perpetrator or victim, modern day slavery perpetrator or victim</li>
          <li>if ${this.presenter.referral.serviceUser?.firstName} will be NFA (no fixed address) leaving custody</li>
          <li>if ${this.presenter.referral.serviceUser?.firstName} is a victim of domestic abuse or modern-day slavery indicate whether it is safe to contact by phone/email. If not, what is the preferred method of contact?</li>
          <li>${this.presenter.referral.serviceUser?.firstName}'s gender identity (if relevant)</li>
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
        reasonForReferralFurtherInformationArgs: this.reasonForReferralFurtherInformationArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
