import { Factory } from 'fishery'
import { DraftReferral } from '../../server/services/interventionsService'

class DraftReferralFactory extends Factory<DraftReferral> {
  justCreated() {
    return this
  }

  serviceCategorySelected(serviceCategoryId: string) {
    return this.params({ serviceCategoryId })
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
}))
