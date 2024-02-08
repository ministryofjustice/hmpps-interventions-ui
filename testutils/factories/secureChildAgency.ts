import { Factory } from 'fishery'
import SecureChildrenAgencies from '../../server/models/prisonApi/secureChildrenAgencies'

class SecureChildrenAgenciesFactory extends Factory<SecureChildrenAgencies[]> {}

export default SecureChildrenAgenciesFactory.define<SecureChildrenAgencies[]>(() => [
  {
    agencyId: 'ddd',
    description: 'Manchester (HMY)',
    longDescription: 'Manchester (HMY)',
    agencyType: 'SCH',
    active: true,
  },
  {
    agencyId: 'eee',
    description: 'Nottingham (HMY)',
    longDescription: 'Nottingham (HMY)',
    agencyType: 'SCH',
    active: true,
  },
  {
    agencyId: 'fff',
    description: 'Leeds (HMY)',
    longDescription: 'Leeds (HMY)',
    agencyType: 'SCH',
    active: true,
  },
])
