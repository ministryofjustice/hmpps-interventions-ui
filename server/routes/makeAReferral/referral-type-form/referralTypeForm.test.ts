import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ReferralTypeForm from './referralTypeForm'

describe('ReferralTypeForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex' } })

  describe('errors', () => {
    it('returns no error with all fields populated for custody prerelease', async () => {
      const form = await ReferralTypeForm.createForm(
        {
          body: {
            'current-location': 'CUSTODY',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when current location is not answered', async () => {
      const form = await ReferralTypeForm.createForm(
        {
          body: {
            'current-location': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['current-location'],
            errorSummaryLinkedField: 'current-location',
            message: 'Select custody or community',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the interventions service custody chosen', async () => {
      const form = await ReferralTypeForm.createForm(
        {
          body: {
            'current-location': 'CUSTODY',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        personCurrentLocationType: 'CUSTODY',
      })
    })

    it('returns an object to be used for updating the draft referral via the interventions service community is chosen', async () => {
      const form = await ReferralTypeForm.createForm(
        {
          body: {
            'current-location': 'COMMUNITY',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        personCurrentLocationType: 'COMMUNITY',
      })
    })
  })
})
