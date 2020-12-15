import { Factory } from 'fishery'
import { DraftReferral } from '../../server/services/interventionsService'
import serviceCategoryFactory from './serviceCategory'

class DraftReferralFactory extends Factory<DraftReferral> {
  justCreated() {
    return this
  }

  serviceCategorySelected(serviceCategoryId?: string) {
    const resolvedServiceCategoryId = serviceCategoryId ?? serviceCategoryFactory.build().id
    return this.params({ serviceCategoryId: resolvedServiceCategoryId })
  }

  completionDeadlineSet() {
    return this.params({ completionDeadline: '2021-08-24' })
  }
}

export default DraftReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  createdAt: new Date(Date.now()).toISOString(),
  completionDeadline: null,
  serviceCategoryId: null,
  complexityLevelId: null,
  furtherInformation: null,
  desiredOutcomesIds: null,
  additionalNeedsInformation: null,
  accessibilityNeeds: null,
  needsInterpreter: null,
  interpreterLanguage: null,
  hasAdditionalResponsibilities: null,
  whenUnavailable: null,
}))
