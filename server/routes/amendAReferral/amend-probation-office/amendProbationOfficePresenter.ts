import SentReferral from '../../../models/sentReferral'
import PresenterUtils from '../../../utils/presenterUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import DeliusOfficeLocation from '../../../models/deliusOfficeLocation'

export default class AmendProbationOfficePresenter {
  backLinkUrl: string

  constructor(
    private readonly sentReferral: SentReferral,
    readonly deliusOfficeLocations: DeliusOfficeLocation[],
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null,
    private readonly probationOfficeType: string | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${sentReferral.id}/details`
  }

  readonly text = {
    title: `Update probation office`,
    label: `${this.sentReferral.referral.serviceUser.firstName} ${this.sentReferral.referral.serviceUser.lastName} (CRN: ${this.sentReferral.referral.serviceUser.crn})`,
    inputHeading: 'Probation office',
    hint: `Start typing then choose probation office from the list`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'probation-office')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    probationOffice: this.utils.stringValue(
      this.probationOfficeType === 'expectedProbationOffice'
        ? this.sentReferral.referral.expectedProbationOffice!
        : this.sentReferral.referral.ppProbationOffice,
      'probation-office'
    ),
  }
}
