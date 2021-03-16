import { Request } from 'express'
import ActionPlanNumberOfSessionsForm from './actionPlanNumberOfSessionsForm'

describe(ActionPlanNumberOfSessionsForm, () => {
  describe('errors', () => {
    describe('with a valid value for number-of-sessions', () => {
      it('gives no error', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({
          body: { 'number-of-sessions': '10' },
        } as Request)

        expect(form.error).toBeNull()
      })
    })

    describe('with a valid value for number-of-sessions which contains whitespace', () => {
      it('gives no error', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({
          body: { 'number-of-sessions': ' 10  ' },
        } as Request)

        expect(form.error).toBeNull()
      })
    })

    describe('with a blank value for number-of-sessions', () => {
      it('gives an error for number-of-sessions', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({ body: { 'number-of-sessions': '' } } as Request)

        expect(form.error).toEqual({
          errors: [
            {
              formFields: ['number-of-sessions'],
              errorSummaryLinkedField: 'number-of-sessions',
              message: 'Enter the number of sessions',
            },
          ],
        })
      })
    })

    describe('with a non-numeric value for number-of-sessions', () => {
      it('gives an error for number-of-sessions', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({
          body: { 'number-of-sessions': 'blah' },
        } as Request)

        expect(form.error).toEqual({
          errors: [
            {
              formFields: ['number-of-sessions'],
              errorSummaryLinkedField: 'number-of-sessions',
              message: 'The number of sessions must be a number, like 5',
            },
          ],
        })
      })
    })

    describe('with a non-positive number value for number-of-sessions', () => {
      it('gives an error for number-of-sessions', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({
          body: { 'number-of-sessions': '0' },
        } as Request)

        expect(form.error).toEqual({
          errors: [
            {
              formFields: ['number-of-sessions'],
              errorSummaryLinkedField: 'number-of-sessions',
              message: 'The number of sessions must be 1 or more',
            },
          ],
        })
      })
    })

    describe('with a non-whole number value for number-of-sessions', () => {
      it('gives an error for number-of-sessions', async () => {
        const form = await ActionPlanNumberOfSessionsForm.createForm({
          body: { 'number-of-sessions': '3.5' },
        } as Request)

        expect(form.error).toEqual({
          errors: [
            {
              formFields: ['number-of-sessions'],
              errorSummaryLinkedField: 'number-of-sessions',
              message: 'The number of sessions must be a whole number, like 5',
            },
          ],
        })
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns params to be used to update the action plan on the interventions service', async () => {
      const form = await ActionPlanNumberOfSessionsForm.createForm({
        body: { 'number-of-sessions': '3' },
      } as Request)

      expect(form.paramsForUpdate).toEqual({ numberOfSessions: 3 })
    })
  })
})
