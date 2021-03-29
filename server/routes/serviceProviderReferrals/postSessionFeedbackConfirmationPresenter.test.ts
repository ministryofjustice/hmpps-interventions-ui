import deliusUser from '../../../testutils/factories/deliusUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import PostSessionFeedbackConfirmationPresenter from './postSessionFeedbackConfirmationPresenter'

describe(PostSessionFeedbackConfirmationPresenter, () => {
  describe('progressHref', () => {
    it('returns the relative URL of the service provider referral progress page', () => {
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const probationPractitioner = deliusUser.build()
      const presenter = new PostSessionFeedbackConfirmationPresenter(
        sentReferral,
        serviceCategory,
        probationPractitioner
      )

      expect(presenter.progressHref).toEqual(`/service-provider/referrals/${sentReferral.id}/progress`)
    })
  })

  describe('text', () => {
    it('contains next steps, including the PP‘s name', () => {
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const probationPractitioner = deliusUser.build({
        firstName: 'Josie',
        surname: 'Bart',
      })
      const presenter = new PostSessionFeedbackConfirmationPresenter(
        sentReferral,
        serviceCategory,
        probationPractitioner
      )

      expect(presenter.text.whatHappensNext).toEqual(
        'The session feedback form has been saved and submitted to Josie Bart, probation practitioner. Please deliver the next session.'
      )
    })
  })

  describe('summary', () => {
    it('returns a summary of the referral', () => {
      const sentReferral = sentReferralFactory.build({
        referenceNumber: 'CEF345',
        referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
      })
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const probationPractitioner = deliusUser.build()
      const presenter = new PostSessionFeedbackConfirmationPresenter(
        sentReferral,
        serviceCategory,
        probationPractitioner
      )

      expect(presenter.summary).toEqual([
        { key: 'Name', lines: ['Johnny Davis'], isList: false },
        {
          key: 'Referral number',
          lines: ['CEF345'],
          isList: false,
        },
        {
          key: 'Service type',
          lines: ['Social inclusion'],
          isList: false,
        },
      ])
    })
  })
})
