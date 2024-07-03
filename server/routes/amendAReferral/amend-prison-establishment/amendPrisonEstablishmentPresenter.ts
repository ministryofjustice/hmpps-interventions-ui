import PrisonAndSecuredChildAgency from '../../../models/prisonAndSecureChildAgency'
import SentReferral from '../../../models/sentReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'

export default class AmendPrisonEstablishmentPresenter {
  readonly backLinkUrl: string

  constructor(
    readonly referral: SentReferral,
    readonly prisonAndSecureChildAgency: PrisonAndSecuredChildAgency[] = [],
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${this.referral.id}/details`
  }

  readonly text = {
    title: `Update ${this.referral.referral.serviceUser.firstName} ${this.referral.referral.serviceUser.lastName}'s prison establishment`,
    reasonForChangeHeading: 'What is the reason for changing the prison?',
    submitLocationInput: {
      label: `What is the correct prison establishment for ${this.referral.referral.serviceUser?.firstName}?`,
      hint: `Start typing then choose prison name from the list.`,
      errorMessage: this.errorMessageForField('amend-prison-establishment'),
    },
    reasonForChangeErrorMessage: this.errorMessageForField('reason-for-change'),
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['prison-establishment'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    prisonEstablishment: this.utils.stringValue(
      this.referral.referral.personCustodyPrisonId,
      'amend-prison-establishment'
    ),
    reasonForChange: this.utils.stringValue(null, 'reason-for-change'),
  }
}
