import { Factory } from 'fishery'
import ChangelogDetail from '../../server/models/changelogDetail'
import sentReferralFactory from './sentReferral'

export default Factory.define<ChangelogDetail>(({ sequence }) => {
  const referral = sentReferralFactory.build()
  return {
    changelogId: sequence.toString(),
    referralId: referral.id,
    topic: 'COMPLEXITY_LEVEL',
    name: 'user',
    oldValue: ['wheelchair access'],
    newValue: ['hearing aid'],
    reasonForChange: 'Error at complexity change',
  }
})
