import FinaliseActionPlanActivitiesForm from './finaliseActionPlanActivitiesForm'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

describe(FinaliseActionPlanActivitiesForm, () => {
  describe('isValid', () => {
    it('returns true when there is at least one activity in the action plan', () => {
      const actionPlan = actionPlanFactory.oneActivityAdded().build()
      const form = new FinaliseActionPlanActivitiesForm(actionPlan)

      expect(form.isValid).toEqual(true)
    })

    it('returns false when there are no activities in the action plan', () => {
      const actionPlan = actionPlanFactory.build()
      const form = new FinaliseActionPlanActivitiesForm(actionPlan)

      expect(form.isValid).toEqual(false)
    })
  })

  describe('error', () => {
    describe('when there is at least one activity in the action plan', () => {
      it('returns an empty array', () => {
        const actionPlan = actionPlanFactory.oneActivityAdded().build()
        const form = new FinaliseActionPlanActivitiesForm(actionPlan)

        expect(form.error).toEqual(null)
      })
    })

    describe('when there is no activity in the action plan', () => {
      it('returns an error', () => {
        const actionPlan = actionPlanFactory.build({ activities: [] })
        const form = new FinaliseActionPlanActivitiesForm(actionPlan)

        expect(form.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'description',
              formFields: ['description'],
              message: 'You must add at least one activity',
            },
          ],
        })
      })
    })
  })
})
