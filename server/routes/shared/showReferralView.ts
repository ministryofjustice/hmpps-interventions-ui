import ShowReferralPresenter from './showReferralPresenter'
import ViewUtils from '../../utils/viewUtils'
import {InputArgs, NotificationBannerArgs, SummaryListArgs, TagArgs} from '../../utils/govukFrontendTypes'
import RoshPanelView from './roshPanelView'
import ArnRiskSummaryView from '../makeAReferral/risk-information/oasys/arnRiskSummaryView'
import DateUtils from "../../utils/dateUtils";

interface ServiceCategorySection {
  name: string
  summaryListArgs: (tagMacro: (args: TagArgs) => string) => SummaryListArgs
}

export default class ShowReferralView {
  supplementaryRiskInformationView: ArnRiskSummaryView

  constructor(private readonly presenter: ShowReferralPresenter) {
    this.supplementaryRiskInformationView = new ArnRiskSummaryView(presenter.riskSummary, presenter.riskInformation)
  }

  private readonly roshPanelView = new RoshPanelView(this.presenter.roshPanelPresenter, this.presenter.userType)

  private readonly probationPractitionerSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.probationPractitionerDetails
  )

  private readonly responsibleOfficerSummaryListArgs = ViewUtils.summaryListArgs(
    this.presenter.responsibleOfficersDetails
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

  private readonly insetTextArgs = {
    html: `${ViewUtils.escape(`You can amend the completion date on this referral.`)}<br>
          ${ViewUtils.escape(`This will send a notification to the service provider`)}`
  }

  get notificationBannerArgs(): NotificationBannerArgs {
      const html = `<b>Referral changes saved</b>
          <br>
          <p>
             The service provider has been notified of the changes to this referral.
          </p>
          <p>
              <a href= ${this.presenter.closeHref}> close</a>
          </p>`
    return {
      titleText: 'Success',
      html,
      classes: 'govuk-notification-banner--success',
    }
  }

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/referralDetails',
      {
        presenter: this.presenter,
        subNavArgs: this.presenter.referralOverviewPagePresenter.subNavArgs,
        probationPractitionerSummaryListArgs: this.probationPractitionerSummaryListArgs,
        responsibleOfficerSummaryListArgs: this.responsibleOfficerSummaryListArgs,
        interventionDetailsSummaryListArgs: this.interventionDetailsSummaryListArgs,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        serviceUserRisksSummaryListArgs: this.serviceUserRisksSummaryListArgs,
        serviceUserNeedsSummaryListArgs: this.serviceUserNeedsSummaryListArgs,
        serviceCategorySections: this.serviceCategorySections,
        emailInputArgs: this.emailInputArgs,
        backLinkArgs: this.backLinkArgs,
        roshAnalysisTableArgs: this.roshPanelView.roshAnalysisTableArgs.bind(this.roshPanelView),
        riskLevelDetailsArgs: this.roshPanelView.riskLevelDetailsArgs,
        supplementaryRiskInformation: this.supplementaryRiskInformationView.supplementaryRiskInformationArgs,
        insetTextArgs: this.insetTextArgs,
        notificationBannerArgs: this.notificationBannerArgs
      },
    ]
  }
}
