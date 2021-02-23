import AssignmentConfirmationPresenter from './assignmentConfirmationPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe(AssignmentConfirmationPresenter, () => {
  describe('dashboardHref', () => {
    it('returns the relative URL of the service provider referrals dashboard', () => {
      const sentReferral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const assignee = hmppsAuthUserFactory.build()
      const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

      expect(presenter.dashboardHref).toEqual('/service-provider/dashboard')
    })
  })

  describe('summary', () => {
    it('returns a summary of the referral and the assigned caseworker', () => {
      const sentReferral = sentReferralFactory.build({
        referenceNumber: 'CEF345',
        referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
      })
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const assignee = hmppsAuthUserFactory.build({ name: 'Bernard Beaks' })
      const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

      expect(presenter.summary).toEqual([
        {
          key: 'Name',
          lines: ['Johnny Davis'],
          isList: false,
        },
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
        {
          key: 'Assigned to',
          lines: ['Bernard Beaks'],
          isList: false,
        },
      ])
    })
  })
})
