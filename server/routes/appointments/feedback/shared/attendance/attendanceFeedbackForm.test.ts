import TestUtils from '../../../../../../testutils/testUtils'
import AttendanceFeedbackForm from './attendanceFeedbackForm'

describe(AttendanceFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data and attendance', () => {
      const validAttendedValues = ['yes', 'late']

      validAttendedValues.forEach(validAttendedValue => {
        it('returns a paramsForUpdate with the attended property and optional further information', async () => {
          const request = TestUtils.createRequest({
            attended: validAttendedValue,
          })
          const data = await new AttendanceFeedbackForm(request).data()

          expect(data.paramsForUpdate?.attended).toEqual(validAttendedValue)
        })
      })
    })

    describe('with valid data and no attendance', () => {
      it('returns a paramsForUpdate with the attended property and attendance failur information', async () => {
        const request = TestUtils.createRequest({
          attended: 'no',
          'attendance-failure-information': 'did not attend',
        })
        const data = await new AttendanceFeedbackForm(request).data()

        expect(data.paramsForUpdate?.attended).toEqual('no')
        expect(data.paramsForUpdate?.attendanceFailureInformation).toEqual('did not attend')
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
