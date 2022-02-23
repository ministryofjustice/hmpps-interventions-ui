import ActionPlan, { Activity } from '../../../models/actionPlan'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'
import utils from '../../../utils/utils'
import ServiceCategory from '../../../models/serviceCategory'
import ApprovedActionPlanSummary from '../../../models/approvedActionPlanSummary'
import dateUtils from '../../../utils/dateUtils'
import config from '../../../config'

export default class ActionPlanPresenter {
  actionPlanSummaryPresenter: ActionPlanSummaryPresenter

  constructor(
    private readonly referral: SentReferral,
    private readonly actionPlan: ActionPlan,
    private readonly serviceCategories: ServiceCategory[],
    readonly userType: 'service-provider' | 'probation-practitioner',
    private readonly validationError: FormValidationError | null = null,
    private readonly approvedActionPlanSummaries: ApprovedActionPlanSummary[] = []
  ) {
    this.actionPlanSummaryPresenter = new ActionPlanSummaryPresenter(actionPlan, userType)
  }

  readonly text = {
    actionPlanNumberOfSessions: this.actionPlan?.numberOfSessions,
    spEmailAddress: this.actionPlan?.submittedBy?.username?.toLowerCase(),
  }

  readonly interventionProgressURL = `/${this.userType}/referrals/${this.referral.id}/progress`

  readonly actionPlanApprovalUrl = `/probation-practitioner/referrals/${this.referral.id}/action-plan/approve`

  readonly actionPlanEditConfirmationUrl = `/service-provider/referrals/${this.referral.id}/action-plan/edit`

  readonly viewProbationPractitionerLatestActionPlanURL = `/probation-practitioner/referrals/${this.referral.id}/action-plan`

  readonly errorSummary = PresenterUtils.errorSummary(this.validationError)

  readonly fieldErrors = {
    confirmApproval: PresenterUtils.errorMessage(this.validationError, 'confirm-approval'),
  }

  private readonly desiredOutcomesIds = this.referral.referral.desiredOutcomes.flatMap(
    desiredOutcome => desiredOutcome.desiredOutcomesIds
  )

  readonly desiredOutcomesByServiceCategory = this.serviceCategories.map(serviceCategory => {
    const desiredOutcomesForServiceCategory = serviceCategory.desiredOutcomes.filter(desiredOutcome =>
      this.desiredOutcomesIds.includes(desiredOutcome.id)
    )

    return {
      serviceCategory: utils.convertToProperCase(serviceCategory.name),
      desiredOutcomes: desiredOutcomesForServiceCategory.map(desiredOutcome => desiredOutcome.description),
    }
  })

  get orderedActivities(): Activity[] {
    return this.actionPlan?.activities?.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)) || []
  }

  get showApprovalForm(): boolean {
    return this.userType === 'probation-practitioner' && this.actionPlanSummaryPresenter.actionPlanUnderReview
  }

  get probationPractitionerBlockedFromViewing(): boolean {
    // probation practitioners can only view submitted action plans
    return this.userType === 'probation-practitioner' && !this.actionPlanSummaryPresenter.actionPlanSubmitted
  }

  get actionPlanVersions(): { approvalDate: string; versionNumber: number; href: string | null }[] {
    return this.approvedActionPlanSummaries
      .sort((summaryA, summaryB) => new Date(summaryB.approvedAt).getTime() - new Date(summaryA.approvedAt).getTime())
      .map((summary, index) => ({
        versionNumber: this.approvedActionPlanSummaries.length - index,
        approvalDate: dateUtils.formattedDate(summary.approvedAt, { month: 'short' }),
        href: this.determineActionPlanHref(summary.id),
      }))
  }

  get showActionPlanVersions(): boolean {
    return this.userType === 'probation-practitioner' && this.actionPlanVersions.length > 0
  }

  private determineActionPlanHref(summaryId: string): string | null {
    const isCurrentlyViewedActionPlan = summaryId === this.actionPlan.id
    const isLatestActionPlan = summaryId === this.referral.actionPlanId

    if (isCurrentlyViewedActionPlan) {
      return null
    }

    if (isLatestActionPlan) {
      return this.viewProbationPractitionerLatestActionPlanURL
    }

    return `/probation-practitioner/action-plan/${summaryId}`
  }

  get showPreviousActionPlanNotificationBanner(): boolean {
    return this.userType === 'probation-practitioner' && this.actionPlan.id !== this.referral.actionPlanId
  }

  get showEditButton(): boolean {
    return this.userType === 'service-provider' && this.actionPlanSummaryPresenter.actionPlanUnderReview
  }

  get showCreateNewActionPlanVersionButton(): boolean {
    if (config.features.previouslyApprovedActionPlans) {
      return this.userType === 'service-provider' && this.actionPlanSummaryPresenter.actionPlanApproved
    }

    return false
  }
}
