import ViewUtils from '../../../utils/viewUtils'
import { RadiosArgs } from '../../../utils/govukFrontendTypes'
import PrisonReleasePresenter from './prisonReleasePresenter'

export default class PrisonReleaseFormView {
  constructor(private readonly presenter: PrisonReleasePresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private submitPrisonReleaseRadiosArgs(yesHtml: string): RadiosArgs {
    return {
      idPrefix: 'prison-release',
      name: 'prison-release',
      fieldset: {
        legend: {
          text: this.presenter.text.title,
          classes: 'govuk-fieldset__legend--xl',
        },
      },
      items: [
        {
          value: 'yes',
          text: this.presenter.text.fromPrison.released,
          checked: this.presenter.referral.isReferralReleasingIn12Weeks === true,
          conditional: {
            html: yesHtml,
          },
        },
        {
          value: 'no',
          text: this.presenter.text.fromPrison.notReleased,
          checked: this.presenter.referral.isReferralReleasingIn12Weeks === false,
        },
      ],
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.fromPrison.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/submitPrisonRelease',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        submitPrisonReleaseRadiosArgs: this.submitPrisonReleaseRadiosArgs.bind(this),
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
