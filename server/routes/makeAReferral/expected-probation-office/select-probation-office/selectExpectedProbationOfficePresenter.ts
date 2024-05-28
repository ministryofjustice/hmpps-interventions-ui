import DeliusOfficeLocation from '../../../../models/deliusOfficeLocation'
import DraftReferral from '../../../../models/draftReferral'
import { FormValidationError } from '../../../../utils/formValidationError'
import PresenterUtils from '../../../../utils/presenterUtils'

export default class SelectExpectedProbationOfficePresenter {
  backLinkUrl: string

  readonly probationOfficeUnknownUrl: string

  constructor(
    private readonly referral: DraftReferral,
    readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly amendPPDetails: boolean = false,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {
    this.backLinkUrl = amendPPDetails
      ? `/referrals/${referral.id}/check-all-referral-information`
      : `/referrals/${referral.id}/expected-release-date`
    this.probationOfficeUnknownUrl = `/referrals/${referral.id}/expected-probation-office-unknown${
      this.amendPPDetails ? '?amendPPDetails=true' : ''
    }`
  }

  readonly text = {
    title: `Confirm ${this.referral.serviceUser.firstName} ${this.referral.serviceUser.lastName}'s expected probation office`,
    label: `${this.referral.serviceUser.firstName} ${this.referral.serviceUser.lastName} (CRN: ${this.referral.serviceUser.crn})`,
    inputHeading: 'Probation office',
    hint: `Start typing then choose probation office from the list`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'expected-probation-office')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    expectedProbationOffice: this.utils.stringValue(
      this.referral.expectedProbationOffice!,
      'expected-probation-office'
    ),
  }
}
