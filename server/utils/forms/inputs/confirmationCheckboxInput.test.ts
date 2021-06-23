import TestUtils from '../../../../testutils/testUtils'
import ConfirmationCheckboxInput from './confirmationCheckboxInput'

describe(ConfirmationCheckboxInput, () => {
  const errorMessage = 'error'

  describe('validate', () => {
    describe('checkbox has been checked', () => {
      it('returns a true value with no error', async () => {
        const request = TestUtils.createRequest({
          'confirm-approval': ['confirmed'],
        })

        const result = await new ConfirmationCheckboxInput(
          request,
          'confirm-approval',
          'confirmed',
          errorMessage
        ).validate()

        expect(result.value).toBe(true)
      })
    })

    describe('checkbox has not been checked', () => {
      it('returns an error', async () => {
        const request = TestUtils.createRequest({})

        const result = await new ConfirmationCheckboxInput(
          request,
          'confirm-approval',
          'confirmed',
          errorMessage
        ).validate()

        expect(result.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'confirm-approval',
              formFields: ['confirm-approval'],
              message: errorMessage,
            },
          ],
        })
      })
    })
  })
})
