import { Factory } from 'fishery'
import DraftWithdrawalData from '../../server/routes/referral/withdrawal/draftWithdrawalData'

class DraftWithdrawalDataFactory extends Factory<DraftWithdrawalData> {}

export default DraftWithdrawalDataFactory.define(() => ({
  withdrawalReason: null,
  withdrawalComments: null,
  withdrawalState: null,
}))
