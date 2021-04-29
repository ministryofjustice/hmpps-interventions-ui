import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'

import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'

describe(ReferralOverviewPagePresenter, () => {
  describe('serviceUserBannerPresenter', () => {
    it('returns the embedded serviceUserBannerPresenter', () => {
      const serviceUser = serviceUserFactory.build()
      const sentReferral = sentReferralFactory.build()
      const presenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Details,
        sentReferral.id,
        serviceUser,
        'service-provider'
      )
      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })

  describe('subNavArgs', () => {
    it('has the correct tab selected', () => {
      const serviceUser = serviceUserFactory.build()
      const sentReferral = sentReferralFactory.build()

      const detailsPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Details,
        sentReferral.id,
        serviceUser,
        'service-provider'
      )
      let activeTabs = detailsPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Referral details')

      const progressPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Progress,
        sentReferral.id,
        serviceUser,
        'service-provider'
      )
      activeTabs = progressPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Progress')
    })
  })

  it('adds the correct url prefix to the subnav links', () => {
    const serviceUser = serviceUserFactory.build()
    const sentReferral = sentReferralFactory.build()

    const presenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Details,
      sentReferral.id,
      serviceUser,
      'service-provider'
    )

    presenter.subNavArgs.items.forEach(item => {
      expect(item.href.startsWith('/service-provider')).toEqual(true)
    })
  })
})
