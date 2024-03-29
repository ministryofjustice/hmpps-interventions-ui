import EnforceableDaysPresenter from './enforceableDaysPresenter'

describe(EnforceableDaysPresenter, () => {
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new EnforceableDaysPresenter('crn', 10)

      expect(presenter.text.title).toEqual('How many days will you use for this service?')
      expect(presenter.text.hintParagraphs).toEqual([
        'You are setting the maximum number of days you want to use and any unused days will be given back. For community orders or suspended sentences, consider how many RAR days to allocate.',
        'Note: Sessions delivered in the community are enforceable.',
      ])
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new EnforceableDaysPresenter('crn', 10)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new EnforceableDaysPresenter('crn', null, null, null, {
          errors: [
            {
              formFields: ['maximum-enforceable-days'],
              errorSummaryLinkedField: 'maximum-enforceable-days',
              message: 'Something went wrong, please try again',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Something went wrong, please try again')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new EnforceableDaysPresenter('crn', 10)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new EnforceableDaysPresenter('crn', null, null, null, {
          errors: [
            {
              formFields: ['maximum-enforceable-days'],
              errorSummaryLinkedField: 'maximum-enforceable-days',
              message: 'Something went wrong, please try again',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'maximum-enforceable-days',
            message: 'Something went wrong, please try again',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('maximumEnforceableDays', () => {
      describe('when no maximum enforceable days have been set', () => {
        it('uses an empty string value as the field value', () => {
          const presenter = new EnforceableDaysPresenter('crn', null, null, null)

          expect(presenter.fields.maximumEnforceableDays).toEqual('')
        })
      })

      describe('when the referral already has enforceable days set and there is no user input data', () => {
        it('uses that value as the field value', () => {
          const presenter = new EnforceableDaysPresenter('crn', 4, null, null)

          expect(presenter.fields.maximumEnforceableDays).toEqual('4')
        })
      })

      describe('when there is user input data but no enforceable days value set on the referral', () => {
        it('uses that value as the field value', () => {
          const presenter = new EnforceableDaysPresenter('crn', null, null, null, null, {
            'maximum-enforceable-days': '6',
          })

          expect(presenter.fields.maximumEnforceableDays).toEqual('6')
        })
      })

      describe('when the referral already has further information and there is user input data', () => {
        it('sets the new input data as the value', () => {
          const presenter = new EnforceableDaysPresenter('crn', 4, null, null, null, {
            'maximum-enforceable-days': '6',
          })

          expect(presenter.fields.maximumEnforceableDays).toEqual('6')
        })
      })
    })
  })
})
