import { Factory } from 'fishery'
import { Activity } from '../../server/models/actionPlan'

export default Factory.define<Activity>(({ sequence }) => ({
  id: sequence.toString(),
  description: 'Attend training course',
  desiredOutcome: {
    id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
    description:
      'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
  },
  createdAt: '2020-12-07T20:45:21.986389Z',
}))
