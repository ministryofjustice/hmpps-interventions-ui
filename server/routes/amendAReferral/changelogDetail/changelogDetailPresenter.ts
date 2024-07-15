import moment from 'moment-timezone'
import ChangelogDetail from '../../../models/changelogDetail'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class ChangelogDetailPresenter {
  constructor(
    private readonly error: FormValidationError | null = null,
    readonly changelogDetail: ChangelogDetail,
    private sentReferral: SentReferral,
    private deliusServiceUser: DeliusServiceUser,
    readonly prisonAndSecuredChildAgency: PrisonAndSecuredChildAgency[],
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
      case 'REASON_FOR_REFERRAL':
        return 'Reason for this referral and further information has changed'
      case 'PRISON_ESTABLISHMENT':
        return `${this.deliusServiceUser.name.forename} ${this.deliusServiceUser.name.surname}'s prison establishment has changed`
      case 'EXPECTED_RELEASE_DATE':
        return this.determineExpectedReleaseDateHeading
      case 'EXPECTED_PROBATION_OFFICE':
        return 'Expected probation office has changed'
      case 'PROBATION_PRACTITIONER_PROBATION_OFFICE':
        return 'Probation practitioner probation office has changed'
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
      case 'PRISON_ESTABLISHMENT':
        return 'Reason why the prison establishment has changed'
      default:
        return ''
    }
  }

  private get determineExpectedReleaseDateHeading(): string {
    const oldValue = moment(this.changelogDetail.oldValue[0])
    const newValue = moment(this.changelogDetail.newValue[0])

    if (oldValue.isValid() && newValue.isValid()) {
      return `${this.deliusServiceUser.name.forename} ${this.deliusServiceUser.name.surname}'s expected release date has changed`
    }
    if (!oldValue.isValid() && newValue.isValid()) {
      return `${this.deliusServiceUser.name.forename} ${this.deliusServiceUser.name.surname}'s expected release date information has been added`
    }
    return `${this.deliusServiceUser.name.forename} ${this.deliusServiceUser.name.surname}'s expected release date information has changed`
  }
}
