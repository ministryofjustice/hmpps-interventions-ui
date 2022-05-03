import interventionFactory from '../../../../../testutils/factories/intervention'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'
import ReferralCancellationConfirmationPresenter from './referralCancellationConfirmationPresenter'

describe(ReferralCancellationConfirmationPresenter, () => {
  describe('text', () => {
    it('contains a panel title and what happens next text', () => {
      const sentReferral = sentReferralFactory.build()
      const intervention = interventionFactory.build()
      const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, intervention)

      expect(presenter.text).toMatchObject({
        confirmationText: 'This referral has been cancelled',
        headingText: 'What you need to do next',
        whatHappensNextText:
          'You need to contact the service provider outside the service to let them know about the change.',
      })
    })
  })

  describe('serviceUserSummary', () => {
    it('displays information about the referral and service user', () => {
      const sentReferral = sentReferralFactory.build({ referenceNumber: 'AB1234' })
      const intervention = interventionFactory.build({ contractType: { name: 'personal wellbeing' } })
      const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, intervention)

      expect(presenter.serviceUserSummary).toEqual([
        {
          key: 'Name',
          lines: ['Alex River'],
        },
        {
          key: 'Referral number',
          lines: ['AB1234'],
        },
        {
          key: 'Type of referral',
          lines: ['Personal wellbeing'],
        },
      ])
    })
  })
})
