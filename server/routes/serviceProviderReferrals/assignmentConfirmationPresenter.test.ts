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
    describe('when the selected caseworker has a first and last name', () => {
      it('returns a summary of the selected caseworker with both names', () => {
        const sentReferral = sentReferralFactory.build({
          referenceNumber: 'CEF345',
          referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
        })
        const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const assignee = hmppsAuthUserFactory.build({ firstName: 'Bernard', lastName: 'Beaks' })
        const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

        expect(presenter.summary).toEqual([
          {
            key: 'Name',
            lines: ['Johnny Davis'],
          },
          {
            key: 'Referral number',
            lines: ['CEF345'],
          },
          {
            key: 'Service type',
            lines: ['Social inclusion'],
          },
          {
            key: 'Assigned to',
            lines: ['Bernard Beaks'],
          },
        ])
      })
    })

    describe('when the selected caseworker has only a first name', () => {
      it('returns a summary of the selected caseworker with just the first name', () => {
        const sentReferral = sentReferralFactory.build({
          referenceNumber: 'CEF345',
          referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
        })
        const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const assignee = hmppsAuthUserFactory.build({ firstName: 'Bernard', lastName: '' })
        const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

        expect(presenter.summary).toEqual([
          {
            key: 'Name',
            lines: ['Johnny Davis'],
          },
          {
            key: 'Referral number',
            lines: ['CEF345'],
          },
          {
            key: 'Service type',
            lines: ['Social inclusion'],
          },
          {
            key: 'Assigned to',
            lines: ['Bernard '],
          },
        ])
      })
    })

    describe('when the selected caseworker has only a last name', () => {
      it('returns a summary of the selected caseworker with just the last name', () => {
        const sentReferral = sentReferralFactory.build({
          referenceNumber: 'CEF345',
          referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
        })
        const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const assignee = hmppsAuthUserFactory.build({ firstName: '', lastName: 'Beaks' })
        const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

        expect(presenter.summary).toEqual([
          {
            key: 'Name',
            lines: ['Johnny Davis'],
          },
          {
            key: 'Referral number',
            lines: ['CEF345'],
          },
          {
            key: 'Service type',
            lines: ['Social inclusion'],
          },
          {
            key: 'Assigned to',
            lines: [' Beaks'],
          },
        ])
      })
    })

    describe('when the selected caseworker has neither a first or last name', () => {
      it('returns a summary of the selected caseworker with an empty string', () => {
        const sentReferral = sentReferralFactory.build({
          referenceNumber: 'CEF345',
          referral: { serviceUser: { firstName: 'Johnny', lastName: 'Davis' } },
        })
        const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const assignee = hmppsAuthUserFactory.build({ firstName: '', lastName: '' })
        const presenter = new AssignmentConfirmationPresenter(sentReferral, serviceCategory, assignee)

        expect(presenter.summary).toEqual([
          {
            key: 'Name',
            lines: ['Johnny Davis'],
          },
          {
            key: 'Referral number',
            lines: ['CEF345'],
          },
          {
            key: 'Service type',
            lines: ['Social inclusion'],
          },
          {
            key: 'Assigned to',
            lines: [''],
          },
        ])
      })
    })
  })
})
