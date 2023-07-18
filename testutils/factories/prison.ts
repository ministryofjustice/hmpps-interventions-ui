import { Factory } from 'fishery'
import Prison from '../../server/models/prisonRegister/prison'

class PrisonFactory extends Factory<Prison[]> {
  singlePrison() {
    return this
  }

  prisonList() {
    return [
      {
        prisonId: 'aaa',
        prisonName: 'London',
        male: true,
        female: false,
        contracted: false,
        addresses: [],
        types: [],
        operators: [],
      },
      {
        prisonId: 'bbb',
        prisonName: 'Sheffield',
        male: true,
        female: false,
        contracted: false,
        addresses: [],
        types: [],
        operators: [],
      },
    ]
  }
}

export default PrisonFactory.define<Prison[]>(() => [
  {
    prisonId: 'aaa',
    prisonName: 'London',
    male: true,
    female: false,
    contracted: false,
    addresses: [],
    types: [],
    operators: [],
  },
  {
    prisonId: 'bbb',
    prisonName: 'Sheffield',
    male: true,
    female: false,
    contracted: false,
    addresses: [],
    types: [],
    operators: [],
  },
])
