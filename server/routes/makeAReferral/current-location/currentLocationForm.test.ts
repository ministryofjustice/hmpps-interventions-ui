import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import CurrentLocationForm from './currentLocationForm'

describe('CurrentLocationForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex' } })

  describe('errors', () => {
    it('returns no error with all fields populated for custody', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': 'aaa',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })
    it('returns an error when the prison is empty after selecting custody', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['prison-select'],
            errorSummaryLinkedField: 'prison-select',
            message: 'You must enter the establishment Alex is currently in',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the interventions service custody and prison are chosen', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': 'aaa',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        personCustodyPrisonId: 'aaa',
      })
    })
  })
})
