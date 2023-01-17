import DraftReferral from '../../../models/draftReferral'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import Prison from '../../../models/prisonRegister/prison'

export default class CurrentLocationPresenter {
  constructor(
    private readonly referral: DraftReferral,
    readonly prisons: Prison[],
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {}

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    title: `Submit ${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName}’s current location`,
    description: `This enables the service provider to prioritise the intervention and allocate it to the right caseworker.`,
    currentLocation: {
      label: `Where is ${this.referral.serviceUser?.firstName} today?`,
      errorMessage: this.errorMessageForField('current-location'),
      custodyLabel: `Custody (select even if ${this.referral.serviceUser?.firstName} is due to be released today)`,
      communityLabel: `Community`,
    },
    submitLocationInput: {
      label: `Which establishment is ${this.referral.serviceUser?.firstName} in?`,
      hint: `Start typing, then choose from the list.`,
      errorMessage: this.errorMessageForField('prison-select'),
    },
    warningText: `If ${this.referral.serviceUser?.firstName}'s location changes, you will need to make direct contact with the service provider.`,
  }

  readonly errorSummary = PresenterUtils.errorSummary(this.error, {
    fieldOrder: ['current-location', 'prison-select'],
  })

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly fields = {
    currentLocation: this.utils.stringValue(this.referral.personCurrentLocationType, 'current-location'),
    prisonId: this.utils.stringValue(this.referral.personCustodyPrisonId, 'prison-id'),
  }
}
