import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class CommunityAllocatedPresenter {
  readonly backLinkUrl: string

  readonly caseIdentifierPage = `/intervention/${this.referral.interventionId}/refer?`

  readonly draftTabPage = `/probation-practitioner/dashboard/draft-cases`

  constructor(
    readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    readonly startReferral: boolean = false
  ) {
    this.backLinkUrl = startReferral ? this.caseIdentifierPage : this.draftTabPage
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `Does ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} have an allocated probation practitioner?`,
    description: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    communityAllocated: {
      errorMessage: this.errorMessageForField('community-allocated'),
      allocated: `Yes - ${this.referral.serviceUser?.firstName} has an allocated probation practitioner (community offender manager) on nDelius`,
      notAllocated: `No - ${this.referral.serviceUser?.firstName} does not have an allocated probation practitioner (community offender manager) on nDelius`,
    },
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['community-allocated'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    communityAllocated: this.utils.booleanValue(this.referral.allocatedCommunityPP, 'community-allocated'),
  }
}
