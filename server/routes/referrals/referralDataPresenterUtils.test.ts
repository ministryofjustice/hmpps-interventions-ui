import ReferralDataPresenterUtils from './referralDataPresenterUtils'
import draftReferralFactory from '../../../testutils/factories/draftReferral'

describe('ReferralDataPresenterUtils', () => {
  describe('stringValue', () => {
    describe('when the referral has a null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const utils = new ReferralDataPresenterUtils(referral, null)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const userInputData = { 'additional-needs-information': null }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const userInputData = {}
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is an empty string', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const userInputData = { 'additional-needs-information': '' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is a non-empty string', () => {
        it('returns the user input value', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const userInputData = { 'additional-needs-information': 'bar' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('bar')
        })
      })

      describe('when there is user input data and the user input value for the property is present but neither a string nor null', () => {
        it('returns the stringified user input value', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: null })
          const userInputData = { 'additional-needs-information': 100 }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('100')
        })
      })
    })

    describe('when the referral has a non-null value for the property', () => {
      describe('when there is no user input data', () => {
        describe('when the referral’s value is a string', () => {
          it('returns the value from the referral', () => {
            const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
            const utils = new ReferralDataPresenterUtils(referral, null)

            expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('foo')
          })
        })

        describe('when the referral’s value is a number', () => {
          it('returns the formatted value from the referral', () => {
            const referral = draftReferralFactory.build({ maximumRarDays: 10 })
            const utils = new ReferralDataPresenterUtils(referral, null)

            expect(utils.stringValue('maximumRarDays', 'maximum-rar-days')).toBe('10')
          })
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
          const userInputData = { 'additional-needs-information': null }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
          const userInputData = {}
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is an empty string', () => {
        it('returns an empty string', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
          const userInputData = { 'additional-needs-information': '' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('')
        })
      })

      describe('when there is user input data and the user input value for the property is a non-empty string', () => {
        it('returns the user input value', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
          const userInputData = { 'additional-needs-information': 'bar' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('bar')
        })
      })

      describe('when there is user input data and the user input value for the property is present but neither a string nor null', () => {
        it('returns the stringified user input value', () => {
          const referral = draftReferralFactory.build({ additionalNeedsInformation: 'foo' })
          const userInputData = { 'additional-needs-information': 100 }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.stringValue('additionalNeedsInformation', 'additional-needs-information')).toBe('100')
        })
      })
    })
  })

  describe('booleanValue', () => {
    describe('when the referral has a null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const utils = new ReferralDataPresenterUtils(referral, null)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const userInputData = { 'needs-interpreter': null }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const userInputData = {}
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(null)
        })
      })

      describe("when there is user input data and the user input value for the property is 'no'", () => {
        it('returns false', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const userInputData = { 'needs-interpreter': 'no' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(false)
        })
      })

      describe("when there is user input data and the user input value for the property is 'yes'", () => {
        it('returns true', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const userInputData = { 'needs-interpreter': 'yes' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(true)
        })
      })

      describe("when there is user input data and the user input value for the property is present but neither 'yes', 'no' nor null", () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: null })
          const userInputData = { 'needs-interpreter': true }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBeNull()
        })
      })
    })

    describe('when the referral has a non-null value for the property', () => {
      describe('when there is no user input data', () => {
        it('returns the value from the referral', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const utils = new ReferralDataPresenterUtils(referral, null)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(false)
        })
      })

      describe('when there is user input data and the user input value for the property is null', () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const userInputData = { 'needs-interpreter': null }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBeNull()
        })
      })

      describe('when there is user input data and the property is absent from the user input data', () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const userInputData = {}
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(null)
        })
      })

      describe("when there is user input data and the user input value for the property is 'no'", () => {
        it('returns false', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const userInputData = { 'needs-interpreter': 'no' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(false)
        })
      })

      describe("when there is user input data and the user input value for the property is 'yes'", () => {
        it('returns true', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const userInputData = { 'needs-interpreter': 'yes' }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBe(true)
        })
      })

      describe("when there is user input data and the user input value for the property is present but neither 'yes', 'no' nor null", () => {
        it('returns null', () => {
          const referral = draftReferralFactory.build({ needsInterpreter: false })
          const userInputData = { 'needs-interpreter': true }
          const utils = new ReferralDataPresenterUtils(referral, userInputData)

          expect(utils.booleanValue('needsInterpreter', 'needs-interpreter')).toBeNull()
        })
      })
    })
  })

  describe('.sortedErrors', () => {
    describe('with null errors', () => {
      it('returns null', () => {
        expect(ReferralDataPresenterUtils.sortedErrors(null, { fieldOrder: ['first', 'second', 'third'] })).toBeNull()
      })
    })

    describe('when an empty array of errors', () => {
      it('returns an empty array', () => {
        expect(ReferralDataPresenterUtils.sortedErrors([], { fieldOrder: ['first', 'second', 'third'] })).toEqual([])
      })
    })

    describe('with a non-empty array of errors', () => {
      it('returns the errors ordered according to their fields’ positions in the fieldOrder array', () => {
        expect(
          ReferralDataPresenterUtils.sortedErrors(
            [
              { field: 'second', msg: 'second msg' },
              { field: 'first', msg: 'first msg' },
              { field: 'third', msg: 'third msg' },
            ],
            { fieldOrder: ['first', 'second', 'third'] }
          )
        ).toEqual([
          { field: 'first', msg: 'first msg' },
          { field: 'second', msg: 'second msg' },
          { field: 'third', msg: 'third msg' },
        ])
      })

      it('does not modify the original array', () => {
        const original = [{ field: 'second' }, { field: 'first' }]
        ReferralDataPresenterUtils.sortedErrors(original, { fieldOrder: ['first', 'second'] })
        expect(original).toEqual([{ field: 'second' }, { field: 'first' }])
      })

      describe('when a field in the array of errors is missing from the fieldOrder array', () => {
        it('places that field at the end of the return value', () => {
          expect(
            ReferralDataPresenterUtils.sortedErrors(
              [
                { field: 'second', msg: 'second msg' },
                { field: 'first', msg: 'first msg' },
                { field: 'fourth', msg: 'fourth msg' },
                { field: 'third', msg: 'third msg' },
              ],
              { fieldOrder: ['first', 'second', 'third'] }
            )
          ).toEqual([
            { field: 'first', msg: 'first msg' },
            { field: 'second', msg: 'second msg' },
            { field: 'third', msg: 'third msg' },
            { field: 'fourth', msg: 'fourth msg' },
          ])
        })
      })
    })
  })

  describe('.errorMessage', () => {
    describe('when errors is null', () => {
      it('returns null', () => {
        expect(ReferralDataPresenterUtils.errorMessage(null, 'my-field')).toBeNull()
      })
    })

    describe('when errors is non-null and contains an error for that field', () => {
      it('returns the message for that error', () => {
        const errors = [
          { field: 'other-field', message: 'other message' },
          { field: 'my-field', message: 'my message' },
        ]
        expect(ReferralDataPresenterUtils.errorMessage(errors, 'my-field')).toEqual('my message')
      })
    })

    describe('when errors is non-null and doesn’t contain an error for that field', () => {
      it('returns null', () => {
        const errors = [{ field: 'other-field', message: 'other message' }]
        expect(ReferralDataPresenterUtils.errorMessage(errors, 'my-field')).toBeNull()
      })
    })
  })
})
