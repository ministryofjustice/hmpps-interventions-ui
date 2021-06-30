import actionPlanFactory from '../../../../testutils/factories/actionPlan'
import referralFactory from '../../../../testutils/factories/sentReferral'
import ActionPlanPresenter from './actionPlanPresenter'
import InterventionProgressPresenter from '../../serviceProviderReferrals/interventionProgressPresenter'

describe(InterventionProgressPresenter, () => {
  const referral = referralFactory.build()

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
