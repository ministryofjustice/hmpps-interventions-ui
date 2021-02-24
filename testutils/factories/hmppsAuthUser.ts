import { Factory } from 'fishery'
import { AuthUser } from '../../server/data/hmppsAuthClient'

export default Factory.define<AuthUser>(({ sequence }) => ({
  userId: sequence.toString(),
  username: `AUTH_ADM_${sequence}`,
  email: 'auth.user@someagency.justice.gov.uk',
  firstName: 'Auth',
  lastName: `Adm ${sequence}`,
  locked: false,
  enabled: true,
  verified: true,
  lastLoggedIn: '01/01/2001',
}))
