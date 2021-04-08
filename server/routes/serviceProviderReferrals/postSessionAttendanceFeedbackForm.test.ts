import { Request } from 'express'
import PostSessionAttendanceFeedbackForm from './postSessionAttendanceFeedbackForm'

describe(PostSessionAttendanceFeedbackForm, () => {
  describe('isValid', () => {
    it('returns true when the attendance property is present in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: { attended: 'yes' },
      } as Request)

      expect(form.isValid).toBe(true)
    })

    it('returns false when the attendance property is absent in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: {},
      } as Request)

      expect(form.isValid).toBe(false)
    })

    it('returns false when the attendance property is null in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: { attended: null },
      } as Request)

      expect(form.isValid).toBe(false)
    })
  })

  describe('error', () => {
    it('returns null when the attendance property is present in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: { attended: 'yes' },
      } as Request)

      expect(form.error).toBe(null)
    })

    it('returns an error object when the attendance property is absent in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: {},
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'attended',
            formFields: ['attended'],
            message: 'Select whether the service user attended or not',
          },
        ],
      })
    })

    it('returns an error object when the attendance property is null in the body', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: { attended: null },
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'attended',
            formFields: ['attended'],
            message: 'Select whether the service user attended or not',
          },
        ],
      })
    })
  })

  describe('attendanceParams', () => {
    it('returns the params to be sent to the backend, when the data in the body is valid', async () => {
      const form = await PostSessionAttendanceFeedbackForm.createForm({
        body: { attended: 'yes', additionalAttendanceInformation: 'Alex attended the session' },
      } as Request)

      expect(form.attendanceParams).toEqual({
        attended: 'yes',
        additionalAttendanceInformation: 'Alex attended the session',
      })
    })
  })
})
