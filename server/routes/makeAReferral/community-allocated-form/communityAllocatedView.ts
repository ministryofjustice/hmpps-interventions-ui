import ViewUtils from '../../../utils/viewUtils'
import { RadiosArgs } from '../../../utils/govukFrontendTypes'
import CommunityAllocatedPresenter from './communityAllocatedPresenter'

export default class CommunityAllocatedView {
  constructor(private readonly presenter: CommunityAllocatedPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private submitCommunityAllocatedArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: '',
      name: 'community-allocated',
      items: [
        {
          value: 'yes',
          text: this.presenter.text.communityAllocated.allocated,
          checked: this.presenter.referral.allocatedCommunityPP === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: this.presenter.text.communityAllocated.notAllocated,
          checked: this.presenter.referral.allocatedCommunityPP === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.communityAllocated.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/submitCommunityAllocated',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        submitCommunityAllocatedArgs: this.submitCommunityAllocatedArgs.bind(this),
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
