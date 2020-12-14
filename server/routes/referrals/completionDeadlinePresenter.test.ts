import CompletionDeadlinePresenter from './completionDeadlinePresenter'

describe('CompletionDeadlinePresenter', () => {
  describe('day, month, year', () => {
    describe('when the referral has no completion deadline and there is no user input data', () => {
      it('returns empty strings', () => {
        const presenter = new CompletionDeadlinePresenter({
          id: '1',
          completionDeadline: null,
          serviceCategory: {
            id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
            name: 'social inclusion',
          },
        })

        expect(presenter.day).toBe('')
        expect(presenter.month).toBe('')
        expect(presenter.year).toBe('')
      })
    })

    describe('when the referral has a completion deadline and there is no user input data', () => {
      it('returns the corresponding values from the completion deadline', () => {
        const presenter = new CompletionDeadlinePresenter({
          id: '1',
          completionDeadline: '2021-09-12',
          serviceCategory: {
            id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
            name: 'social inclusion',
          },
        })

        expect(presenter.day).toBe('12')
        expect(presenter.month).toBe('9')
        expect(presenter.year).toBe('2021')
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input data, or an empty string if a field is missing', () => {
        const presenter = new CompletionDeadlinePresenter(
          {
            id: '1',
            completionDeadline: '2021-09-12',
            serviceCategory: {
              id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
              name: 'social inclusion',
            },
          },
          null,
          {
            'completion-deadline-day': 'egg',
            'completion-deadline-month': 7,
          }
        )

        expect(presenter.day).toBe('egg')
        expect(presenter.month).toBe('7')
        expect(presenter.year).toBe('')
      })
    })
  })

  describe('error information', () => {
    describe('when no errors are passed in', () => {
      it('returns no errors', () => {
        const presenter = new CompletionDeadlinePresenter({
          id: '1',
          completionDeadline: null,
          serviceCategory: {
            id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
            name: 'social inclusion',
          },
        })

        expect(presenter.errorMessage).toBeNull()
        expect(presenter.erroredFields).toEqual([])
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when errors are passed in', () => {
      it('returns error information', () => {
        const presenter = new CompletionDeadlinePresenter(
          {
            id: '1',
            completionDeadline: null,
            serviceCategory: {
              id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
              name: 'social inclusion',
            },
          },
          {
            firstErroredField: 'month',
            erroredFields: ['month', 'year'],
            message: 'Please enter a month and a year',
          }
        )

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
      const presenter = new CompletionDeadlinePresenter({
        id: '1',
        completionDeadline: null,
        serviceCategory: {
          id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
          name: 'social inclusion',
        },
      })

      expect(presenter.title).toEqual('What date does the social inclusion service need to be completed by?')
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const presenter = new CompletionDeadlinePresenter({
        id: '1',
        completionDeadline: null,
        serviceCategory: {
          id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
          name: 'social inclusion',
        },
      })

      expect(presenter.hint).toEqual('For example, 27 10 2021')
    })
  })
})
