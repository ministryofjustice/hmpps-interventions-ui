import actionPlanFactory from '../../../../testutils/factories/actionPlan'
import ActionPlanSummaryPresenter from './actionPlanSummaryPresenter'

describe(ActionPlanSummaryPresenter, () => {
  describe('actionPlanStatus', () => {
    describe('when there is no action plan', () => {
      it('returns the correct status', () => {
        const presenter = new ActionPlanSummaryPresenter(null, 'service-provider')
        expect(presenter.actionPlanStatus).toEqual('Not submitted')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the correct status for service providers', () => {
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new ActionPlanSummaryPresenter(actionPlan, 'service-provider')

        expect(presenter.actionPlanStatus).toEqual('In draft')
      })

      it('returns the correct status for probation practitioners', () => {
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new ActionPlanSummaryPresenter(actionPlan, 'probation-practitioner')

        expect(presenter.actionPlanStatus).toEqual('Not submitted')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the correct status', () => {
        const actionPlan = actionPlanFactory.submitted().build()
        const presenter = new ActionPlanSummaryPresenter(actionPlan, 'service-provider')

        expect(presenter.actionPlanStatus).toEqual('Awaiting approval')
      })
    })

    describe('when the action plan has been approved', () => {
      it('returns the correct status', () => {
        const actionPlan = actionPlanFactory.approved().build()
        const presenter = new ActionPlanSummaryPresenter(actionPlan, 'service-provider')

        expect(presenter.actionPlanStatus).toEqual('Approved')
      })
    })
  })

  describe('actionPlanCreated', () => {
    describe('when there is no action plan', () => {
      it('returns false', () => {
        const presenter = new ActionPlanSummaryPresenter(null, 'service-provider')

        expect(presenter.actionPlanCreated).toEqual(false)
      })
    })

    describe('when there is an action plan', () => {
      it('returns true', () => {
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new ActionPlanSummaryPresenter(actionPlan, 'service-provider')

        expect(presenter.actionPlanCreated).toEqual(true)
      })
    })
  })
})
