import csv from 'csvtojson'
import DeliusOfficeLocation from '../models/deliusOfficeLocation'
import DeliusDeliveryUnit from '../models/deliusDeliveryUnit'

export default class ReferenceDataService {
  async getProbationOffices(): Promise<DeliusOfficeLocation[]> {
    return csv()
      .fromFile('reference-data/probation-offices-v0.csv')
      .then(json => {
        return json.map(jsonFile => {
          return {
            probationOfficeId: Number(jsonFile.probation_office_id),
            name: jsonFile.name,
            address: jsonFile.address,
            probationRegionId: jsonFile.probation_region_id,
            govUkURL: jsonFile.gov_uk_url,
            deliusCRSLocationId: jsonFile.delius_crs_location_id,
          }
        })
      })
  }

  async getProbationDeliveryUnits(): Promise<DeliusDeliveryUnit[]> {
    return csv()
      .fromFile('reference-data/probation-delivery-units-v0.csv')
      .then(json => {
        return json.map(jsonFile => {
          return {
            pduId: Number(jsonFile.pdu_id),
            name: jsonFile.name,
            probationRegionId: jsonFile.probation_region_id,
          }
        })
      })
  }
}
