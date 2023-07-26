import { Factory } from 'fishery'
import { RamDeliusUser } from '../../server/models/delius/deliusUser'

export default Factory.define<RamDeliusUser>(_ => ({
  username: 'BERNARD.BEAKS',
  name: {
    forename: 'Bernard',
    surname: 'Beaks',
  },
  email: 'bernard.beaks@justice.gov.uk',
}))
