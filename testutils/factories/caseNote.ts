import { Factory } from 'fishery'
import { CaseNote } from '../../server/models/caseNote'
import sentReferralFactory from './sentReferral'

export default Factory.define<CaseNote>(({ sequence }) => ({
  id: sequence.toString(),
  referralId: sentReferralFactory.build().id,
  subject: 'Case note subject',
  body: 'Case note body text',
  sentBy: {
    username: 'BERNARD.BEAKS',
    userId: sequence.toString(),
    authSource: 'delius',
  },
  sentAt: '2021-01-01T09:45:21.986389Z',
}))
