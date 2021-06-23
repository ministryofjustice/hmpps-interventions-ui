import { Factory } from 'fishery'
import { Activity } from '../../server/models/actionPlan'

export default Factory.define<Activity>(({ sequence }) => ({
  id: sequence.toString(),
  description: 'Attend training course',
  createdAt: '2020-12-07T20:45:21.986389Z',
}))
