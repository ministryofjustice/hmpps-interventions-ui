import { Factory } from 'fishery'
import { ActionPlan } from '../../server/services/interventionsService'

class ActionPlanFactory extends Factory<ActionPlan> {
  notSubmitted() {
    return this
  }

  submitted() {
    return this.params({ submittedAt: new Date().toISOString() })
  }
}

export default ActionPlanFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  submittedAt: null,
}))
