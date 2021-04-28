import { Factory } from 'fishery'
import DeliusUser from '../../server/models/delius/deliusUser'

export default Factory.define<DeliusUser>(sequence => ({
  userId: sequence.toString(),
  username: 'BERNARD.BEAKS',
  firstName: 'Bernard',
  surname: 'Beaks',
  email: 'bernard.beaks@justice.gov.uk',
  enabled: true,
  roles: [],
}))
