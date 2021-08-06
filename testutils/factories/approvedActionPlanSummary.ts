import { Factory } from 'fishery'
import ApprovedActionPlanSummary from '../../server/models/approvedActionPlanSummary'

export default Factory.define<ApprovedActionPlanSummary>(({ sequence }) => ({
  id: sequence.toString(),
  approvedAt: '2021-08-07T20:45:21.986389Z',
}))
