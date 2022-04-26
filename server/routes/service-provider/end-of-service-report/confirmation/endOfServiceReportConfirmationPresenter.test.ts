import EndOfServiceReportConfirmationPresenter from './endOfServiceReportConfirmationPresenter'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'

describe(EndOfServiceReportConfirmationPresenter, () => {
  describe('progressHref', () => {
    it('returns the relative URL of the service provider referral progress page', () => {
      const sentReferral = sentReferralFactory.build()
      const presenter = new EndOfServiceReportConfirmationPresenter(sentReferral, 'Personal wellbeing')

      expect(presenter.progressHref).toEqual(`/service-provider/referrals/${sentReferral.id}/progress`)
    })
  })

  describe('summary', () => {
    it('returns a summary of the referral', () => {
      const sentReferral = sentReferralFactory.build({
        referenceNumber: 'CEF345',
        referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
      })
      const presenter = new EndOfServiceReportConfirmationPresenter(sentReferral, 'Social inclusion')

      expect(presenter.summary).toEqual([
        { key: 'Name', lines: ['Johnny Davis'] },
        {
          key: 'Referral number',
          lines: ['CEF345'],
        },
        {
          key: 'Service category',
          lines: ['Social inclusion'],
        },
      ])
    })
  })
})
