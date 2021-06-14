import createError from 'http-errors'
import createFormValidationErrorOrRethrow from './interventionsFormError'

describe(createFormValidationErrorOrRethrow, () => {
  describe('with an error with no validationErrors key', () => {
    it('re-throws the error', () => {
      const error = Error('something went wrong')

      try {
        createFormValidationErrorOrRethrow(error)
      } catch (e) {
        // Jest’s toThrow matcher only lets you check the message
        expect(e).toEqual(error)
        return
      }

      fail('Expected an error to be thrown')
    })
  })

  describe('with an http error with validationErrors in the response body', () => {
    it('returns a validation error', () => {
      const error = createError(400, 'validation error', {
        response: {
          body: {
            validationErrors: [
              { field: 'myFirstField', error: 'SOME_ERROR_CODE_1' },
              { field: 'mySecondField', error: 'SOME_ERROR_CODE_2' },
            ],
          },
        },
      })

      expect(createFormValidationErrorOrRethrow(error)).toEqual({
        errors: [
          {
            formFields: ['my-first-field'],
            errorSummaryLinkedField: 'my-first-field',
            message: 'SOME_ERROR_CODE_1',
          },
          {
            formFields: ['my-second-field'],
            errorSummaryLinkedField: 'my-second-field',
            message: 'SOME_ERROR_CODE_2',
          },
        ],
      })
    })

    describe('when the error is for a date field', () => {
      it('returns an error for the day, month and year fields', () => {
        const error = createError(400, 'validation error', {
          response: {
            body: {
              validationErrors: [{ field: 'completionDeadline', error: 'SOME_ERROR_CODE' }],
            },
          },
        })

        expect(createFormValidationErrorOrRethrow(error)).toEqual({
          errors: [
            {
              formFields: ['completion-deadline-day', 'completion-deadline-month', 'completion-deadline-year'],
              errorSummaryLinkedField: 'completion-deadline-day',
              message: 'SOME_ERROR_CODE',
            },
          ],
        })
      })
    })

    describe('when the field and error correspond to a known message', () => {
      it('inserts that error message', () => {
        const error = createError(400, 'validation error', {
          response: {
            body: {
              validationErrors: [{ field: 'completionDeadline', error: 'DATE_MUST_BE_IN_THE_FUTURE' }],
            },
          },
        })

        expect(createFormValidationErrorOrRethrow(error)).toEqual({
          errors: [
            {
              formFields: ['completion-deadline-day', 'completion-deadline-month', 'completion-deadline-year'],
              errorSummaryLinkedField: 'completion-deadline-day',
              message: 'The date by which the service needs to be completed must be in the future',
            },
          ],
        })
      })
    })
  })
})
