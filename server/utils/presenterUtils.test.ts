import PresenterUtils from './presenterUtils'
import draftReferralFactory from '../../testutils/factories/draftReferral'
import CalendarDay from './calendarDay'
import Duration from './duration'
import ClockTime from './clockTime'
import { FormValidationError } from './formValidationError'

describe(PresenterUtils, () => {
  describe('stringValue', () => {
    describe('when the model has a null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns an empty string', () => {
          const utils = new PresenterUtils(null)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns an empty string', () => {
          const userInputData = { 'additional-needs-information': null }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns an empty string', () => {
          const userInputData = {}
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is an empty string', () => {
        it('returns an empty string', () => {
          const userInputData = { 'additional-needs-information': '' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is a non-empty string', () => {
        it('returns the user input value', () => {
          const userInputData = { 'additional-needs-information': 'bar' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('bar')
        })
      })

      describe('when there is user input data and the user input value for the property is present but neither a string nor null', () => {
        it('returns the stringified user input value', () => {
          const userInputData = { 'additional-needs-information': 100 }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue(null, 'additional-needs-information')).toBe('100')
        })
      })
    })

    describe('when the model has a non-null value for the property', () => {
      describe('when there is no user input data', () => {
        describe('when the model’s value is a string', () => {
          it('returns the value from the referral', () => {
            const utils = new PresenterUtils(null)

            expect(utils.stringValue('foo', 'additional-needs-information')).toBe('foo')
          })
        })

        describe('when the model’s value is a number', () => {
          it('returns the formatted value from the referral', () => {
            const utils = new PresenterUtils(null)

            expect(utils.stringValue(10, 'maximum-enforceable-days')).toBe('10')
          })
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns an empty string', () => {
          const userInputData = { 'additional-needs-information': null }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue('foo', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns an empty string', () => {
          const userInputData = {}
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue('foo', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is an empty string', () => {
        it('returns an empty string', () => {
          const userInputData = { 'additional-needs-information': '' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue('foo', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is a non-empty string', () => {
        it('returns the user input value', () => {
          const userInputData = { 'additional-needs-information': 'bar' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue('foo', 'additional-needs-information')).toBe('bar')
        })
      })

      describe('when there is user input data and the user input value for the property is present but neither a string nor null', () => {
        it('returns the stringified user input value', () => {
          const userInputData = { 'additional-needs-information': 100 }
          const utils = new PresenterUtils(userInputData)

          expect(utils.stringValue('foo', 'additional-needs-information')).toBe('100')
        })
      })
    })
  })

  describe('booleanValue', () => {
    describe('when the model has a null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns null', () => {
          const utils = new PresenterUtils(null)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns null', () => {
          const userInputData = { 'needs-interpreter': null }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns null', () => {
          const userInputData = {}
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBe(null)
        })
      })

      describe("when there is user input data and the user input value for the property is 'no'", () => {
        it('returns false', () => {
          const userInputData = { 'needs-interpreter': 'no' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBe(false)
        })
      })

      describe("when there is user input data and the user input value for the property is 'yes'", () => {
        it('returns true', () => {
          const userInputData = { 'needs-interpreter': 'yes' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBe(true)
        })
      })

      describe("when there is user input data and the user input value for the property is present but neither 'yes', 'no' nor null", () => {
        it('returns null', () => {
          const userInputData = { 'needs-interpreter': true }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(null, 'needs-interpreter')).toBeNull()
        })
      })
    })

    describe('when the model has a non-null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns the value from the referral', () => {
          const utils = new PresenterUtils(null)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBe(false)
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns null', () => {
          const userInputData = { 'needs-interpreter': null }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns null', () => {
          const userInputData = {}
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBe(null)
        })
      })

      describe("when there is user input data and the user input value for the property is 'no'", () => {
        it('returns false', () => {
          const userInputData = { 'needs-interpreter': 'no' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBe(false)
        })
      })

      describe("when there is user input data and the user input value for the property is 'yes'", () => {
        it('returns true', () => {
          const userInputData = { 'needs-interpreter': 'yes' }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBe(true)
        })
      })

      describe("when there is user input data and the user input value for the property is present but neither 'yes', 'no' nor null", () => {
        it('returns null', () => {
          const userInputData = { 'needs-interpreter': true }
          const utils = new PresenterUtils(userInputData)

          expect(utils.booleanValue(false, 'needs-interpreter')).toBeNull()
        })
      })
    })
  })

  describe('dateValue', () => {
    describe('day, month, year values', () => {
      describe('when the model has a null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns empty strings', () => {
            const utils = new PresenterUtils(null)
            const value = utils.dateValue(null, 'completion-deadline', null)

            expect(value).toMatchObject({ day: { value: '' }, month: { value: '' }, year: { value: '' } })
          })
        })
      })

      describe('when the model has a non-null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns the corresponding values from the model', () => {
            const utils = new PresenterUtils(null)
            const value = utils.dateValue(CalendarDay.fromComponents(12, 9, 2021), 'completion-deadline', null)

            expect(value).toMatchObject({ day: { value: '12' }, month: { value: '9' }, year: { value: '2021' } })
          })
        })
      })

      describe('when there is user input data', () => {
        it('returns the user input data, or an empty string if a field is missing', () => {
          const utils = new PresenterUtils({ 'completion-deadline-day': 'egg', 'completion-deadline-month': 7 })
          const value = utils.dateValue(CalendarDay.fromComponents(12, 9, 2021), 'completion-deadline', null)

          expect(value.day.value).toBe('egg')
          expect(value.month.value).toBe('7')
          expect(value.year.value).toBe('')
        })
      })
    })

    describe('error information', () => {
      describe('when a null error is passed in', () => {
        it('returns no errors', () => {
          const utils = new PresenterUtils(null)
          const value = utils.dateValue(null, 'completion-deadline', null)

          expect(value.errorMessage).toBeNull()
          expect(value.day.hasError).toEqual(false)
          expect(value.month.hasError).toEqual(false)
          expect(value.year.hasError).toEqual(false)
        })
      })

      describe('when a non-null error is passed in', () => {
        it('returns error information', () => {
          const utils = new PresenterUtils(null)
          const value = utils.dateValue(null, 'completion-deadline', {
            errors: [
              {
                errorSummaryLinkedField: 'completion-deadline-month',
                formFields: ['completion-deadline-month', 'completion-deadline-year'],
                message: 'Please enter a month and a year',
              },
            ],
          })

          expect(value.errorMessage).toBe('Please enter a month and a year')
          expect(value.day.hasError).toEqual(false)
          expect(value.month.hasError).toEqual(true)
          expect(value.year.hasError).toEqual(true)
        })
      })
    })
  })

  describe('durationValue', () => {
    describe('hours, minutes values', () => {
      describe('when the model has a null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns empty strings', () => {
            const utils = new PresenterUtils(null)
            const value = utils.durationValue(null, 'duration', null)

            expect(value).toMatchObject({ hours: { value: '' }, minutes: { value: '' } })
          })
        })
      })

      describe('when the model has a non-null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns the corresponding values from the model', () => {
            const utils = new PresenterUtils(null)
            const value = utils.durationValue(Duration.fromUnits(0, 75, 0), 'duration', null)

            expect(value).toMatchObject({ hours: { value: '1' }, minutes: { value: '15' } })
          })
        })
      })

      describe('when there is user input data', () => {
        it('returns the user input data', () => {
          const utils = new PresenterUtils({ 'duration-hours': 'egg', 'duration-minutes': 7 })
          const value = utils.durationValue(Duration.fromUnits(0, 75, 0), 'duration', null)

          expect(value.hours.value).toBe('egg')
          expect(value.minutes.value).toBe('7')
        })

        it('returns an empty string if a field is missing', () => {
          const utils = new PresenterUtils({ 'duration-hours': 7 })
          const value = utils.durationValue(Duration.fromUnits(0, 75, 0), 'duration', null)

          expect(value.hours.value).toBe('7')
          expect(value.minutes.value).toBe('')
        })
      })
    })

    describe('error information', () => {
      describe('when a null error is passed in', () => {
        it('returns no errors', () => {
          const utils = new PresenterUtils(null)
          const value = utils.durationValue(null, 'duration', null)

          expect(value.errorMessage).toBeNull()
          expect(value.hours.hasError).toEqual(false)
          expect(value.minutes.hasError).toEqual(false)
        })
      })

      describe('when a non-null error is passed in', () => {
        it('returns error information', () => {
          const utils = new PresenterUtils(null)
          const value = utils.durationValue(null, 'duration', {
            errors: [
              {
                errorSummaryLinkedField: 'duration-minutes',
                formFields: ['duration-minutes'],
                message: 'Please enter a number of minutes',
              },
            ],
          })

          expect(value.errorMessage).toBe('Please enter a number of minutes')
          expect(value.hours.hasError).toEqual(false)
          expect(value.minutes.hasError).toEqual(true)
        })
      })
    })
  })

  describe('twelveHourTimeValue', () => {
    describe('hour, minute values', () => {
      describe('when the model has a null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns empty strings', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(null, 'start-time', null)

            expect(value).toMatchObject({ hour: { value: '' }, minute: { value: '' } })
          })
        })
      })

      describe('when the model has a non-null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns the corresponding values from the model', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(
              ClockTime.fromTwentyFourHourComponents(10, 15, 23),
              'start-time',
              null
            )

            expect(value).toMatchObject({ hour: { value: '10' }, minute: { value: '15' } })
          })

          it('returns the correct 12-hour clock hour value', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(
              ClockTime.fromTwentyFourHourComponents(22, 15, 23),
              'start-time',
              null
            )

            expect(value).toMatchObject({ hour: { value: '10' }, minute: { value: '15' } })
          })

          it('pads the minute value to 2 digits', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(
              ClockTime.fromTwentyFourHourComponents(10, 5, 23),
              'start-time',
              null
            )

            expect(value).toMatchObject({ hour: { value: '10' }, minute: { value: '05' } })
          })
        })
      })

      describe('when there is user input data', () => {
        it('returns the user input data', () => {
          const utils = new PresenterUtils({ 'start-time-hour': 'egg', 'start-time-minute': 7 })
          const value = utils.twelveHourTimeValue(ClockTime.fromTwentyFourHourComponents(10, 5, 23), 'start-time', null)

          expect(value.hour.value).toBe('egg')
          expect(value.minute.value).toBe('7')
        })

        it('returns an empty string if a field is missing', () => {
          const utils = new PresenterUtils({ 'start-time-hour': 7 })
          const value = utils.twelveHourTimeValue(ClockTime.fromTwentyFourHourComponents(10, 5, 23), 'start-time', null)

          expect(value.hour.value).toBe('7')
          expect(value.minute.value).toBe('')
        })
      })
    })

    describe('part of day value', () => {
      describe('when the model has a null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns null', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(null, 'start-time', null)

            expect(value).toMatchObject({ partOfDay: { value: null } })
          })
        })
      })

      describe('when the model has a non-null value for the property', () => {
        describe('and there is no user input data', () => {
          it('returns "am" when the time from the model is before midday', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(
              ClockTime.fromTwentyFourHourComponents(10, 15, 23),
              'start-time',
              null
            )

            expect(value).toMatchObject({ partOfDay: { value: 'am' } })
          })

          it('returns "pm" when the time from the model is after midday', () => {
            const utils = new PresenterUtils(null)
            const value = utils.twelveHourTimeValue(
              ClockTime.fromTwentyFourHourComponents(22, 15, 23),
              'start-time',
              null
            )

            expect(value).toMatchObject({ partOfDay: { value: 'pm' } })
          })
        })
      })

      describe('when there is user input data', () => {
        it('returns the user input data if a valid option was chosen', () => {
          const modelValue = ClockTime.fromTwentyFourHourComponents(10, 5, 23)

          expect(
            new PresenterUtils({ 'start-time-part-of-day': 'am' }).twelveHourTimeValue(modelValue, 'start-time', null)
              .partOfDay.value
          ).toEqual('am')

          expect(
            new PresenterUtils({ 'start-time-part-of-day': 'pm' }).twelveHourTimeValue(modelValue, 'start-time', null)
              .partOfDay.value
          ).toEqual('pm')
        })

        it('returns null if an invalid option was chosen', () => {
          const modelValue = ClockTime.fromTwentyFourHourComponents(10, 5, 23)

          expect(
            new PresenterUtils({ 'start-time-part-of-day': 'egg' }).twelveHourTimeValue(modelValue, 'start-time', null)
              .partOfDay.value
          ).toBeNull()
        })

        it('returns null if the field is missing', () => {
          const modelValue = ClockTime.fromTwentyFourHourComponents(10, 5, 23)

          expect(new PresenterUtils({}).twelveHourTimeValue(modelValue, 'start-time', null).partOfDay.value).toBeNull()
        })
      })
    })

    describe('error information', () => {
      describe('when a null error is passed in', () => {
        it('returns no errors', () => {
          const utils = new PresenterUtils(null)
          const value = utils.twelveHourTimeValue(null, 'start-time', null)

          expect(value.errorMessage).toBeNull()
          expect(value.hour.hasError).toEqual(false)
          expect(value.minute.hasError).toEqual(false)
          expect(value.partOfDay.hasError).toEqual(false)
        })
      })

      describe('when a non-null error is passed in', () => {
        it('returns error information', () => {
          const utils = new PresenterUtils(null)
          const value = utils.twelveHourTimeValue(null, 'start-time', {
            errors: [
              {
                errorSummaryLinkedField: 'start-time-hour',
                formFields: ['start-time-hour', 'start-time-part-of-day'],
                message: 'Please enter an hour and select whether the time is in the AM or the PM',
              },
            ],
          })

          expect(value.errorMessage).toBe('Please enter an hour and select whether the time is in the AM or the PM')
          expect(value.hour.hasError).toEqual(true)
          expect(value.minute.hasError).toEqual(false)
          expect(value.partOfDay.hasError).toEqual(true)
        })
      })
    })
  })

  describe('meetingMethod', () => {
    describe('when there is no user input data', () => {
      describe('and the model has a null value', () => {
        it('returns a null value', () => {
          const utils = new PresenterUtils(null)
          const value = utils.meetingMethodValue(null, 'meeting-method', null)
          expect(value).toMatchObject({ errorMessage: null, value: null })
        })
      })
      describe('and the model has a value', () => {
        it('returns the model value', () => {
          const utils = new PresenterUtils(null)
          const value = utils.meetingMethodValue('PHONE_CALL', 'meeting-method', null)
          expect(value).toMatchObject({ errorMessage: null, value: 'PHONE_CALL' })
        })
      })
    })

    describe('when there is user input data', () => {
      describe('and the data is valid', () => {
        it('returns a meeting method', () => {
          const utils = new PresenterUtils({ 'meeting-method': 'PHONE_CALL' })
          const value = utils.meetingMethodValue(null, 'meeting-method', null)
          expect(value).toMatchObject({ errorMessage: null, value: 'PHONE_CALL' })
        })
      })
      describe('and the data is invalid', () => {
        it('returns a null value', () => {
          const utils = new PresenterUtils({ 'meeting-method': 'INVALID' })
          const value = utils.meetingMethodValue(null, 'meeting-method', null)
          expect(value).toMatchObject({ errorMessage: null, value: null })
        })
      })
    })
  })

  describe('address', () => {
    describe('when there are errors', () => {
      it('they should be linked to the correct field', () => {
        const utils = new PresenterUtils(null)
        const errors: FormValidationError = {
          errors: [
            {
              formFields: ['method-other-location-address-line-1'],
              errorSummaryLinkedField: 'method-other-location-address-line-1',
              message: 'address-line-1 error',
            },
            {
              formFields: ['method-other-location-address-postcode'],
              errorSummaryLinkedField: 'method-other-location-address-postcode',
              message: 'address-postcode error',
            },
          ],
        }
        const value = utils.addressValue(null, 'method-other-location', errors)
        expect(value).toMatchObject({
          errors: {
            firstAddressLine: 'address-line-1 error',
            postcode: 'address-postcode error',
          },
        })
      })
    })

    describe('when there is no user input data', () => {
      describe('and the model has a null value', () => {
        it('returns a null value', () => {
          const utils = new PresenterUtils(null)
          const value = utils.addressValue(null, 'method-other-location', null)
          expect(value).toMatchObject({ value: null })
        })
      })
      describe('and the model has a value', () => {
        it('returns the model value', () => {
          const utils = new PresenterUtils(null)
          const address = {
            firstAddressLine: 'Harmony Living Office, Room 4',
            secondAddressLine: '44 Bouverie Road',
            townOrCity: 'Blackpool',
            county: 'Lancashire',
            postCode: 'SY4 0RE',
          }
          const value = utils.addressValue(address, 'method-other-location', null)
          expect(value).toMatchObject({ value: address })
        })
      })
    })

    describe('when there is user input data', () => {
      describe('and the data is valid', () => {
        it('returns an address', () => {
          const utils = new PresenterUtils({
            'method-other-location-address-line-1': 'a',
            'method-other-location-address-line-2': 'b',
            'method-other-location-address-town-or-city': 'c',
            'method-other-location-address-county': 'd',
            'method-other-location-address-postcode': 'e',
          })
          const value = utils.addressValue(null, 'method-other-location', null)
          expect(value).toMatchObject({
            value: {
              firstAddressLine: 'a',
              secondAddressLine: 'b',
              townOrCity: 'c',
              county: 'd',
              postCode: 'e',
            },
          })
        })
      })
      describe('and the data is invalid', () => {
        it('returns a empty values', () => {
          const utils = new PresenterUtils({ invalid: 'INVALID' })
          const value = utils.addressValue(null, 'method-other-location', null)
          expect(value).toMatchObject({
            value: {
              firstAddressLine: '',
              secondAddressLine: '',
              townOrCity: '',
              county: '',
              postCode: '',
            },
          })
        })
      })
    })
  })

  describe('.errorSummary', () => {
    describe('with null error', () => {
      it('returns null', () => {
        expect(PresenterUtils.errorSummary(null, { fieldOrder: ['first', 'second', 'third'] })).toBeNull()
      })
    })

    describe('with an empty errors array', () => {
      it('returns an empty array', () => {
        expect(PresenterUtils.errorSummary({ errors: [] }, { fieldOrder: ['first', 'second', 'third'] })).toEqual([])
      })
    })

    describe('when the errors array is non-empty', () => {
      it('returns an error summary ordered according to the errorSummaryLinkedFields’ positions in the fieldOrder array', () => {
        expect(
          PresenterUtils.errorSummary(
            {
              errors: [
                { errorSummaryLinkedField: 'second', message: 'second msg' },
                { errorSummaryLinkedField: 'first', message: 'first msg' },
                { errorSummaryLinkedField: 'third', message: 'third msg' },
              ],
            },
            { fieldOrder: ['first', 'second', 'third'] }
          )
        ).toEqual([
          { field: 'first', message: 'first msg' },
          { field: 'second', message: 'second msg' },
          { field: 'third', message: 'third msg' },
        ])
      })

      it('does not modify the error', () => {
        const original = {
          errors: [
            { errorSummaryLinkedField: 'second', message: '' },
            { errorSummaryLinkedField: 'first', message: '' },
          ],
        }

        PresenterUtils.errorSummary(original, { fieldOrder: ['first', 'second'] })

        expect(original.errors).toEqual([
          { errorSummaryLinkedField: 'second', message: '' },
          { errorSummaryLinkedField: 'first', message: '' },
        ])
      })

      describe('when a field in the array of errors is missing from the fieldOrder array', () => {
        it('places that field at the end of the return value', () => {
          expect(
            PresenterUtils.errorSummary(
              {
                errors: [
                  { errorSummaryLinkedField: 'second', message: 'second msg' },
                  { errorSummaryLinkedField: 'first', message: 'first msg' },
                  { errorSummaryLinkedField: 'fourth', message: 'fourth msg' },
                  { errorSummaryLinkedField: 'third', message: 'third msg' },
                ],
              },
              { fieldOrder: ['first', 'second', 'third'] }
            )
          ).toEqual([
            { field: 'first', message: 'first msg' },
            { field: 'second', message: 'second msg' },
            { field: 'third', message: 'third msg' },
            { field: 'fourth', message: 'fourth msg' },
          ])
        })
      })
    })
  })

  describe('.errorMessage', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        expect(PresenterUtils.errorMessage(null, 'my-field')).toBeNull()
      })
    })

    describe('when error is non-null and contains an error for that field', () => {
      it('returns the message for that error', () => {
        const error = {
          errors: [
            { formFields: ['other-field'], message: 'other message' },
            { formFields: ['my-field', 'yet-another-field'], message: 'my message' },
          ],
        }
        expect(PresenterUtils.errorMessage(error, 'my-field')).toEqual('my message')
      })
    })

    describe('when error is non-null and doesn’t contain an error for that field', () => {
      it('returns null', () => {
        const error = {
          errors: [{ formFields: ['other-field'], message: 'other message' }],
        }
        expect(PresenterUtils.errorMessage(error, 'my-field')).toBeNull()
      })
    })
  })

  describe('.errorMessage', () => {
    describe('when error is null', () => {
      it('returns false', () => {
        expect(PresenterUtils.hasError(null, 'my-field')).toBe(false)
      })
    })

    describe('when error is non-null and contains an error for that field', () => {
      it('return true', () => {
        const error = {
          errors: [
            { formFields: ['other-field'], message: 'other message' },
            { formFields: ['my-field', 'yet-another-field'], message: 'my message' },
          ],
        }
        expect(PresenterUtils.hasError(error, 'my-field')).toBe(true)
      })
    })

    describe('when error is non-null and doesn’t contain an error for that field', () => {
      it('returns false', () => {
        const error = {
          errors: [{ formFields: ['other-field'], message: 'other message' }],
        }
        expect(PresenterUtils.hasError(error, 'my-field')).toBe(false)
      })
    })
  })

  describe('govukFormattedDate', () => {
    it('returns a formatted date', () => {
      const date = CalendarDay.fromComponents(4, 6, 2017)!
      expect(PresenterUtils.govukFormattedDate(date)).toEqual('4 June 2017')
    })
  })

  describe('govukShortFormattedDate', () => {
    it('returns a formatted date', () => {
      const date = CalendarDay.fromComponents(4, 6, 2017)!
      expect(PresenterUtils.govukShortFormattedDate(date)).toEqual('4 Jun 2017')
    })
  })

  describe('fullName', () => {
    // There’s probably going to turn out to be a whole bunch of nuance here but let’s start with this
    it('returns the service user’s first name followed by last name', () => {
      const { serviceUser } = draftReferralFactory.build({ serviceUser: { firstName: 'Daniel', lastName: 'Grove' } })
      expect(PresenterUtils.fullName(serviceUser)).toEqual('Daniel Grove')
    })

    it('converts the names to title case', () => {
      const { serviceUser } = draftReferralFactory.build({
        serviceUser: { firstName: 'rob', lastName: 'shah-BROOKES' },
      })
      expect(PresenterUtils.fullName(serviceUser)).toEqual('Rob Shah-Brookes')
    })
  })

  describe('fullNameSortValue', () => {
    // I’ve not yet given this enough thought to be convinced this is correct;
    // there are probably counterexamples
    it('returns a value which, when lexicographically sorted, gives a (last name, first name) sort order', () => {
      const { serviceUser } = draftReferralFactory.build({ serviceUser: { firstName: 'Daniel', lastName: 'Grove' } })
      expect(PresenterUtils.fullNameSortValue(serviceUser)).toEqual('grove, daniel')
    })
  })

  describe('formattedTime', () => {
    it('returns a 12-hour description of the time', () => {
      expect(PresenterUtils.formattedTime(ClockTime.fromTwentyFourHourComponents(9, 5, 0)!)).toEqual('9:05am')
      expect(PresenterUtils.formattedTime(ClockTime.fromTwentyFourHourComponents(10, 30, 0)!)).toEqual('10:30am')
      expect(PresenterUtils.formattedTime(ClockTime.fromTwentyFourHourComponents(12, 30, 0)!)).toEqual('12:30pm')
      expect(PresenterUtils.formattedTime(ClockTime.fromTwentyFourHourComponents(15, 45, 0)!)).toEqual('3:45pm')
    })
  })

  describe('formattedTimeRange', () => {
    it('returns a 12-hour description of the period from the start time to the end time', () => {
      expect(
        PresenterUtils.formattedTimeRange(
          ClockTime.fromTwentyFourHourComponents(10, 30, 0)!,
          ClockTime.fromTwentyFourHourComponents(15, 45, 0)!
        )
      ).toEqual('10:30am to 3:45pm')
    })
  })

  describe('type guards', () => {
    describe('isNonNullAndDefined', () => {
      it('should return false if undefined', () => {
        expect(PresenterUtils.isNonNullAndDefined(undefined)).toBe(false)
      })
      it('should return false if null', () => {
        expect(PresenterUtils.isNonNullAndDefined(null)).toBe(false)
      })
      it('should return true if non-null and defined', () => {
        expect(PresenterUtils.isNonNullAndDefined('defined')).toBe(true)
      })
      it('can be used to filter types', () => {
        const multiTypes: (string | null | undefined)[] = ['value', null, undefined]
        const singleType: string[] = multiTypes.filter(PresenterUtils.isNonNullAndDefined)
        expect(singleType).toEqual(['value'])
      })
    })
  })
})
