import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import serviceProviderFactory from '../../../testutils/factories/serviceProvider'
import ReferralCancellationPresenter from './referralCancellationPresenter'

describe(ReferralCancellationPresenter, () => {
  describe('text', () => {
    it('includes a title, information and label for the additional comments question', () => {
      const serviceProvider = serviceProviderFactory.build({ name: 'Harmony Living' })
      const sentReferral = sentReferralFactory.build({ referral: { serviceProvider } })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex', surname: 'River' })
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })

      const presenter = new ReferralCancellationPresenter(sentReferral, serviceCategory, serviceUser)
      expect(presenter.text.title).toEqual('Referral cancellation')
      expect(presenter.text.information).toEqual(
        "You are about to cancel Alex River's referral for an accommodation intervention with Harmony Living."
      )
      expect(presenter.text.additionalCommentsLabel).toEqual('Additional comments (optional):')
    })
  })
})
