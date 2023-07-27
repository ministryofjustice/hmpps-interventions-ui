import { Factory } from 'fishery'
import { RamDeliusUser } from '../../server/models/delius/deliusUser'

export default Factory.define<RamDeliusUser>(() => ({
  username: 'b.beaks',
  name: {
    forename: 'Bernard',
    surname: 'Beaks',
  },
  email: 'b.beaks@justice.gov.uk',
}))
