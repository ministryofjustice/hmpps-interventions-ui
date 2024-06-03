import ViewUtils from '../../../../utils/viewUtils'
import { TextareaArgs } from '../../../../utils/govukFrontendTypes'
import ExpectedProbationOfficeUnknownPresenter from './expectedProbationOfficeUnknownPresenter'

export default class ExpectedProbationOfficeUnknownView {
  constructor(private readonly presenter: ExpectedProbationOfficeUnknownPresenter) {}

  private readonly errorSummaryArgs = ViewUtils.govukErrorSummaryArgs(this.presenter.errorSummary)

  private get probationOfficeUnknownReasonArgs(): TextareaArgs {
    return {
      id: 'probation-office-unknown-reason',
      name: 'probation-office-unknown-reason',
      label: {},
      value: this.presenter.fields.probationOfficeUnknownReason,
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.probationOfficeUnknownReason.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/expectedProbationOfficeUnknown',
      {
        presenter: this.presenter,
        errorSummaryArgs: this.errorSummaryArgs,
        probationOfficeUnknownReasonArgs: this.probationOfficeUnknownReasonArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
        suppressServiceUserBanner: true,
      },
    ]
  }
}
