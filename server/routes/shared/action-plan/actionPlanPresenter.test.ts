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

  describe('orderedActivities', () => {
    it('returns the activities specified on the draft action plan in date created order', () => {
      const actionPlan = actionPlanFactory.justCreated(referral.id).build({
        activities: [
          {
            id: '1',
            description: 'description 1',
            createdAt: '2021-03-15T10:05:00Z',
          },
          {
            id: '2',
            description: 'description 2',
            createdAt: '2021-03-15T10:00:00Z',
          },
        ],
      })

      const presenter = new ActionPlanPresenter(referral, actionPlan, 'probation-practitioner')
      expect(presenter.orderedActivities).toEqual(['description 2', 'description 1'])
    })
  })
})
