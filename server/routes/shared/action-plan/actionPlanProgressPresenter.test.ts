import actionPlanFactory from '../../../../testutils/factories/actionPlan'
import referralFactory from '../../../../testutils/factories/sentReferral'
import ActionPlanProgressPresenter from './actionPlanProgressPresenter'

describe(ActionPlanProgressPresenter, () => {
  const referral = referralFactory.build()
  describe('createNewActionPlanUrl', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const presenter = new ActionPlanProgressPresenter(referral.id, null, [], 'service-provider')

      expect(presenter.createNewActionPlanUrl).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('continueInProgressActionPlanUrl', () => {
    it('returns the relative URL for continuing a draft action plan', () => {
      const actionPlan = actionPlanFactory.justCreated(referral.id).build()
      const presenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'probation-practitioner')

      expect(presenter.continueInProgressActionPlanUrl).toEqual(
        `/service-provider/action-plan/${actionPlan.id}/add-activity/1`
      )
    })
  })

  describe('viewCurrentActionPlanUrl', () => {
    it('returns the relative URL for viewing the current action plan', () => {
      const actionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const presenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'probation-practitioner')

      expect(presenter.viewCurrentActionPlanUrl).toEqual(`/probation-practitioner/referrals/${referral.id}/action-plan`)
    })
  })

  describe('includeCurrentActionPlanRow', () => {
    it('returns false if the current action plan is approved', () => {
      const actionPlan = actionPlanFactory.approved().build({ referralId: referral.id })
      const spPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'service-provider')
      const ppPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'probation-practitioner')

      expect(spPresenter.includeCurrentActionPlanRow).toEqual(false)
      expect(ppPresenter.includeCurrentActionPlanRow).toEqual(false)
    })

    it('returns true if the referral has not been created', () => {
      const spPresenter = new ActionPlanProgressPresenter(referral.id, null, [], 'service-provider')
      const ppPresenter = new ActionPlanProgressPresenter(referral.id, null, [], 'probation-practitioner')

      expect(spPresenter.includeCurrentActionPlanRow).toEqual(true)
      expect(ppPresenter.includeCurrentActionPlanRow).toEqual(true)
    })

    it('returns false for PPs if the referral is not submitted', () => {
      const actionPlan = actionPlanFactory.justCreated(referral.id).build()
      const spPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'service-provider')
      const ppPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'probation-practitioner')

      expect(spPresenter.includeCurrentActionPlanRow).toEqual(true)
      expect(ppPresenter.includeCurrentActionPlanRow).toEqual(false)
    })

    it('returns true for submitted but not approved action plans', () => {
      const actionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const spPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'service-provider')
      const ppPresenter = new ActionPlanProgressPresenter(referral.id, actionPlan, [], 'probation-practitioner')

      expect(spPresenter.includeCurrentActionPlanRow).toEqual(true)
      expect(ppPresenter.includeCurrentActionPlanRow).toEqual(true)
    })
  })

  describe('includeCreateActionPlanButton', () => {
    it('returns true for SPs and false for PPs', () => {
      const spPresenter = new ActionPlanProgressPresenter(referral.id, null, [], 'service-provider')
      const ppPresenter = new ActionPlanProgressPresenter(referral.id, null, [], 'probation-practitioner')

      expect(spPresenter.includeCreateActionPlanButton).toEqual(true)
      expect(ppPresenter.includeCreateActionPlanButton).toEqual(false)
    })
  })
})
