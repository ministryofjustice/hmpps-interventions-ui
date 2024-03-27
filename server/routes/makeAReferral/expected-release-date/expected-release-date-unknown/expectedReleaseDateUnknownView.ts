import ViewUtils from '../../../../utils/viewUtils'
import { TextareaArgs } from '../../../../utils/govukFrontendTypes'
import ExpectedReleaseDateUnknownPresenter from './expectedReleaseDateUnknownPresenter'

export default class ExpectedReleaseDateUnknownView {
  constructor(private readonly presenter: ExpectedReleaseDateUnknownPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get releaseDateUnknownReasonArgs(): TextareaArgs {
    return {
      id: 'release-date-unknown-reason',
      name: 'release-date-unknown-reason',
      label: {},
      value: this.presenter.fields.releaseDateUnknownReason,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.releaseDateUnknownReason.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/expectedReleaseDateUnknown',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        releaseDateUnknownReasonArgs: this.releaseDateUnknownReasonArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
