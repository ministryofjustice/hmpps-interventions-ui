import { Factory } from 'fishery'
import { CaseConviction } from '../../server/models/delius/deliusConviction'
import deliusServiceUserFactory from './expandedDeliusServiceUser'

export default Factory.define<CaseConviction>(({ sequence }) => ({
  caseDetail: deliusServiceUserFactory.build(),
  conviction: {
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
}))
