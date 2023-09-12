import ViewUtils from '../../../utils/viewUtils'
import { RadiosArgs } from '../../../utils/govukFrontendTypes'
import ReferralTypePresenter from './referralTypePresenter'
import { CurrentLocationType } from '../../../models/draftReferral'

export default class ReferralTypeFormView {
  constructor(private readonly presenter: ReferralTypePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private submitLocationRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'current-location',
      name: 'current-location',
      fieldset: {
        legend: {
          text: this.presenter.text.currentLocation.label,
          classes: 'govuk-fieldset__legend--m',
        },
      },
      items: [
        {
          value: CurrentLocationType.custody.toString(),
          text: this.presenter.text.currentLocation.custodyLabel,
          checked: this.presenter.referral.personCurrentLocationType === CurrentLocationType.custody.toString(),
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: CurrentLocationType.community.toString(),
          text: this.presenter.text.currentLocation.communityLabel,
          checked: this.presenter.referral.personCurrentLocationType === CurrentLocationType.community.toString(),
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.currentLocation.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/submitReferralType',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        submitLocationRadiosArgs: this.submitLocationRadiosArgs.bind(this),
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
