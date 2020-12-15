import { Factory } from 'fishery'
import { DraftReferral } from '../../server/services/interventionsService'
import serviceCategoryFactory from './serviceCategory'

class DraftReferralFactory extends Factory<DraftReferral> {
  justCreated() {
    return this
  }

  serviceCategorySelected() {
    return this.params({ serviceCategory: serviceCategoryFactory.build() })
  }

  completionDeadlineSet() {
    return this.params({ completionDeadline: '2021-08-24' })
  }
}

export default DraftReferralFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  completionDeadline: null,
  serviceCategory: null,
  complexityLevelId: null,
}))
