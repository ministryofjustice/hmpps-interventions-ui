import TestUtils from '../../../../../../testutils/testUtils'
import AttendanceFeedbackForm from './attendanceFeedbackForm'

describe(AttendanceFeedbackForm, () => {
  describe('data', () => {
    describe('with valid data and attendance', () => {
      const validAttendedValues = ['yes', 'no']

      validAttendedValues.forEach(validAttendedValue => {
        it('returns a paramsForUpdate with the attended property and optional further information', async () => {
          const request = TestUtils.createRequest({
            attended: validAttendedValue,
            'did-session-happen': 'no',
          })
          const data = await new AttendanceFeedbackForm(request).data()

          expect(data.paramsForUpdate?.attended).toEqual(validAttendedValue)
        })
      })
    })

    describe('did session happen is yes', () => {
      it('returns a paramsForUpdate with the attended property as yes', async () => {
        const request = TestUtils.createRequest({
          'did-session-happen': 'yes',
        })
        const data = await new AttendanceFeedbackForm(request).data()

        expect(data.paramsForUpdate?.attended).toEqual('yes')
        expect(data.paramsForUpdate?.didSessionHappen).toEqual(true)
      })
    })
  })
})
