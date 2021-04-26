import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'

describe(ReferralCancellationConfirmationPresenter, () => {
  describe('text', () => {
    it('contains a panel title and what happens next text', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, serviceCategory, serviceUser)

      expect(presenter.text).toMatchObject({
        confirmationText: 'This referral has been cancelled',
        whatHappensNextText:
          "Service provider will be notified about the cancellation. You don't have to do anything else.",
      })
    })
  })

  describe('serviceUserBannerPresenter', () => {
    it('is defined', () => {
      const serviceUser = deliusServiceUserFactory.build()
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, serviceCategory, serviceUser)

      expect(presenter.serviceUserBannerPresenter).toBeDefined()
    })
  })

  describe('serviceUserSummary', () => {
    it('displays information about the referral and service user', () => {
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex', surname: 'River' })
      const sentReferral = sentReferralFactory.build({ referenceNumber: 'AB1234' })
      const serviceCategory = serviceCategoryFactory.build({ name: 'Accommodation' })
      const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, serviceCategory, serviceUser)

      expect(presenter.serviceUserSummary).toEqual([
        {
          key: 'Name',
          lines: ['Alex River'],
          isList: false,
        },
        {
          key: 'Referral number',
          lines: ['AB1234'],
          isList: false,
        },
        {
          key: 'Type of referral',
          lines: ['Accommodation'],
          isList: false,
        },
      ])
    })
  })
})
