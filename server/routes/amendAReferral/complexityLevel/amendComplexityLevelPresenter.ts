import ServiceCategory from '../../../models/serviceCategory'
import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import ReferralComplexityLevel from '../../../models/referralComplexityLevel'
import AmendMaximumEnforceableDaysForm from '../maximumEnforceableDays/amendMaximumEnforceableDaysForm'
import SentReferral from '../../../models/sentReferral'

export default class AmendComplexityLevelPresenter {
  fields: Record<string, unknown>
  private formError: FormValidationError | null

  private readonly utils = new PresenterUtils(this.userInputData)

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly complexityLevels: ReferralComplexityLevel[],
    private readonly serviceCategory: ServiceCategory,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, unknown> | null = null
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${sentReferral.id}/details`
    this.formError = error
    this.fields = {
      reasonForChange: this.utils.stringValue(null, AmendMaximumEnforceableDaysForm.reasonForChangeId),
    }
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'complexity-level-id')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  readonly complexityDescriptions: {
    title: string
    value: string
    hint: string
    checked: boolean
  }[] = this.serviceCategory.complexityLevels.map(complexityLevel => {
    return {
      title: complexityLevel.title,
      value: complexityLevel.id,
      hint: complexityLevel.description,
      checked: this.selectedComplexityLevelId === complexityLevel.id,
    }
  })

  private get selectedComplexityLevelId() {
    if (this.userInputData) {
      return this.userInputData['complexity-level-id']
    }

    return (
      this.complexityLevels?.find(val => val.serviceCategoryId === this.serviceCategory.id)?.complexityLevelId ?? null
    )
  }

  readonly title = `What's the new complexity level for ${this.serviceCategory.name}?`

  readonly reasonForChangeTitle = `What's the reason for changing the complexity level?`
}
