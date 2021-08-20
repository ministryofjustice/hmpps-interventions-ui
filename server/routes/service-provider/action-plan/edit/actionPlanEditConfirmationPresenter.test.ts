import actionPlanFactory from '../../../../../testutils/factories/actionPlan'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'
import ActionPlanEditConfirmationPresenter from './actionPlanEditConfirmationPresenter'

describe(ActionPlanEditConfirmationPresenter, () => {
  describe('text', () => {
    describe('when editing an approved action plan', () => {
      it('contains the correct warning message to the user', () => {
        const sentReferral = sentReferralFactory.build()
        const approvedActionPlan = actionPlanFactory.approved().build()

        const presenter = new ActionPlanEditConfirmationPresenter(sentReferral, approvedActionPlan)

        expect(presenter.text.title).toEqual('Are you sure you want to create a new action plan?')
        expect(presenter.text.note).toEqual(
          'Note: Creating a new action plan will overwrite the current one once the probation practitioner approves it.'
        )
      })
    })

    describe('when editing a not-yet-approved action plan', () => {
      it('contains the correct warning message to the user', () => {
        const sentReferral = sentReferralFactory.build()
        const approvedActionPlan = actionPlanFactory.submitted().build()

        const presenter = new ActionPlanEditConfirmationPresenter(sentReferral, approvedActionPlan)

        expect(presenter.text.title).toEqual(
          'Are you sure you want to change the action plan while it is being reviewed?'
        )
        expect(presenter.text.note).toEqual(
          'Note: This will withdraw the current action plan and the probation practitioner will no longer be able to view it.'
        )
      })
    })
  })
})
