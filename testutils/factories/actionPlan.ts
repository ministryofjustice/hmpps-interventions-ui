import { Factory } from 'fishery'
import { ActionPlan } from '../../server/services/interventionsService'

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

  readyToSubmit(referralId: string) {
    return this.params({
      referralId,
      numberOfSessions: 4,
      activities: [
        {
          id: '91e7ceab-74fd-45d8-97c8-ec58844618dd',
          description: 'Attend training course',
          desiredOutcome: {
            id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
            description:
              'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
          },
          createdAt: '2020-12-07T20:45:21.986389Z',
        },
        {
          id: 'e5755c27-2c85-448b-9f6d-e3959ec9c2d0',
          description: 'Attend session',
          desiredOutcome: {
            id: '65924ac6-9724-455b-ad30-906936291421',
            description: 'Service User makes progress in obtaining accommodation.',
          },
          createdAt: '2020-12-07T20:47:21.986389Z',
        },
      ],
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
