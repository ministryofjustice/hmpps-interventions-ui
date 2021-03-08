import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(InterventionProgressPresenter, () => {
  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory)

      expect(presenter.createActionPlanFormAction).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('text', () => {
    it('returns text to be displayed', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const presenter = new InterventionProgressPresenter(referral, serviceCategory)

      expect(presenter.text).toEqual({
        actionPlanStatus: 'Not submitted',
        title: 'Accommodation',
      })
    })
  })

  describe('actionPlanStatusColour', () => {
    it('returns the inactive colour', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory)

      expect(presenter.actionPlanStatusColour).toEqual('inactive')
    })
  })
})
