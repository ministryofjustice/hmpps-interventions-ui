import { Factory } from 'fishery'
import DeliusConviction from '../../server/models/delius/deliusConviction'

export default Factory.define<DeliusConviction>(({ sequence }) => ({
  id: sequence,
  convictionId: 2500297061,
  active: true,
  convictionDate: '2019-09-16',
  offences: [
    {
      mainOffence: true,
      detail: {
        mainCategoryDescription: 'Assault on Police Officer',
        subCategoryDescription: 'Assault on Police Officer',
      },
    },
    {
      mainOffence: false,
      detail: {
        mainCategoryDescription: 'Common and other types of assault',
        subCategoryDescription: 'Common assault and battery',
      },
    },
  ],
  sentence: {
    sentenceId: 2500284169,
    description: 'Absolute/Conditional Discharge',
    expectedSentenceEndDate: '2025-09-15',
    sentenceType: {
      code: 'SC',
      description: 'CJA - Indeterminate Public Prot.',
    },
  },
}))
