import ChangelogDetail from '../../../models/changelogDetail'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ChangelogDetailPresenter {
  constructor(
    private readonly error: FormValidationError | null = null,
    readonly changelogDetail: ChangelogDetail,
    private sentReferral: SentReferral,
    public loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {}

  readonly backUrl = `/probation-practitioner/referrals/${this.sentReferral.id}/changelog`

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
        return 'Completion days was changed'
      case 'NEEDS_AND_REQUIREMENTS_ACCESSIBILITY_NEEDS':
        return 'Mobility, disability or accessibility needs were changed'
      case 'NEEDS_AND_REQUIREMENTS_ADDITIONAL_INFORMATION':
        return `Additional information about ${this.sentReferral.referral.serviceUser.firstName}'s needs was changed`
      case 'NEEDS_AND_REQUIREMENTS_INTERPRETER_REQUIRED':
        return 'Need for an interpreter was changed'
      case 'NEEDS_AND_REQUIREMENTS_HAS_ADDITIONAL_RESPONSIBILITIES':
        return 'Caring or employment responsibilites were changed'
      default:
        return ''
    }
  }
}
