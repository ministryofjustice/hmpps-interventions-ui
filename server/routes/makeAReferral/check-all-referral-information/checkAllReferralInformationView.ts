import CheckAllReferralInformationPresenter from './checkAllReferralInformationPresenter'
import ViewUtils from '../../../utils/viewUtils'

export default class CheckAllReferralInformationView {
  constructor(private readonly presenter: CheckAllReferralInformationPresenter) {}

  private readonly probationPractitionerDetailsSummaryListArgs = this.presenter.probationPractitionerDetailSection
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.probationPractitionerDetailSection.summary,
        this.presenter.probationPractitionerDetailSection.title
      )
    : null

  private readonly mainPointOfContactDetailsSummaryListArgs = this.presenter.mainPointOfContactDetailsSection
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.mainPointOfContactDetailsSection.summary,
        this.presenter.mainPointOfContactDetailsSection.title
      )
    : null

  private readonly backUpContactDetailsSummaryListArgs = this.presenter.backupContactDetails
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.backupContactDetails.summary,
        this.presenter.backupContactDetails.title
      )
    : null

  private readonly expectedReleaseDateDetailsSummaryListArgs = this.presenter.currentLocationAndReleaseDetailsSection
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.currentLocationAndReleaseDetailsSection.summary,
        this.presenter.currentLocationAndReleaseDetailsSection.title
      )
    : null

  private readonly locationDetailsSummaryListArgs = this.presenter.locationSection
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.locationSection.summary,
        this.presenter.locationSection.title
      )
    : null

  private readonly communityLocationAndReleaseDetailsSummaryListArgs = this.presenter
    .communityCurrentLocationAndReleaseDetailsSection
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.communityCurrentLocationAndReleaseDetailsSection.summary,
        this.presenter.communityCurrentLocationAndReleaseDetailsSection.title
      )
    : null

  private readonly serviceUserDetailsSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.serviceUserDetailsSection.summary,
    this.presenter.serviceUserDetailsSection.title
  )

  private readonly lastKnownAddressAndContactDetailsSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.lastKnownAddressAndContactDetails.summary,
    this.presenter.lastKnownAddressAndContactDetails.title
  )

  private get identityDetailsSummaryListArgs() {
    return ViewUtils.summaryListArgsWithSummaryCard(this.presenter.identityDetails, 'Identity details', {
      showBorders: true,
      showTitle: true,
    })
  }

  private readonly needsAndRequirementsSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.needsAndRequirementsSection.summary,
    this.presenter.needsAndRequirementsSection.title
  )

  private readonly referralDetailsSections = this.presenter.referralDetailsSections.map(section => ({
    title: section.title,
    summaryListArgs: ViewUtils.summaryListArgsWithSummaryCard(section.summary, section.title),
  }))

  private readonly serviceCategoriesSummaryListArgs = this.presenter.serviceCategoriesSummary
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.serviceCategoriesSummary.summary,
        this.presenter.serviceCategoriesSummary.title
      )
    : null

  private readonly personalDetailsSummaryListArgs = this.presenter.personalDetailSummary
    ? ViewUtils.summaryListArgsWithSummaryCard(
        this.presenter.personalDetailSummary.summary,
        this.presenter.personalDetailSummary.title
      )
    : null

  private readonly sentenceInformationSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.sentenceInformationSummary.summary,
    this.presenter.sentenceInformationSummary.title
  )

  private readonly riskInformationSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.riskSection.summary,
    this.presenter.riskSection.title
  )

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'makeAReferral/checkAllReferralInformation',
      {
        presenter: this.presenter,
        identityDetailsSummaryListArgs: this.identityDetailsSummaryListArgs,
        probationPractitionerDetailsSummaryListArgs: this.probationPractitionerDetailsSummaryListArgs,
        mainPointOfContactDetailsSummaryListArgs: this.mainPointOfContactDetailsSummaryListArgs,
        expectedReleaseDateDetailsSummaryListArgs: this.expectedReleaseDateDetailsSummaryListArgs,
        locationDetailsSummaryListArgs: this.locationDetailsSummaryListArgs,
        communityLocationAndReleaseDetailsSummaryListArgs: this.communityLocationAndReleaseDetailsSummaryListArgs,
        backUpContactDetailsSummaryListArgs: this.backUpContactDetailsSummaryListArgs,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
        lastKnownAddressAndContactDetailsSummaryListArgs: this.lastKnownAddressAndContactDetailsSummaryListArgs,
        personalDetailsSummaryListArgs: this.personalDetailsSummaryListArgs,
        needsAndRequirementsSummaryListArgs: this.needsAndRequirementsSummaryListArgs,
        referralDetailsSections: this.referralDetailsSections,
        serviceCategoriesSummaryListArgs: this.serviceCategoriesSummaryListArgs,
        sentenceInformationSummaryListArgs: this.sentenceInformationSummaryListArgs,
        riskInformationSummaryListArgs: this.riskInformationSummaryListArgs,
        backLinkArgs: { href: this.presenter.backLinkUrl },
      },
    ]
  }
}
