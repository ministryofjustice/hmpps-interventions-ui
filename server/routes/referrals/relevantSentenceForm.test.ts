import { Request } from 'express'
import RelevantSentenceForm from './relevantSentenceForm'

describe(RelevantSentenceForm, () => {
  describe('isValid', () => {
    it('returns true when the relevant-sentence-id property is present in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: { 'relevant-sentence-id': '2500284169' },
      } as Request)

      expect(form.isValid).toBe(true)
    })

    it('returns false when the relevant-sentence-id property is absent in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: {},
      } as Request)

      expect(form.isValid).toBe(false)
    })

    it('returns false when the relevant-sentence-id property is null in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: { 'relevant-sentence-id': null },
      } as Request)

      expect(form.isValid).toBe(false)
    })
  })

  describe('error', () => {
    it('returns null when the relevant-sentence-id property is present in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: { 'relevant-sentence-id': '2500284169' },
      } as Request)

      expect(form.error).toBe(null)
    })

    it('returns an error object when the relevant-sentence-id property is absent in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: {},
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'relevant-sentence-id',
            formFields: ['relevant-sentence-id'],
            message: 'Select the relevant sentence',
          },
        ],
      })
    })

    it('returns an error object when the relevant-sentence-id property is null in the body', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: { 'relevant-sentence-id': null },
      } as Request)

      expect(form.error).toEqual({
        errors: [
          {
            errorSummaryLinkedField: 'relevant-sentence-id',
            formFields: ['relevant-sentence-id'],
            message: 'Select the relevant sentence',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns the params to be sent to the backend, when the data in the body is valid', async () => {
      const form = await RelevantSentenceForm.createForm({
        body: { 'relevant-sentence-id': '2500284169' },
      } as Request)

      expect(form.paramsForUpdate).toEqual({ relevantSentenceId: 2500284169 })
    })
  })
})
