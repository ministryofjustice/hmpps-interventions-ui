import { Request } from 'express'
import DesiredOutcomesForm from './desiredOutcomesForm'

describe(DesiredOutcomesForm, () => {
  describe('isValid', () => {
    it('returns true when the desired-outcomes-ids property is present and not empty in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: {
          'desired-outcomes-ids': ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
        },
      } as Request)

      expect(form.isValid).toBe(true)
    })

    it('returns false when the desired-outcomes-ids property is absent in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: {},
      } as Request)

      expect(form.isValid).toBe(false)
    })

    it('returns false when the desired-outcomes-ids property is null in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: { 'desired-outcomes-ids': null },
      } as Request)

      expect(form.isValid).toBe(false)
    })
  })

  describe('error', () => {
    it('returns null when the desired-outcomes-ids property is present in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: {
          'desired-outcomes-ids': ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
        },
      } as Request)

      expect(form.error).toBe(null)
    })

    it('returns an error object when the desired-outcomes-ids property is absent in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: {},
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'desired-outcomes-ids',
            formFields: ['desired-outcomes-ids'],
            message: 'Select desired outcomes',
          },
        ],
      })
    })

    it('returns an error object when the desired-outcomes-ids property is null in the body', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: { 'desired-outcomes-ids': null },
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'desired-outcomes-ids',
            formFields: ['desired-outcomes-ids'],
            message: 'Select desired outcomes',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns the params to be sent to the backend, when the data in the body is valid', async () => {
      const form = await DesiredOutcomesForm.createForm({
        body: {
          'desired-outcomes-ids': ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
        },
      } as Request)

      expect(form.paramsForUpdate).toEqual({
        desiredOutcomesIds: ['29843fdf-8b88-4b08-a0f9-dfbd3208fd2e', '43557c7a-c286-49c2-a994-d0a821295c7a'],
      })
    })
  })
})
