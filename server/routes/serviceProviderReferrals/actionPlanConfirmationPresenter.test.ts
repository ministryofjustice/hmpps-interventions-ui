import ActionPlanConfirmationPresenter from './actionPlanConfirmationPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(ActionPlanConfirmationPresenter, () => {
  describe('progressHref', () => {
    it('returns the relative URL of the service provider referral progress page', () => {
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new ActionPlanConfirmationPresenter(sentReferral, serviceCategory)

      expect(presenter.progressHref).toEqual(`/service-provider/referrals/${sentReferral.id}/progress`)
    })
  })

  describe('summary', () => {
    it('returns a summary of the referral', () => {
      const sentReferral = sentReferralFactory.build({
        referenceNumber: 'CEF345',
        referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
      })
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const presenter = new ActionPlanConfirmationPresenter(sentReferral, serviceCategory)

      expect(presenter.summary).toEqual([
        { key: 'Name', lines: ['Johnny Davis'] },
        {
          key: 'Referral number',
          lines: ['CEF345'],
        },
        {
          key: 'Service type',
          lines: ['Social inclusion'],
        },
      ])
    })
  })
})
