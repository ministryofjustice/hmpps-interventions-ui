import moment from 'moment-timezone'
import AmendExpectedReleaseDateForm from './amendExpectedReleaseDateForm'
import TestUtils from '../../../../testutils/testUtils'

describe(AmendExpectedReleaseDateForm, () => {
  describe('data', () => {
    describe('when expected release date is passed', () => {
      it('returns a paramsForUpdate with the expected release date', async () => {
        const tomorrow = moment().add(1, 'days')
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const request = TestUtils.createRequest({
          'release-date': 'confirm',
          'amend-expected-release-date-year': tomorrow.format('YYYY'),
          'amend-expected-release-date-month': tomorrow.format('M'),
          'amend-expected-release-date-day': tomorrow.format('D'),
          'amend-date-unknown-reason': null,
        })
        const data = await new AmendExpectedReleaseDateForm(request, yesterday).data()

        expect(data.paramsForUpdate?.expectedReleaseDate).toEqual(tomorrow.format('YYYY-MM-DD'))
        expect(data.paramsForUpdate?.expectedReleaseDateMissingReason).toBeNull()
      })
    })
    describe('when expected release date not unknown reason is passed', () => {
      it('returns a paramsForUpdate with the expected release date unknown reason', async () => {
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const request = TestUtils.createRequest({
          'release-date': 'change',
          'amend-expected-release-date': null,
          'amend-date-unknown-reason': 'some reason',
        })
        const data = await new AmendExpectedReleaseDateForm(request, yesterday).data()

        expect(data.paramsForUpdate?.expectedReleaseDate).toBeNull()
        expect(data.paramsForUpdate?.expectedReleaseDateMissingReason).toEqual('some reason')
      })
    })
  })

  describe('invalid-data', () => {
    describe('when day of the expected release date is not passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const tomorrow = moment().add(1, 'days')
        const request = TestUtils.createRequest({
          'release-date': 'confirm',
          'amend-expected-release-date-year': tomorrow.format('YYYY'),
          'amend-expected-release-date-month': tomorrow.format('M'),
          'amend-expected-release-date-day': '',
          'amend-expected-release-date-unknown-reason': '',
        })
        const data = await new AmendExpectedReleaseDateForm(request, yesterday).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'amend-expected-release-date-day',
              formFields: ['amend-expected-release-date-day'],
              message: 'Enter the expected release date',
            },
          ],
        })
      })
    })

    describe('when an invalid expected release date is passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const tomorrow = moment().add(1, 'days')
        const request = TestUtils.createRequest({
          'release-date': 'confirm',
          'amend-expected-release-date-year': tomorrow.format('YYYY'),
          'amend-expected-release-date-month': '7.5',
          'amend-expected-release-date-day': tomorrow.format('D'),
          'amend-expected-release-date-unknown-reason': '',
        })
        const data = await new AmendExpectedReleaseDateForm(request, yesterday).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'amend-expected-release-date-month',
              formFields: ['amend-expected-release-date-month'],
              message: 'Enter date in the correct format',
            },
          ],
        })
      })
    })
    describe('when a past expected release date is passed', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const existingDate = moment().subtract(30, 'days').format('YYYY-MM-DD')
        const updatedDate = moment().subtract(20, 'days')
        const request = TestUtils.createRequest({
          'release-date': 'confirm',
          'amend-expected-release-date-year': updatedDate.format('YYYY'),
          'amend-expected-release-date-month': updatedDate.format('M'),
          'amend-expected-release-date-day': updatedDate.format('D'),
          'amend-expected-release-date-reason': '',
        })
        const data = await new AmendExpectedReleaseDateForm(request, existingDate).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'amend-expected-release-date-day',
              formFields: ['amend-expected-release-date-day'],
              message: 'Enter date in the future',
            },
          ],
        })
      })
    })

    describe('when the same expected release date is submitted', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const tomorrow = moment().add(1, 'days')
        const request = TestUtils.createRequest({
          'release-date': 'confirm',
          'amend-expected-release-date-year': tomorrow.format('YYYY'),
          'amend-expected-release-date-month': tomorrow.format('M'),
          'amend-expected-release-date-day': tomorrow.format('DD'),
          'amend-expected-release-date-unknown-reason': '',
        })
        const data = await new AmendExpectedReleaseDateForm(request, tomorrow.format('YYYY-MM-DD')).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'amend-expected-release-date',
              formFields: ['amend-expected-release-date'],
              message: 'Enter a different expected release date',
            },
          ],
        })
      })
    })

    describe('when the same expected release date unknown reason is submitted', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const yesterday = moment().subtract(1, 'days')
        const request = TestUtils.createRequest({
          'release-date': 'change',
          'amend-expected-release-date': null,
          'amend-date-unknown-reason': 'some reason',
        })
        const data = await new AmendExpectedReleaseDateForm(
          request,
          yesterday.format('YYYY-MM-DD'),
          'some reason'
        ).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'amend-date-unknown-reason',
              formFields: ['amend-date-unknown-reason'],
              message: 'Enter a different expected release date unknown reason',
            },
          ],
        })
      })
    })

    describe('when the form is submitted without selecting the radion button', () => {
      it('returns a validation error with the appropriate error message', async () => {
        const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const request = TestUtils.createRequest({
          'release-date': '',
        })
        const data = await new AmendExpectedReleaseDateForm(request, yesterday).data()

        expect(data.error).toEqual({
          errors: [
            {
              errorSummaryLinkedField: 'release-date',
              formFields: ['release-date'],
              message: 'Select an option',
            },
          ],
        })
      })
    })
  })
})
