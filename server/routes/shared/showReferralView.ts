import ShowReferralPresenter from './showReferralPresenter'
import ViewUtils from '../../utils/viewUtils'
import { InputArgs, NotificationBannerArgs, SummaryListArgs, TagArgs } from '../../utils/govukFrontendTypes'
import RoshPanelView from './roshPanelView'
import ArnRiskSummaryView from '../makeAReferral/risk-information/oasys/arnRiskSummaryView'
import utils from '../../utils/utils'

interface SectionWithTagArgs {
  name: string
  summaryListArgs: (tagMacro: (args: TagArgs) => string) => SummaryListArgs
}

export default class ShowReferralView {
  supplementaryRiskInformationView: ArnRiskSummaryView

  constructor(private readonly presenter: ShowReferralPresenter) {
    this.supplementaryRiskInformationView = new ArnRiskSummaryView(presenter.riskSummary, presenter.riskInformation)
  }

  private readonly roshPanelView = new RoshPanelView(this.presenter.roshPanelPresenter, this.presenter.userType)

  private get probationPractitionerSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.probationPractitionerDetails,
      this.presenter.probationPractitionerDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private readonly responsibleOfficerSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.responsibleOfficersDetails,
    this.presenter.responsibleOfficerDetailsHeading,
    { showBorders: true, showTitle: true }
  )

  private get interventionDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.interventionDetails,
      this.presenter.interventionDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get contactDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.contactDetailsSummary,
      this.presenter.contactDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get serviceUserDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.personalDetailSummary,
      this.presenter.serviceUserDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get serviceUserLocationDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(
      this.presenter.serviceUserLocationDetails,
      this.presenter.serviceUserLocationDetailsHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get riskInformationArgs() {
    return ViewUtils.summaryListArgsForRiskInfo(
      this.presenter.supplementaryRiskInformationView.supplementaryRiskInformationArgs,
      this.presenter.riskInformationHeading,
      { showBorders: true, showTitle: true }
    )
  }

  private get roshInformationArgs() {
    return this.roshPanelView.summaryListArgsWithSummaryCardForRoshInfo(this.presenter.roshInformationHeading, {
      showBorders: true,
      showTitle: true,
    })
  }

  private readonly serviceUserRisksSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.serviceUserRisks,
    this.presenter.riskInformationHeading,
    { showBorders: true, showTitle: true }
  )

  private readonly serviceUserNeedsSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.serviceUserNeeds,
    this.presenter.serviceUserNeedsHeading,
    { showBorders: true, showTitle: true }
  )

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

  private get serviceCategorySections(): SectionWithTagArgs[] {
    return this.presenter.referralServiceCategories.map(serviceCategory => {
      return {
        name: serviceCategory.name,
        summaryListArgs: (tagMacro: (args: TagArgs) => string) => {
          return ViewUtils.summaryListArgsWithSummaryCard(
            this.presenter.serviceCategorySection(serviceCategory, tagMacro),
            `${utils.convertToProperCase(serviceCategory.name)} service`,
            { showBorders: true, showTitle: true }
          )
        },
      }
    })
  }

  private readonly backLinkArgs = {
    text: 'Back',
    href: this.presenter.referralOverviewPagePresenter.dashboardURL,
  }

  private readonly insetTextArgs =
    this.presenter.userType === 'probation-practitioner'
      ? {
          html:
            'You can change some of these referral details.  What you can change will depend on how much progress has been made on the referral.<br/>' +
            'When you make a change it will send a notification to the service provider.',
        }
      : null

  get notificationBannerArgs(): NotificationBannerArgs | null {
    const html = `<strong>Referral changes saved</strong>
          <hr class="govuk-section-break govuk-section-break--s">
          <p>
          The service provider has been notified about the change to this referral. If there are details of a responsible officer, a notification will also be sent to them.
          </p>
          <p>
              <a href= ${this.presenter.closeHref}>Close</a>
          </p>`
    return this.presenter.showSuccess
      ? {
          titleText: 'Success',
          html,
          classes: 'govuk-notification-banner--success',
        }
      : null
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
        serviceUserLocationDetailsSummaryListArgs: this.serviceUserLocationDetailsSummaryListArgs,
        serviceUserRisksSummaryListArgs: this.serviceUserRisksSummaryListArgs,
        serviceUserNeedsSummaryListArgs: this.serviceUserNeedsSummaryListArgs,
        contactDetailsSummaryListArgs: this.contactDetailsSummaryListArgs,
        serviceCategorySections: this.serviceCategorySections,
        emailInputArgs: this.emailInputArgs,
        backLinkArgs: this.backLinkArgs,
        roshInformationArgs: this.roshInformationArgs,
        supplementaryRiskInformation: this.supplementaryRiskInformationView.supplementaryRiskInformationArgs,
        riskInformationArgs: this.riskInformationArgs,
        insetTextArgs: this.insetTextArgs,
        notificationBannerArgs: this.notificationBannerArgs,
      },
    ]
  }
}
