import moment from 'moment-timezone'
import ExpectedReleaseDateForm from './expectedReleaseDateForm'
import TestUtils from '../../../../testutils/testUtils'

describe(ExpectedReleaseDateForm, () => {
  describe('data', () => {
    describe('when a expected release date is known', () => {
      it('returns a paramsForUpdate with the expected release date', async () => {
        const tomorrow = moment().add(1, 'days')
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': tomorrow.format('YYYY'),
          'release-date-month': tomorrow.format('M'),
          'release-date-day': tomorrow.format('D'),
          'release-date-unknown-reason': '',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.paramsForUpdate?.hasExpectedReleaseDate).toEqual(true)
        expect(data.paramsForUpdate?.expectedReleaseDate).toEqual(tomorrow.format('YYYY-MM-DD'))
        expect(data.paramsForUpdate?.expectedReleaseDateMissingReason).toEqual(null)
      })
    })

    describe('when a expected release date is not known', () => {
      it('returns a paramsForUpdate with the reason for why the release date is not known', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'no',
          'release-date-year': null,
          'release-date-month': null,
          'release-date-day': null,
          'release-date-unknown-reason': 'data not received from nDelius',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.paramsForUpdate?.hasExpectedReleaseDate).toEqual(false)
        expect(data.paramsForUpdate?.expectedReleaseDate).toEqual(null)
        expect(data.paramsForUpdate?.expectedReleaseDateMissingReason).toEqual('data not received from nDelius')
      })
    })
  })
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
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-day',
              formFields: ['release-date-day'],
              message: 'Enter the expected release date',
            },
          ],
        })
      })
    })
    describe('when month of the expected release date is not passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': '2021',
          'release-date-month': '',
          'release-date-day': '12',
          'release-date-unknown-reason': '',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-month',
              formFields: ['release-date-month'],
              message: 'Enter the expected release date',
            },
          ],
        })
      })
    })
    describe('when year of the expected release date is not passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': '',
          'release-date-month': '7',
          'release-date-day': '12',
          'release-date-unknown-reason': '',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-year',
              formFields: ['release-date-year'],
              message: 'Enter the expected release date',
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
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-month',
              formFields: ['release-date-month'],
              message: 'Enter date in the correct format',
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
        const data = await new ExpectedReleaseDateForm(request).data()

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
    describe('when an reason for not knowing the expected date is not filled', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'no',
          'release-date-unknown-reason': '',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date-unknown-reason',
              formFields: ['release-date-unknown-reason'],
              message: 'Enter a reason why the expected release date is not known',
            },
          ],
        })
      })
    })
  })
  describe('conditional-validation', () => {
    describe('release date validation does not kicks off when expected date is not known', () => {
      it('returns a paramsForUpdate with the expected release date', async () => {
        const request = TestUtils.createRequest({
          'expected-release-date': 'no',
          'release-date-year': '2021',
          'release-date-month': '',
          'release-date-day': '12',
          'release-date-unknown-reason': 'will be available in nDelius soon',
        })
        const data = await new ExpectedReleaseDateForm(request).data()
        expect(data.error).toEqual(null)
      })
    })

    describe('release unknown reason text validation does not kicks off when expected date is known', () => {
      it('returns a paramsForUpdate with the expected release date', async () => {
        const tomorrow = moment().add(1, 'days')
        const request = TestUtils.createRequest({
          'expected-release-date': 'yes',
          'release-date-year': tomorrow.format('YYYY'),
          'release-date-month': tomorrow.format('M'),
          'release-date-day': tomorrow.format('D'),
          'release-date-unknown-reason': '',
        })
        const data = await new ExpectedReleaseDateForm(request).data()

        expect(data.error).toEqual(null)
      })
    })
  })
})
