import { Factory } from 'fishery'
import ActionPlan from '../../server/models/actionPlan'
import actionPlanActivityFactory from './actionPlanActivity'

class ActionPlanFactory extends Factory<ActionPlan> {
  notSubmitted() {
    return this
  }

  submitted() {
    return this.params({ submittedAt: new Date().toISOString() })
  }

  justCreated(referralId: string) {
    return this.params({ referralId })
  }

  oneActivityAdded() {
    return this.params({
      activities: [actionPlanActivityFactory.build()],
    })
  }

  readyToSubmit(referralId: string) {
    return this.params({
      referralId,
      numberOfSessions: 4,
      activities: actionPlanActivityFactory.buildList(2),
    })
  }
}

export default ActionPlanFactory.define(({ sequence }) => ({
  id: sequence.toString(),
  referralId: '81d754aa-d868-4347-9c0f-50690773014e',
  numberOfSessions: null,
  activities: [],
  submittedAt: null,
  submittedBy: null,
}))
