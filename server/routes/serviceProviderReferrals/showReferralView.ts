import ShowReferralPresenter from './showReferralPresenter'
import ViewUtils from '../../utils/viewUtils'
import { InputArgs } from '../../utils/govukFrontendTypes'

export default class ShowReferralView {
  constructor(private readonly presenter: ShowReferralPresenter) {}

  private readonly probationPractitionerSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.probationPractitionerDetails
  )

  private readonly interventionDetailsSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.interventionDetails)

  private readonly serviceUserDetailsSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.serviceUserDetails)

  private readonly serviceUserRisksSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.serviceUserRisks)

  private readonly serviceUserNeedsSummaryListArgs = ViewUtils.summaryListArgs(this.presenter.serviceUserNeeds)

  private get emailInputArgs(): InputArgs {
    return {
      id: 'email',
      name: 'email',
      label: {
        text: 'Please enter the email address of the caseworker',
      },
      errorMessage: ViewUtils.govukErrorMessage(this.presenter.text.errorMessage),
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'serviceProviderReferrals/showReferral',
      {
        presenter: this.presenter,
        probationPractitionerSummaryListArgs: this.probationPractitionerSummaryListArgs,
        serviceUserNotificationBannerArgs: this.presenter.serviceUserNotificationBannerArgs,
        interventionDetailsSummaryListArgs: this.interventionDetailsSummaryListArgs,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        serviceUserRisksSummaryListArgs: this.serviceUserRisksSummaryListArgs,
        serviceUserNeedsSummaryListArgs: this.serviceUserNeedsSummaryListArgs,
        emailInputArgs: this.emailInputArgs,
      },
    ]
  }
}
