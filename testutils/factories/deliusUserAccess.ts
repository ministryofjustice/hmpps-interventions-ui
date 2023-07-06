import { Factory } from 'fishery'
import DeliusUserAccess from '../../server/models/delius/deliusUserAccess'

export default Factory.define<DeliusUserAccess>(() => ({
  access: [
    {
      crn: 'X320741',
      userExcluded: false,
      userRestricted: false,
      exclusionMessage: 'nocrn',
      restrictionMessage: 'none',
    },
  ],
}))
