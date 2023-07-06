import { Factory } from 'fishery'
import { DeliusResponsibleOfficer } from '../../server/models/delius/deliusResponsibleOfficer'

export default Factory.define<DeliusResponsibleOfficer>(() => ({
  communityManager: {
    code: 'abc',
    name: {
      forename: 'Bob',
      surname: 'Alice',
    },
    username: 'bobalice',
    email: 'bobalice@example.com',
    responsibleOfficer: true,
    pdu: {
      code: '97',
      description: 'Hackney and City',
    },
  },
}))
