import { Factory } from 'fishery'
import ReferralDetails from '../../server/models/referralDetails'

class ReferralDetailsFactory extends Factory<ReferralDetails> {}

export default ReferralDetailsFactory.define(({ sequence }) => ({
  referralId: sequence.toString(),
  completionDeadline: '2022-06-06',
  maximumEnforceableDays: 15,
  furtherInformation: 'this person has 3 children at home',
}))
