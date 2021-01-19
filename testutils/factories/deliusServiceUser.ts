import { Factory } from 'fishery'
import { DeliusServiceUser } from '../../server/services/communityApiService'

export default Factory.define<DeliusServiceUser>(({ sequence }) => ({
  offenderId: String(sequence),
  firstName: 'Alex',
  surname: 'River',
  dateOfBirth: '1982-10-24',
}))
