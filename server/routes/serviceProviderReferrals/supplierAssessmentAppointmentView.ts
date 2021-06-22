import { BackLinkArgs, SummaryListArgs } from '../../utils/govukFrontendTypes'
import ViewUtils from '../../utils/viewUtils'
import SupplierAssessmentAppointmentPresenter from './supplierAssessmentAppointmentPresenter'

export default class SupplierAssessmentAppointmentView {
  constructor(private readonly presenter: SupplierAssessmentAppointmentPresenter) {}

  private get summaryListArgs(): SummaryListArgs {
    const args = ViewUtils.summaryListArgs(this.presenter.summary)

    if (this.presenter.actionLink !== null) {
      args.rows.push({
        key: { text: 'Action' },
        value: {
          html: `<a href="${ViewUtils.escape(this.presenter.actionLink.href)}">${ViewUtils.escape(
            this.presenter.actionLink.text
          )}</a>`,
        },
      })
    }

    return args
  }

  private get backLinkArgs(): BackLinkArgs {
    return {
      text: 'Back',
      href: this.presenter.backLinkHref,
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/supplierAssessmentAppointment',
      {
        presenter: this.presenter,
        summaryListArgs: this.summaryListArgs,
        backLinkArgs: this.backLinkArgs,
      },
    ]
  }
}
