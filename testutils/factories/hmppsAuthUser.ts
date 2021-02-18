import { Factory } from 'fishery'
import { User } from '../../server/data/hmppsAuthClient'

export default Factory.define<User>(({ sequence }) => ({
  username: `AUTH_ADM_${sequence}`,
  active: true,
  name: `Auth Adm ${sequence}`,
  authSource: 'auth',
  userId: sequence.toString(),
}))
