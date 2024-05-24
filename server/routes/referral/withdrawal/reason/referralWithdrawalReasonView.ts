import { BackLinkArgs, RadiosArgsItem } from '../../../../utils/govukFrontendTypes'
import ViewUtils from '../../../../utils/viewUtils'
import ReferralWithdrawalReasonPresenter from './referralWithdrawlReasonPresenter'

export default class ReferralWithdrawalReasonView {
  constructor(private readonly presenter: ReferralWithdrawalReasonPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get backLinkArgs(): BackLinkArgs {
    return {
      href: this.presenter.backLinkHref,
    }
  }

  get problemItems(): RadiosArgsItem[] {
    return this.presenter.problemReasonsFields
  }

  get userItems(): RadiosArgsItem[] {
    return this.presenter.userReasonsFields
  }

  get sentenceItems(): RadiosArgsItem[] {
    return this.presenter.sentenceReasonsFields
  }

  get earlyItems(): RadiosArgsItem[] {
    return this.presenter.earlyReasonsFields
  }

  get otherItems(): RadiosArgsItem[] {
    return this.presenter.otherReasonsFields
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'probationPractitionerReferrals/referralWithdrawalReason',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        problemItems: this.problemItems,
        userItems: this.userItems,
        sentenceItems: this.sentenceItems,
        otherItems: this.otherItems,
        earlyItems: this.earlyItems,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
