import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class CommunityAllocatedPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: DraftReferral,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/intervention/${referral.interventionId}/refer?`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `Does ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} have an allocated community probation practitioner?`,
    description: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    communityAllocated: {
      errorMessage: this.errorMessageForField('community-allocated'),
      allocated: `Yes`,
      notAllocated: `No`,
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
