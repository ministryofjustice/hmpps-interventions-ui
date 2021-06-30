import { Factory } from 'fishery'
import { DeliusTeam } from '../../server/models/delius/deliusStaffDetails'

export default Factory.define<DeliusTeam>(() => ({
  telephone: '07890 123456',
  emailAddress: 'probation-team4692@justice.gov.uk',
  startDate: '2021-01-01',
}))
