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

  private readonly serviceUserDetailsSummaryListArgs = ViewUtils.summaryListArgsWithSummaryCard(
    this.presenter.serviceUserDetailsSection.summary,
    this.presenter.serviceUserDetailsSection.title
  )

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
        probationPractitionerDetailsSummaryListArgs: this.probationPractitionerDetailsSummaryListArgs,
        serviceUserDetailsSummaryListArgs: this.serviceUserDetailsSummaryListArgs,
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
