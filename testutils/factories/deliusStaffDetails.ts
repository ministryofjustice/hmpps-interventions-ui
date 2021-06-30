import { Factory } from 'fishery'
import { DeliusStaffDetails } from '../../server/models/delius/deliusStaffDetails'

export default Factory.define<DeliusStaffDetails>(() => ({
  username: 'BERNARD.BEAKS',
  teams: [
    {
      telephone: '07890 123456',
      emailAddress: 'probation-team4692@justice.gov.uk',
      startDate: '2021-01-01',
    },
  ],
}))
