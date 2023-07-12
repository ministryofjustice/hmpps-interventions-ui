import ChangelogDetail from '../../../models/changelogDetail'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ChangelogDetailPresenter {
  constructor(
    private readonly error: FormValidationError | null = null,
    readonly changelogDetail: ChangelogDetail,
    private sentReferral: SentReferral,
    private deliusServiceUser: DeliusServiceUser,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly backUrl = `/${this.loggedInUserType}/referrals/${this.sentReferral.id}/changelog`

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get renderTitle(): string {
    switch (this.changelogDetail.topic) {
      case 'COMPLEXITY_LEVEL':
        return 'Complexity level was changed'
      case 'DESIRED_OUTCOMES':
        return 'Desired outcomes was changed'
      case 'MAXIMUM_ENFORCEABLE_DAYS':
        return 'Enforceable days was changed'
      case 'COMPLETION_DATETIME':
        return 'Completion date was changed'
      case 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS':
        return 'Mobility, disability or accessibility needs were changed'
      case 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION':
        return `Additional information about ${this.deliusServiceUser.name.forename}'s needs was changed`
      case 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED':
        return 'Need for an interpreter was changed'
      case 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES':
        return 'Caring or employment responsibilites were changed'
      default:
        return ''
    }
  }

  get renderReason(): string {
    switch (this.changelogDetail.topic) {
      case 'COMPLEXITY_LEVEL':
        return 'Reason for changing the complexity level'
      case 'DESIRED_OUTCOMES':
        return 'Reason for changing the desired outcomes'
      case 'MAXIMUM_ENFORCEABLE_DAYS':
        return 'Reason for changing the maximum number of days'
      case 'COMPLETION_DATETIME':
        return 'Reason for changing the completion date'
      case 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS':
        return 'Reason for changing the mobility, disability or accessibility needs'
      case 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION':
        return `Reason for changing the additional information`
      case 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED':
        return `Reason for changing whether ${this.deliusServiceUser.name.forename} needs an interpreter`
      case 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES':
        return `Reason for changing whether ${this.deliusServiceUser.name.forename}'s caring or employment responsibilities`
      default:
        return ''
    }
  }
}
