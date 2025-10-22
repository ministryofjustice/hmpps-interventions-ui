import TestUtils from '../../../../testutils/testUtils'
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
        message: 'Enter the number of days you will use for this service',
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
        message: 'The number of days must be a number between 1 and 100',
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
        message: 'The number of days must be a whole number between 1 and 100',
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
        message: 'The number of days must be a number between 1 and 100',
      })
    })

    it('returns an error when the maximum-enforceable-days property is more than 100', async () => {
      const request = TestUtils.createRequest({
        'maximum-enforceable-days': '101',
      })

      const data = await new EnforceableDaysForm(request).data()

      expect(data.error?.errors).toContainEqual({
        errorSummaryLinkedField: 'maximum-enforceable-days',
        formFields: ['maximum-enforceable-days'],
        message: 'The number of days must be 100 or fewer',
      })
    })
  })
})
