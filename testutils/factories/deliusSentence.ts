import { Factory } from 'fishery'
import { Sentence } from '../../server/models/delius/deliusConviction'

export default Factory.define<Sentence>(({ sequence }) => ({
  sentenceId: sequence,
  description: 'Absolute/Conditional Discharge',
  expectedSentenceEndDate: '2025-09-15',
  sentenceType: {
    code: 'SC',
    description: 'CJA - Indeterminate Public Prot.',
  },
}))
