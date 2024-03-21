import DraftReferral from '../../../models/draftReferral'
import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class CurrentLocationPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: DraftReferral,
    readonly prisonAndSecureChildAgency: PrisonAndSecuredChildAgency[],
    private readonly prisonName: string,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/referrals/${referral.id}/form`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `Confirm ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName}’s current location`,
    subTitle: `Is ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} in ${this.prisonName}?`,
    label: `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`,
    submitLocationInput: {
      label: `Which establishment is ${this.referral.serviceUser?.firstName} in?`,
      hint: `Start typing prison name, then choose from the list.`,
      errorMessage: this.errorMessageForField('prison-select'),
    },
    warningText: `If ${this.referral.serviceUser?.firstName}'s location changes, you will need to make direct contact with the service provider.`,
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['prison-select'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    prisonId: this.utils.stringValue(this.referral.personCustodyPrisonId, 'prison-id'),
    alreadyKnowPrisonName: this.referral.alreadyKnowPrisonName,
  }

  get isPrisonDetailsPresent(): boolean {
    return this.prisonName !== ''
  }
}
