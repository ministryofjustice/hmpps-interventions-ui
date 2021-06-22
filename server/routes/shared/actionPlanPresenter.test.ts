import actionPlanFactory from '../../../testutils/factories/actionPlan'
import referralFactory from '../../../testutils/factories/sentReferral'
import ActionPlanPresenter from './actionPlanPresenter'
import InterventionProgressPresenter from '../serviceProviderReferrals/interventionProgressPresenter'

describe(InterventionProgressPresenter, () => {
  const referral = referralFactory.build()
  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const actionPlan = actionPlanFactory.approved().build({ referralId: referral.id })
      const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider')

      expect(presenter.createActionPlanFormAction).toEqual(
        `/service-provider/referrals/${actionPlan.referralId}/action-plan`
      )
    })
  })

  describe('actionPlanStatus', () => {
    describe('when there is no action plan', () => {
      it('returns the correct status', () => {
        const presenter = new ActionPlanPresenter(referral, null, 'service-provider')
        expect(presenter.text.actionPlanStatus).toEqual('Not submitted')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the correct status', () => {
        const actionPlan = actionPlanFactory.notSubmitted().build({ referralId: referral.id })
        const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider')

        expect(presenter.text.actionPlanStatus).toEqual('Not submitted')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the correct status', () => {
        const actionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider')

        expect(presenter.text.actionPlanStatus).toEqual('Awaiting approval')
      })
    })

    describe('when the action plan has been approved', () => {
      it('returns the correct status', () => {
        const actionPlan = actionPlanFactory.approved().build({ referralId: referral.id })
        const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider')

        expect(presenter.text.actionPlanStatus).toEqual('Approved')
      })
    })
  })

  describe('actionPlanCreated', () => {
    describe('when there is no action plan', () => {
      it('returns false', () => {
        const presenter = new ActionPlanPresenter(referral, null, 'service-provider')

        expect(presenter.actionPlanCreated).toEqual(false)
      })
    })

    describe('when there is an action plan', () => {
      it('returns true', () => {
        const actionPlan = actionPlanFactory.notSubmitted().build({ referralId: referral.id })
        const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider')

        expect(presenter.actionPlanCreated).toEqual(true)
      })
    })
  })

  describe('errorSummary', () => {
    describe('when a validation error is passed in', () => {
      it('should add the error to the error summary and field errors', () => {
        const actionPlan = actionPlanFactory.approved().build({ referralId: referral.id })
        const validationError = {
          errors: [
            {
              errorSummaryLinkedField: 'confirm-approval',
              formFields: ['confirm-approval'],
              message: 'Select the checkbox to confirm before you approve the action plan',
            },
          ],
        }
        const presenter = new ActionPlanPresenter(referral, actionPlan, 'service-provider', validationError)
        expect(presenter.errorSummary).toEqual([
          { field: 'confirm-approval', message: 'Select the checkbox to confirm before you approve the action plan' },
        ])
        expect(presenter.fieldErrors.confirmApproval).toEqual(
          'Select the checkbox to confirm before you approve the action plan'
        )
      })
    })
  })
})
