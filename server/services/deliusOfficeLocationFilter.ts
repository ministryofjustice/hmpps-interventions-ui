import ReferenceDataService from './referenceDataService'
import DeliusOfficeLocation from '../models/deliusOfficeLocation'
import Intervention from '../models/intervention'
import { ActionPlanAppointment, InitialAssessmentAppointment } from '../models/appointment'

export default class DeliusOfficeLocationFilter {
  constructor(private referenceDataService: ReferenceDataService) {}

  async findOfficesByIntervention(intervention: Intervention): Promise<DeliusOfficeLocation[]> {
    const npsRegionIds: string[] = []
    if (intervention.npsRegion !== undefined && intervention.npsRegion !== null) {
      npsRegionIds.push(intervention.npsRegion.id)
    }
    intervention.pccRegions.map(pccRegion => npsRegionIds.push(pccRegion.npsRegion?.id))
    return this.findOfficesByNpsRegionIds(npsRegionIds)
  }

  async findOfficeByAppointment(
    appointment: InitialAssessmentAppointment | ActionPlanAppointment
  ): Promise<DeliusOfficeLocation | null> {
    if (appointment.npsOfficeCode === null) {
      return null
    }
    const officeMatch = (await this.referenceDataService.getProbationOffices()).find(
      office => office.deliusCRSLocationId === appointment.npsOfficeCode
    )
    if (officeMatch === undefined) {
      return null
    }
    return officeMatch
  }

  private async findOfficesByNpsRegionIds(npsRegionIds: string[]): Promise<DeliusOfficeLocation[]> {
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const filteredOfficeLocations = deliusOfficeLocations
      .filter(deliusOfficeLocation => deliusOfficeLocation.deliusCRSLocationId !== '')
      .filter(deliusOfficeLocation => npsRegionIds.includes(deliusOfficeLocation.probationRegionId))
    return filteredOfficeLocations
  }
}
