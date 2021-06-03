import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import interventionFactory from '../../../testutils/factories/intervention'

describe('CompletionDeadlinePresenter', () => {
  const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
  describe('day, month, year', () => {
    describe('when the referral has no completion deadline and there is no user input data', () => {
      it('returns empty strings', () => {
        const referral = draftReferralFactory.build()
        const presenter = new CompletionDeadlinePresenter(referral, intervention)

        expect(presenter.fields.completionDeadline.day.value).toBe('')
        expect(presenter.fields.completionDeadline.month.value).toBe('')
        expect(presenter.fields.completionDeadline.year.value).toBe('')
      })
    })

    describe('when the referral has a completion deadline and there is no user input data', () => {
      it('returns the corresponding values from the completion deadline', () => {
        const referral = draftReferralFactory.build({ completionDeadline: '2021-09-12' })
        const presenter = new CompletionDeadlinePresenter(referral, intervention)

        expect(presenter.fields.completionDeadline.day.value).toBe('12')
        expect(presenter.fields.completionDeadline.month.value).toBe('9')
        expect(presenter.fields.completionDeadline.year.value).toBe('2021')
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input data, or an empty string if a field is missing', () => {
        const referral = draftReferralFactory.completionDeadlineSet().build()
        const presenter = new CompletionDeadlinePresenter(referral, intervention, null, {
          'completion-deadline-day': 'egg',
          'completion-deadline-month': '7',
        })

        expect(presenter.fields.completionDeadline.day.value).toBe('egg')
        expect(presenter.fields.completionDeadline.month.value).toBe('7')
        expect(presenter.fields.completionDeadline.year.value).toBe('')
      })
    })
  })

  describe('error information', () => {
    describe('when a null error is passed in', () => {
      it('returns no errors', () => {
        const referral = draftReferralFactory.build()
        const presenter = new CompletionDeadlinePresenter(referral, intervention)

        expect(presenter.fields.completionDeadline.errorMessage).toBeNull()
        expect(presenter.fields.completionDeadline.day.hasError).toEqual(false)
        expect(presenter.fields.completionDeadline.month.hasError).toEqual(false)
        expect(presenter.fields.completionDeadline.year.hasError).toEqual(false)
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when a non-null error is passed in', () => {
      it('returns error information', () => {
        const referral = draftReferralFactory.build()
        const presenter = new CompletionDeadlinePresenter(referral, intervention, {
          errors: [
            {
              errorSummaryLinkedField: 'completion-deadline-month',
              formFields: ['completion-deadline-month', 'completion-deadline-year'],
              message: 'Please enter a month and a year',
            },
          ],
        })

        expect(presenter.fields.completionDeadline.errorMessage).toBe('Please enter a month and a year')
        expect(presenter.fields.completionDeadline.day.hasError).toEqual(false)
        expect(presenter.fields.completionDeadline.month.hasError).toEqual(true)
        expect(presenter.fields.completionDeadline.year.hasError).toEqual(true)
        expect(presenter.errorSummary).toEqual([
          { message: 'Please enter a month and a year', field: 'completion-deadline-month' },
        ])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const referral = draftReferralFactory.build()
      const presenter = new CompletionDeadlinePresenter(referral, intervention)

      expect(presenter.title).toEqual("What date does the Women's service referral need to be completed by?")
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const referral = draftReferralFactory.build()
      const presenter = new CompletionDeadlinePresenter(referral, intervention)

      expect(presenter.hint).toEqual('For example, 27 10 2021')
    })
  })
})
