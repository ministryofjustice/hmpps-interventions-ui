import { Factory } from 'fishery'
import AuthUserDetails from '../../server/models/hmppsAuth/authUserDetails'

export default Factory.define<AuthUserDetails>(({ sequence }) => ({
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
