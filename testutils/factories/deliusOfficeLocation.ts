import { Factory } from 'fishery'
import DeliusOfficeLocation from '../../server/models/deliusOfficeLocation'

class DeliusOfficeLocationFactory extends Factory<DeliusOfficeLocation> {
  officeList() {
    return [
      {
        probationOfficeId: 127,
        name: 'South Lakeland: Kendal Probation Office',
        address: 'Probation Office, Busher Lodge, 149 Stricklandgate, Kendal, Cumbria, LA9 4RF',
        probationRegionId: 'B',
        govUkURL: 'https://www.gov.uk/guidance/south-lakeland-kendal-probation-office',
        deliusCRSLocationId: 'CRS0026',
      },
      {
        probationOfficeId: 128,
        name: 'North Lakeland: Kendal Probation Office',
        address: 'Probation Office, Busher Lodge, 160 Stricklandgate, Kendal, Cumbria, LA9 4RF',
        probationRegionId: 'C',
        govUkURL: 'https://www.gov.uk/guidance/north-lakeland-kendal-probation-office',
        deliusCRSLocationId: 'CRS0027',
      },
    ]
  }
}

export default DeliusOfficeLocationFactory.define(() => ({
  probationOfficeId: 127,
  name: 'South Lakeland: Kendal Probation Office',
  address: 'Probation Office, Busher Lodge, 149 Stricklandgate, Kendal, Cumbria, LA9 4RF',
  probationRegionId: 'B',
  govUkURL: 'https://www.gov.uk/guidance/south-lakeland-kendal-probation-office',
  deliusCRSLocationId: 'CRS0026',
}))
