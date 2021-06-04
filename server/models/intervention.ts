import ServiceProvider from './serviceProvider'
import NPSRegion from './npsRegion'
import PCCRegion from './pccRegion'
import ServiceCategory from './serviceCategory'

export interface Eligibility {
  minimumAge: number
  maximumAge: number | null
  allowsFemale: boolean
  allowsMale: boolean
}

export interface ContractType {
  code: string
  name: string
}

export default interface Intervention {
  id: string
  title: string
  description: string
  npsRegion: NPSRegion | null
  pccRegions: PCCRegion[]
  serviceCategories: ServiceCategory[]
  serviceProvider: ServiceProvider
  eligibility: Eligibility
  contractType: ContractType
}
