import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe('CompletionDeadlinePresenter', () => {
  describe('day, month, year', () => {
    describe('when the referral has no completion deadline and there is no user input data', () => {
      it('returns empty strings', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()
        const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

        expect(presenter.day).toBe('')
        expect(presenter.month).toBe('')
        expect(presenter.year).toBe('')
      })
    })

    describe('when the referral has a completion deadline and there is no user input data', () => {
      it('returns the corresponding values from the completion deadline', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory
          .serviceCategorySelected(serviceCategory.id)
          .build({ completionDeadline: '2021-09-12' })
        const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

        expect(presenter.day).toBe('12')
        expect(presenter.month).toBe('9')
        expect(presenter.year).toBe('2021')
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input data, or an empty string if a field is missing', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory
          .serviceCategorySelected(serviceCategory.id)
          .completionDeadlineSet()
          .build()
        const presenter = new CompletionDeadlinePresenter(referral, serviceCategory, null, {
          'completion-deadline-day': 'egg',
          'completion-deadline-month': 7,
        })

        expect(presenter.day).toBe('egg')
        expect(presenter.month).toBe('7')
        expect(presenter.year).toBe('')
      })
    })
  })

  describe('error information', () => {
    describe('when a null error is passed in', () => {
      it('returns no errors', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()
        const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

        expect(presenter.errorMessage).toBeNull()
        expect(presenter.hasDayError).toEqual(false)
        expect(presenter.hasMonthError).toEqual(false)
        expect(presenter.hasYearError).toEqual(false)
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when a non-null error is passed in', () => {
      it('returns error information', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()
        const presenter = new CompletionDeadlinePresenter(referral, serviceCategory, {
          errors: [
            {
              errorSummaryLinkedField: 'completion-deadline-month',
              formFields: ['completion-deadline-month', 'completion-deadline-year'],
              message: 'Please enter a month and a year',
            },
          ],
        })

        expect(presenter.errorMessage).toBe('Please enter a month and a year')
        expect(presenter.hasDayError).toEqual(false)
        expect(presenter.hasMonthError).toEqual(true)
        expect(presenter.hasYearError).toEqual(true)
        expect(presenter.errorSummary).toEqual([
          { message: 'Please enter a month and a year', field: 'completion-deadline-month' },
        ])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()
      const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

      expect(presenter.title).toEqual('What date does the social inclusion service need to be completed by?')
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()
      const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

      expect(presenter.hint).toEqual('For example, 27 10 2021')
    })
  })
})
