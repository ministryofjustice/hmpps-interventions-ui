import TestUtils from '../../../testutils/testUtils'
import EnforceableDaysForm from './enforceableDaysForm'

describe(EnforceableDaysForm, () => {
  describe('data', () => {
    describe('when a valid number of enforceable days is passed', () => {
      it('returns a paramsForUpdate with the maximumEnforceableDays property', async () => {
        const request = TestUtils.createRequest({
          'maximum-enforceable-days': '1',
        })
        const data = await new EnforceableDaysForm(request).data()

        expect(data.paramsForUpdate?.maximumEnforceableDays).toEqual(1)
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the maximum-enforceable-days property is not present', async () => {
      const request = TestUtils.createRequest({})

      const data = await new EnforceableDaysForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'maximum-enforceable-days',
        formFields: ['maximum-enforceable-days'],
        message: 'Enter the maximum number of enforceable days',
      })
    })

    it('returns an error when the maximum-enforceable-days property is not a number', async () => {
      const request = TestUtils.createRequest({
        'maximum-enforceable-days': 'hello',
      })

      const data = await new EnforceableDaysForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'maximum-enforceable-days',
        formFields: ['maximum-enforceable-days'],
        message: 'The maximum number of enforceable days must be a number, like 5',
      })
    })

    it('returns an error when the maximum-enforceable-days property is not a whole number', async () => {
      const request = TestUtils.createRequest({
        'maximum-enforceable-days': '0.5',
      })

      const data = await new EnforceableDaysForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'maximum-enforceable-days',
        formFields: ['maximum-enforceable-days'],
        message: 'The maximum number of enforceable days must be a whole number, like 5',
      })
    })
    it('returns an error when the maximum-enforceable-days property is less than 1', async () => {
      const request = TestUtils.createRequest({
        'maximum-enforceable-days': '0',
      })

      const data = await new EnforceableDaysForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'maximum-enforceable-days',
        formFields: ['maximum-enforceable-days'],
        message: 'The maximum number of enforceable days must be at least 1',
      })
    })
  })
})
