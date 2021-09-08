import { Factory } from 'fishery'
import UserDetails from '../../server/models/hmppsAuth/userDetails'

export default Factory.define<UserDetails>(() => ({
  name: 'john smith',
  active: true,
  username: 'user1',
  authSource: 'delius',
  userId: '123',
  uuid: '123',
  organizations: [],
}))
