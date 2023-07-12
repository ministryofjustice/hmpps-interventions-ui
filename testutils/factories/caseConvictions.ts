import { Factory } from 'fishery'
import { CaseConvictions } from '../../server/models/delius/deliusConviction'
import deliusServiceUserFactory from './expandedDeliusServiceUser'

export default Factory.define<CaseConvictions>(({ sequence }) => ({
  caseDetail: deliusServiceUserFactory.build(),
  convictions: [
    {
      id: sequence,
      date: '2019-09-16',
      mainOffence: {
        category: 'Assault on Police Officer',
        subCategory: 'Assault on Police Officer',
      },
      sentence: {
        description: 'Absolute/Conditional Discharge',
        expectedEndDate: '2025-09-15',
      },
    },
    {
      id: sequence + 1,
      date: '2019-09-15',
      mainOffence: {
        category: 'Common and other types of assault',
        subCategory: 'Common assault and battery',
      },
      sentence: {
        description: '12 months',
        expectedEndDate: '2025-09-15',
      },
    },
  ],
}))
