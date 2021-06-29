import { Request } from 'express'
import ReferralStartForm from './referralStartForm'

describe(ReferralStartForm, () => {
  describe('isValid', () => {
    it('returns true when the service-user-crn property is present and not empty in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: {
          'service-user-crn': 'X320741',
        },
      } as Request)

      expect(form.isValid).toBe(true)
    })

    it('returns false when the service-user-crn property is absent in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: {},
      } as Request)

      expect(form.isValid).toBe(false)
    })

    it('returns false when the service-user-crn property is null in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: { 'service-user-crn': null },
      } as Request)

      expect(form.isValid).toBe(false)
    })
  })

  describe('error', () => {
    it('returns null when the service-user-crn property is present and not empty in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: {
          'service-user-crn': 'X320741',
        },
      } as Request)

      expect(form.error).toBeNull()
    })

    it('returns an error when the service-user-crn property is absent in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: {},
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['service-user-crn'],
            errorSummaryLinkedField: 'service-user-crn',
            message: 'A CRN is needed',
          },
        ],
      })
    })

    it('returns an error when the service-user-crn property is blank in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: { 'service-user-crn': '' },
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['service-user-crn'],
            errorSummaryLinkedField: 'service-user-crn',
            message: 'A CRN is needed',
          },
        ],
      })
    })

    it('returns an error when the service-user-crn property is null in the body', async () => {
      const form = await ReferralStartForm.createForm({
        body: { 'service-user-crn': null },
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['service-user-crn'],
            errorSummaryLinkedField: 'service-user-crn',
            message: 'A CRN is needed',
          },
        ],
      })
    })
  })
})
