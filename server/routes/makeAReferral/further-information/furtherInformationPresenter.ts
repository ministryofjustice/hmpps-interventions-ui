import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import Intervention from '../../../models/intervention'
import utils from '../../../utils/utils'

export default class FurtherInformationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null
  ) {}

  readonly title = `Do you have further information for the ${utils.convertToProperCase(
    this.intervention.contractType.name
  )} referral service provider? (optional)`

  readonly label = `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`

  readonly hint =
    'For example, relevant previous offences, previously completed programmes or further reasons for this referral'

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'further-information')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  get value(): string {
    if (this.userInputData !== null) {
      return this.userInputData['further-information'] ?? ''
    }

    if (this.referral.furtherInformation) {
      return this.referral.furtherInformation
    }

    return ''
  }
}
