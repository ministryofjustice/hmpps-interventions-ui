import ViewUtils from '../../utils/viewUtils'
import CheckAssignmentPresenter from './checkAssignmentPresenter'

export default class CheckAssignmentView {
  constructor(private readonly presenter: CheckAssignmentPresenter) {}

  private summaryListArgs = ViewUtils.summaryListArgs(this.presenter.summary)

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/checkAssignment',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
      },
    ]
  }
}
