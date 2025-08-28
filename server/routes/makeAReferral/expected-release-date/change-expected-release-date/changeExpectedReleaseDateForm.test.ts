import TestUtils from '../../../../../testutils/testUtils'
import ChangeExpectedReleaseDateForm from './changeExpectedReleaseDateForm'

describe(ChangeExpectedReleaseDateForm, () => {
  describe('invalid-data', () => {
    describe('when day of the expected release date is not passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': '2021',
          'release-date-month': '09',
          'release-date-day': '',
          'release-date-unknown-reason': '',
        })
        const data = await new ChangeExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-day',
              formFields: ['release-date-day'],
              message: 'Expected release date must include a day',
            },
          ],
        })
      })
    })

    describe('when an invalid expected release date is passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': '2023',
          'release-date-month': '7.5',
          'release-date-day': '12',
          'release-date-unknown-reason': '',
        })
        const data = await new ChangeExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-month',
              formFields: ['release-date-month'],
              message: 'Expected release date must be in the correct format',
            },
          ],
        })
      })
    })
    describe('when a past expected release date is passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': '2022',
          'release-date-month': '12',
          'release-date-day': '12',
          'release-date-unknown-reason': '',
        })
        const data = await new ChangeExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-day',
              formFields: ['release-date-day'],
              message: 'Enter date in the future',
            },
          ],
        })
      })
    })
  })
})
