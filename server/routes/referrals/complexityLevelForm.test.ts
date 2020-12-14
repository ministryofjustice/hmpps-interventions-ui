import { Request } from 'express'
import ComplexityLevelForm from './complexityLevelForm'

describe(ComplexityLevelForm, () => {
  describe('isValid', () => {
    it('returns true when the complexity-level-id property is present in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: { 'complexity-level-id': '43557c7a-c286-49c2-a994-d0a821295c7a' },
      } as Request)

      expect(form.isValid).toBe(true)
    })

    it('returns false when the complexity-level-id property is absent in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: {},
      } as Request)

      expect(form.isValid).toBe(false)
    })

    it('returns false when the complexity-level-id property is null in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: { 'complexity-level-id': null },
      } as Request)

      expect(form.isValid).toBe(false)
    })
  })

  describe('error', () => {
    it('returns null when the complexity-level-id property is present in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: { 'complexity-level-id': '43557c7a-c286-49c2-a994-d0a821295c7a' },
      } as Request)

      expect(form.error).toBe(null)
    })

    it('returns an error object when the complexity-level-id property is absent in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: {},
      } as Request)

      expect(form.error).toEqual({ message: 'Select a complexity level' })
    })

    it('returns an error object when the complexity-level-id property is null in the body', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: { 'complexity-level-id': null },
      } as Request)

      expect(form.error).toEqual({ message: 'Select a complexity level' })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns the params to be sent to the backend, when the data in the body is valid', async () => {
      const form = await ComplexityLevelForm.createForm({
        body: { 'complexity-level-id': '43557c7a-c286-49c2-a994-d0a821295c7a' },
      } as Request)

      expect(form.paramsForUpdate).toEqual({ complexityLevelId: '43557c7a-c286-49c2-a994-d0a821295c7a' })
    })
  })
})
