import { Request } from 'express'
import RarDaysForm from './rarDaysForm'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(RarDaysForm, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })

  describe('isValid', () => {
    describe('when there are no errors in the form', () => {
      it('returns true', async () => {
        const form = await RarDaysForm.createForm({ body: { 'using-rar-days': 'no' } } as Request, serviceCategory)

        expect(form.isValid).toBe(true)
      })
    })

    describe('when there are errors in the form', () => {
      it('returns false', async () => {
        const form = await RarDaysForm.createForm({ body: {} } as Request, serviceCategory)

        expect(form.isValid).toBe(false)
      })
    })
  })

  describe('errors', () => {
    describe('when no answer is selected for using-rar-days', () => {
      it('gives an error for using-rar-days', async () => {
        const form = await RarDaysForm.createForm({ body: {} } as Request, serviceCategory)

        expect(form.errors).toEqual([
          { field: 'using-rar-days', message: 'Select yes if you are using RAR days for the accommodation service' },
        ])
      })
    })

    describe('when choosing no for using-rar-days', () => {
      it('gives no error', async () => {
        const form = await RarDaysForm.createForm({ body: { 'using-rar-days': 'no' } } as Request, serviceCategory)

        expect(form.errors).toBeNull()
      })
    })

    describe('when choosing yes for using-rar-days', () => {
      describe('with a valid value for maximum-rar-days', () => {
        it('gives no error', async () => {
          const form = await RarDaysForm.createForm(
            { body: { 'using-rar-days': 'yes', 'maximum-rar-days': '10' } } as Request,
            serviceCategory
          )

          expect(form.errors).toBeNull()
        })
      })

      describe('with a valid value for maximum-rar-days which contains whitespace', () => {
        it('gives no error', async () => {
          const form = await RarDaysForm.createForm(
            { body: { 'using-rar-days': 'yes', 'maximum-rar-days': ' 10  ' } } as Request,
            serviceCategory
          )

          expect(form.errors).toBeNull()
        })
      })

      describe('with a blank value for maximum-rar-days', () => {
        it('gives an error for maximum-rar-days', async () => {
          const form = await RarDaysForm.createForm(
            { body: { 'using-rar-days': 'yes', 'maximum-rar-days': '' } } as Request,
            serviceCategory
          )

          expect(form.errors).toEqual([
            {
              field: 'maximum-rar-days',
              message: 'Enter the maximum number of RAR days for the accommodation service',
            },
          ])
        })
      })

      describe('with a non-numeric value for maximum-rar-days', () => {
        it('gives an error for maximum-rar-days', async () => {
          const form = await RarDaysForm.createForm(
            { body: { 'using-rar-days': 'yes', 'maximum-rar-days': 'blah' } } as Request,
            serviceCategory
          )

          expect(form.errors).toEqual([
            {
              field: 'maximum-rar-days',
              message: 'The maximum number of RAR days for the accommodation service must be a number, like 5',
            },
          ])
        })
      })

      describe('with a non-whole number value for maximum-rar-days', () => {
        it('gives an error for maximum-rar-days', async () => {
          const form = await RarDaysForm.createForm(
            { body: { 'using-rar-days': 'yes', 'maximum-rar-days': '3.5' } } as Request,
            serviceCategory
          )

          expect(form.errors).toEqual([
            {
              field: 'maximum-rar-days',
              message: 'The maximum number of RAR days for the accommodation service must be a whole number, like 5',
            },
          ])
        })
      })
    })
  })

  describe('paramsForUpdate', () => {
    describe('when using RAR days', () => {
      it('returns true for usingRarDays, and a non-null maximumRarDays', async () => {
        const form = await RarDaysForm.createForm(
          { body: { 'using-rar-days': 'yes', 'maximum-rar-days': '3' } } as Request,
          serviceCategory
        )

        expect(form.paramsForUpdate).toEqual({ usingRarDays: true, maximumRarDays: 3 })
      })
    })

    describe('when not using RAR days', () => {
      it('returns false for usingRarDays, and a null maximumRarDays', async () => {
        const form = await RarDaysForm.createForm(
          { body: { 'using-rar-days': 'no', 'maximum-rar-days': '' } } as Request,
          serviceCategory
        )

        expect(form.paramsForUpdate).toEqual({ usingRarDays: false, maximumRarDays: null })
      })
    })

    describe('when the submitted maximum-rar-days contains whitespace', () => {
      it('correctly converts it to a number', async () => {
        const form = await RarDaysForm.createForm(
          { body: { 'using-rar-days': 'yes', 'maximum-rar-days': '  3  ' } } as Request,
          serviceCategory
        )

        expect(form.paramsForUpdate).toEqual({ usingRarDays: true, maximumRarDays: 3 })
      })
    })
  })
})
