import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import SentReferral from '../../../models/sentReferral'
import AmendAdditionalInformationForm from './amendAdditionalInformationForm'

export default class AmendAdditionalInformationPresenter {
  fields: Record<string, unknown>

  private readonly utils = new PresenterUtils(this.userInputData)

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly additionalInformation: string,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null,
    readonly showNoChangesBanner: boolean = false
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${sentReferral.id}/details`
    this.fields = {
      additionalInformation: this.utils.stringValue(null, AmendAdditionalInformationForm.additionalInformationId),
      reasonForChange: this.utils.stringValue(null, AmendAdditionalInformationForm.reasonForChangeId),
    }
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'additional-information-id')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  readonly title = `Change additional information about ${this.sentReferral.referral.serviceUser.firstName}'s needs (optional)`

  readonly reasonForChangeTitle = `What's the reason for changing the additional information?`

  readonly reasonForChangeHintText = 'For example, the additional information needs to be updated'

  readonly additionalInformationField = this.sentReferral.referral.additionalNeedsInformation
}
