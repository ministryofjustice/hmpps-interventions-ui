import AddressInput from './addressInput'
import TestUtils from '../../../../testutils/testUtils'
import MeetingMethodInput from './meetingMethodInput'

describe(AddressInput, () => {
  const errorMessages = {
    empty: 'empty',
  }
  describe('validate', () => {
    describe('with valid data', () => {
      it('returns a meeting method', async () => {
        const request = TestUtils.createRequest({
          'meeting-method': 'PHONE_CALL',
        })
        const result = await new MeetingMethodInput(request, 'meeting-method', errorMessages).validate()
        expect(result.value).toEqual('PHONE_CALL')
      })
    })
    describe('with invalid data', () => {
      describe('with empty selection', () => {
        it('should present an error', async () => {
          const request = TestUtils.createRequest({})
          const result = await new MeetingMethodInput(request, 'meeting-method', errorMessages).validate()
          expect(result.error).toEqual({
            errors: [
              {
                errorSummaryLinkedField: 'meeting-method',
                formFields: ['meeting-method'],
                message: 'Select a meeting method',
              },
            ],
          })
        })
      })

      describe('with an invalid selection', () => {
        it('should present an error', async () => {
          const request = TestUtils.createRequest({ 'meeting-method': 'INVALID' })
          const result = await new MeetingMethodInput(request, 'meeting-method', errorMessages).validate()
          expect(result.error).toEqual({
            errors: [
              {
                errorSummaryLinkedField: 'meeting-method',
                formFields: ['meeting-method'],
                message: 'Select a meeting method',
              },
            ],
          })
        })
      })
    })
  })
})
