import { Factory } from 'fishery'
import DeliusDeliveryUnit from '../../server/models/deliusDeliveryUnit'

class DeliusProbationDeliveryUnitFactory extends Factory<DeliusDeliveryUnit> {
  pduList() {
    return [
      {
        pduId: 1,
        name: 'East Kent',
        probationRegionId: 'K',
      },
      {
        pduId: 2,
        name: 'Hackney and City',
        probationRegionId: 'H',
      },
    ]
  }
}

export default DeliusProbationDeliveryUnitFactory.define(() => ({
  pduId: 1,
  name: 'East Kent',
  probationRegionId: 'K',
}))
