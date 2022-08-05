import { Factory } from 'fishery'
import Changelog from '../../server/models/changelog'
import sentReferralFactory from './sentReferral'

export default Factory.define<Changelog>(({ sequence }) => {
  const referral = sentReferralFactory.build()
  return {
    changelogId: sequence.toString(),
    referralId: referral.id,
    topic: 'COMPLEXITY_LEVEL',
    changedAt: '2022-07-27 09:08:58.434013+00',
    name: 'user',
    reasonForChange: 'Error at complexity change',
  }
})
