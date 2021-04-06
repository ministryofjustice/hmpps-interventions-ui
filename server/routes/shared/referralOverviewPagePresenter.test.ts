import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'

import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'

describe(ReferralOverviewPagePresenter, () => {
  describe('serviceUserBannerArgs', () => {
    it('returns the embedded serviceUserBannerArgs', () => {
      const serviceUser = serviceUserFactory.build()
      const sentReferral = sentReferralFactory.build()
      const presenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Details,
        sentReferral,
        serviceUser
      )
      expect(presenter.serviceUserBannerArgs).toBeDefined()
    })
  })

  describe('subNavArgs', () => {
    it('has the correct tab selected', () => {
      const serviceUser = serviceUserFactory.build()
      const sentReferral = sentReferralFactory.build()

      const detailsPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Details,
        sentReferral,
        serviceUser
      )
      let activeTabs = detailsPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Referral details')

      const progressPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Progress,
        sentReferral,
        serviceUser
      )
      activeTabs = progressPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Progress')
    })
  })
})
