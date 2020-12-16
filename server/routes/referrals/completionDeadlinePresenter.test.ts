import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'

describe('CompletionDeadlinePresenter', () => {
  describe('day, month, year', () => {
    describe('when the referral has no completion deadline and there is no user input data', () => {
      it('returns empty strings', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CompletionDeadlinePresenter(referral)

        expect(presenter.day).toBe('')
        expect(presenter.month).toBe('')
        expect(presenter.year).toBe('')
      })
    })

    describe('when the referral has a completion deadline and there is no user input data', () => {
      it('returns the corresponding values from the completion deadline', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build({ completionDeadline: '2021-09-12' })
        const presenter = new CompletionDeadlinePresenter(referral)

        expect(presenter.day).toBe('12')
        expect(presenter.month).toBe('9')
        expect(presenter.year).toBe('2021')
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input data, or an empty string if a field is missing', () => {
        const referral = draftReferralFactory.serviceCategorySelected().completionDeadlineSet().build()
        const presenter = new CompletionDeadlinePresenter(referral, null, {
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
    describe('when no errors are passed in', () => {
      it('returns no errors', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CompletionDeadlinePresenter(referral)

        expect(presenter.errorMessage).toBeNull()
        expect(presenter.erroredFields).toEqual([])
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when errors are passed in', () => {
      it('returns error information', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new CompletionDeadlinePresenter(referral, {
          firstErroredField: 'month',
          erroredFields: ['month', 'year'],
          message: 'Please enter a month and a year',
        })

        expect(presenter.errorMessage).toBe('Please enter a month and a year')
        expect(presenter.erroredFields).toEqual(['month', 'year'])
        expect(presenter.errorSummary).toEqual({
          errors: [{ message: 'Please enter a month and a year', linkedField: 'month' }],
        })
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .build({ serviceCategory: { name: 'social inclusion' } })
      const presenter = new CompletionDeadlinePresenter(referral)

      expect(presenter.title).toEqual('What date does the social inclusion service need to be completed by?')
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const referral = draftReferralFactory.serviceCategorySelected().build()
      const presenter = new CompletionDeadlinePresenter(referral)

      expect(presenter.hint).toEqual('For example, 27 10 2021')
    })
  })
})
