import { Factory } from 'fishery'
import DeliusOfficeLocation from '../../server/models/deliusOfficeLocation'

export default Factory.define<DeliusOfficeLocation>(() => ({
  probationOfficeId: 127,
  name: 'South Lakeland: Kendal Probation Office',
  address: 'Probation Office, Busher Lodge, 149 Stricklandgate, Kendal, Cumbria, LA9 4RF',
  probationRegionId: 'B',
  govUkURL: 'https://www.gov.uk/guidance/south-lakeland-kendal-probation-office',
  deliusCRSLocationId: 'CRS0026',
}))
