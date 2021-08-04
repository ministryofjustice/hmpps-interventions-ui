import { Factory } from 'fishery'
import DraftCancellationData from '../../server/routes/probationPractitionerReferrals/draftCancellationData'

class DraftCancellationDataFactory extends Factory<DraftCancellationData> {}

export default DraftCancellationDataFactory.define(() => ({
  cancellationReason: null,
  cancellationComments: null,
}))
