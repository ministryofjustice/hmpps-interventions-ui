import DraftReferral from '../../models/draftReferral'
import ServiceCategory from '../../models/serviceCategory'
import { FormValidationError } from '../../utils/formValidationError'
import PresenterUtils from '../../utils/presenterUtils'

export default class UpdateServiceCategoriesPresenter {
  constructor(
    private readonly referral: DraftReferral,
    readonly serviceCategories: ServiceCategory[],
    private readonly error: FormValidationError | null = null
  ) {}

  readonly text = {
    title: `What service categories are you referring ${this.referral.serviceUser.firstName} to?`,
  }

  readonly errorMessage = PresenterUtils.errorMessage(this.error, 'service-category-ids')

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  hasSelectedServiceCategory(serviceCategoryId: string): boolean {
    return (this.referral.serviceCategoryIds || []).includes(serviceCategoryId)
  }
}
