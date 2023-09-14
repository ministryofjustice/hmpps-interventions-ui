import { Factory } from 'fishery'
import { DeliusResponsibleOfficer } from '../../server/models/delius/deliusResponsibleOfficer'

class DeliusResponsibleOfficerFactory extends Factory<DeliusResponsibleOfficer> {}

export default DeliusResponsibleOfficerFactory.define<DeliusResponsibleOfficer>(() => ({
  communityManager: {
    code: 'abc',
    name: {
      forename: 'Bob',
      surname: 'Alice',
    },
    username: 'bobalice',
    email: 'bobalice@example.com',
    telephoneNumber: '98454243243',
    responsibleOfficer: true,
    pdu: {
      code: '97',
      description: 'Hackney and City',
    },
    team: {
      code: 'RM',
      description: 'R and M team',
      email: 'r.m@digital.justice.gov.uk',
      telephoneNumber: '044-2545453442',
    },
    unallocated: false,
  },
}))
