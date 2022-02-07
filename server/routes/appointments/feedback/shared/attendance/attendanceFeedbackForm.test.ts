import TestUtils from '../../../../../../testutils/testUtils'
import AttendanceFeedbackForm from './attendanceFeedbackForm'

describe(AttendanceFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data', () => {
      const validAttendedValues = ['yes', 'late', 'no']

      validAttendedValues.forEach(validAttendedValue => {
        it('returns a paramsForUpdate with the attended property and optional further information', async () => {
          const request = TestUtils.createRequest({
            attended: validAttendedValue,
            'additional-attendance-information': 'Alex missed the bus',
          })
          const data = await new AttendanceFeedbackForm(request).data()

          expect(data.paramsForUpdate?.attended).toEqual(validAttendedValue)
          expect(data.paramsForUpdate?.additionalAttendanceInformation).toEqual('Alex missed the bus')
        })
      })
    })

    describe('invalid fields', () => {
      it('returns an error when the attended property is not present', async () => {
        const request = TestUtils.createRequest({})

        const data = await new AttendanceFeedbackForm(request).data()

        expect(data.error?.errors).toContainEqual({
          errorSummaryLinkedField: 'attended',
          formFields: ['attended'],
          message: 'Select whether they attended or not',
        })
      })
    })
  })
})
