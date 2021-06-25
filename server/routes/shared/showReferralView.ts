import ShowReferralPresenter from './showReferralPresenter'
import ViewUtils from '../../utils/viewUtils'
import { InputArgs, SummaryListArgs, TagArgs } from '../../utils/govukFrontendTypes'
import RiskView from './riskView'

interface ServiceCategorySection {
  name: string
  summaryListArgs: (tagMacro: (args: TagArgs) => string) => SummaryListArgs
}

export default class ShowReferralView {
  constructor(private readonly presenter: ShowReferralPresenter) {}

  private readonly riskView = new RiskView(this.presenter.riskPresenter, this.presenter.userType)

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

  private get serviceCategorySections(): ServiceCategorySection[] {
    return this.presenter.referralServiceCategories.map(serviceCategory => {
      return {
        name: serviceCategory.name,
        summaryListArgs: (tagMacro: (args: TagArgs) => string) => {
          return ViewUtils.summaryListArgs(this.presenter.serviceCategorySection(serviceCategory, tagMacro))
        },
      }
    })
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.referralOverviewPagePresenter.dashboardURL,
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/referralDetails',
      {
        presenter: this.presenter,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        probationPractitionerSummaryListArgs: this.probationPractitionerSummaryListArgs,
        interventionDetailsSummaryListArgs: this.interventionDetailsSummaryListArgs,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        serviceUserRisksSummaryListArgs: this.serviceUserRisksSummaryListArgs,
        serviceUserNeedsSummaryListArgs: this.serviceUserNeedsSummaryListArgs,
        serviceCategorySections: this.serviceCategorySections,
        emailInputArgs: this.emailInputArgs,
        backLinkArgs: this.backLinkArgs,
        roshAnalysisTableArgs: this.riskView.roshAnalysisTableArgs.bind(this.riskView),
        riskLevelDetailsArgs: this.riskView.riskLevelDetailsArgs,
        furtherRiskInformation: this.riskView.furtherRiskInformation,
      },
    ]
  }
}
