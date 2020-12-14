import { Request } from 'express'
import CompletionDeadlineForm from './completionDeadlineForm'

describe('CompletionDeadlineForm', () => {
  describe('createForm', () => {
    it('returns a form and sanitizes the request body', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '12',
        },
      } as Request

      await CompletionDeadlineForm.createForm(req)

      expect(req.body['completion-deadline-year']).toBe(2021)
      expect(req.body['completion-deadline-month']).toBe(9)
      expect(req.body['completion-deadline-day']).toBe(12)
    })

    describe('with invalid data', () => {
      it('does not modify the invalid fields', async () => {
        const req = {
          body: {
            'completion-deadline-year': '2021',
            'completion-deadline-month': '09',
            'completion-deadline-day': 'hello',
          },
        } as Request

        await CompletionDeadlineForm.createForm(req)

        expect(req.body['completion-deadline-year']).toBe(2021)
        expect(req.body['completion-deadline-month']).toBe(9)
        expect(req.body['completion-deadline-day']).toBe('hello')
      })
    })
  })

  describe('errors', () => {
    it('returns null with valid data', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '12',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.errors).toBeNull()
    })

    it('returns an error when a field is empty', async () => {
      const req = {
        body: {
          'completion-deadline-year': '',
          'completion-deadline-month': '09',
          'completion-deadline-day': '12',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.errors).toEqual({
        firstErroredField: 'day',
        erroredFields: ['day', 'month', 'year'],
        message: 'The date by which the service needs to be completed must be a real date',
      })
    })

    it('returns an error when a field is just whitespace', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2021',
          'completion-deadline-month': '     ',
          'completion-deadline-day': '12',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.errors).toEqual({
        firstErroredField: 'day',
        erroredFields: ['day', 'month', 'year'],
        message: 'The date by which the service needs to be completed must be a real date',
      })
    })

    it('returns an error when a field is non-numeric', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': 'hello',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.errors).toEqual({
        firstErroredField: 'day',
        erroredFields: ['day', 'month', 'year'],
        message: 'The date by which the service needs to be completed must be a real date',
      })
    })

    it('returns an error when the date specified does not exist', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2011',
          'completion-deadline-month': '02',
          'completion-deadline-day': '31',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.errors).toEqual({
        firstErroredField: 'day',
        erroredFields: ['day', 'month', 'year'],
        message: 'The date by which the service needs to be completed must be a real date',
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object with the completionDeadline key and an ISO-formatted date', async () => {
      const req = {
        body: {
          'completion-deadline-year': '2021',
          'completion-deadline-month': '09',
          'completion-deadline-day': '12',
        },
      } as Request

      const form = await CompletionDeadlineForm.createForm(req)

      expect(form.paramsForUpdate).toEqual({ completionDeadline: '2021-09-12' })
    })
  })
})
