import { Factory } from 'fishery'
import { DeliusOffenderManager } from '../../server/models/delius/deliusOffenderManager'

class DeliusOffenderManagerFactory extends Factory<DeliusOffenderManager> {
  responsibleOfficer() {
    return this.params({ isResponsibleOfficer: true })
  }

  notResponsibleOfficer() {
    return this.params({ isResponsibleOfficer: false })
  }
}

export default DeliusOffenderManagerFactory.define(() => ({
  isResponsibleOfficer: true,
  staff: {
    email: 'officer@gov.uk',
    forenames: 'Sheila Linda',
    phoneNumber: '0123411278',
    surname: 'Hancock',
  },
  team: {
    telephone: '07890 123456',
    emailAddress: 'probation-team4692@justice.gov.uk',
    startDate: '2021-01-01',
  },
}))
