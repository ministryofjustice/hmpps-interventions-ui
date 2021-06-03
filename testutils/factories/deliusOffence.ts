import { Factory } from 'fishery'
import { Offence } from '../../server/models/delius/deliusConviction'

export default Factory.define<Offence>(({ sequence }) => ({
  offenceId: sequence.toString(),
  mainOffence: true,
  detail: {
    code: '10501',
    description: 'Common assault and battery - 10501',
    mainCategoryCode: '105',
    mainCategoryDescription: 'Common and other types of assault',
    mainCategoryAbbreviation: 'Common and other types of assault',
    ogrsOffenceCategory: 'Violence',
    subCategoryCode: '01',
    subCategoryDescription: 'Common assault and battery',
    form20Code: '88',
  },
  offenceDate: '2019-09-09T00:00:00',
  offenceCount: 1,
  offenderId: 2600343964,
  createdDatetime: '2019-09-17T00:00:00',
  lastUpdatedDatetime: '2019-09-17T00:00:00',
}))
