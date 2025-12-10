import SentReferral from '../../../models/sentReferral'
import ServiceCategory from '../../../models/serviceCategory'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import utils from '../../../utils/utils'
import AmendDesiredOutcomesForm from './amendDesiredOutcomesForm'

export default class AmendDesiredOutcomesPresenter {
  private formError: FormValidationError | null

  constructor(
    private readonly referral: SentReferral,
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string[]> | null = null,
    readonly showNoChangesBanner: boolean = false
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${referral.id}/details`
    this.formError = error
    this.fields = {
      reasonForChange: this.utils.stringValue(null, AmendDesiredOutcomesForm.reasonForChangeId),
    }
  }

  private readonly utils = new PresenterUtils(this.userInputData)

  readonly outcomesErrorMessage = PresenterUtils.errorMessage(this.error, AmendDesiredOutcomesForm.desiredOutcomesId)

  readonly reasonForChangeErrorMessage = PresenterUtils.errorMessage(
    this.error,
    AmendDesiredOutcomesForm.reasonForChangeId
  )

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  readonly outcomesTitle = `What are the desired outcomes for ${utils.convertToProperCase(this.serviceCategory.name)}?`

  readonly reasonTitle = 'What is the reason for changing the desired outcomes?'

  fields: Record<string, unknown>

  readonly desiredOutcomes: {
    value: string
    text: string
    checked: boolean
  }[] = this.serviceCategory.desiredOutcomes.map(desiredOutcome => {
    return {
      value: desiredOutcome.id,
      text: desiredOutcome.description,
      checked: this.selectedDesiredOutcomeIds.includes(desiredOutcome.id),
    }
  })

  private get selectedDesiredOutcomeIds(): string[] {
    if (this.userInputData) {
      return this.userInputData[AmendDesiredOutcomesForm.desiredOutcomesId] ?? []
    }

    return (
      this.referral.referral.desiredOutcomes?.find(val => val.serviceCategoryId === this.serviceCategory.id)
        ?.desiredOutcomesIds ?? []
    )
  }
}
