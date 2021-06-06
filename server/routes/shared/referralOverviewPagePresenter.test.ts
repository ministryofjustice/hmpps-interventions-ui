import sentReferralFactory from '../../../testutils/factories/sentReferral'

import ReferralOverviewPagePresenter, { ReferralOverviewPageSection } from './referralOverviewPagePresenter'

describe(ReferralOverviewPagePresenter, () => {
  describe('subNavArgs', () => {
    it('has the correct tab selected', () => {
      const sentReferral = sentReferralFactory.build()

      const detailsPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Details,
        sentReferral.id,
        'service-provider'
      )
      let activeTabs = detailsPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Referral details')

      const progressPresenter = new ReferralOverviewPagePresenter(
        ReferralOverviewPageSection.Progress,
        sentReferral.id,
        'service-provider'
      )
      activeTabs = progressPresenter.subNavArgs.items.filter(x => x.active === true)
      expect(activeTabs.length).toEqual(1)
      expect(activeTabs[0].text).toEqual('Progress')
    })
  })

  it('adds the correct url prefix to the subnav links', () => {
    const sentReferral = sentReferralFactory.build()

    const presenter = new ReferralOverviewPagePresenter(
      ReferralOverviewPageSection.Details,
      sentReferral.id,
      'service-provider'
    )

    presenter.subNavArgs.items.forEach(item => {
      expect(item.href.startsWith('/service-provider')).toEqual(true)
    })
  })

  describe('dashboardURL', () => {
    const values: ('service-provider' | 'probation-practitioner')[] = ['service-provider', 'probation-practitioner']
    it.each(values)('returns a relative URL for the %s dashboard', prefix => {
      const sentReferral = sentReferralFactory.build()
      const presenter = new ReferralOverviewPagePresenter(ReferralOverviewPageSection.Details, sentReferral.id, prefix)

      expect(presenter.dashboardURL).toEqual(`/${prefix}/referrals/dashboard`)
    })
  })
})
