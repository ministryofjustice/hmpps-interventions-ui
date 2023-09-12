import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import PrisonReleaseForm from './prisonReleaseForm'
import { CurrentLocationType } from '../../../models/draftReferral'

describe('PrisonReleaseForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex', lastName: 'River' } })

  describe('errors', () => {
    it('returns no error with all fields populated for prison release', async () => {
      const form = await PrisonReleaseForm.createForm(
        {
          body: {
            'prison-release': 'yes',
            personCurrentLocationType: CurrentLocationType.custody,
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when the radio button is not selected', async () => {
      const form = await PrisonReleaseForm.createForm(
        {
          body: {
            'prison-release': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['prison-release'],
            errorSummaryLinkedField: 'prison-release',
            message: 'Select yes or no',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral for whether the referral is releasing or not', async () => {
      const form = await PrisonReleaseForm.createForm(
        {
          body: {
            'prison-release': 'yes',
            personCurrentLocationType: CurrentLocationType.custody,
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        isReferralReleasingIn12Weeks: true,
        personCurrentLocationType: CurrentLocationType.custody,
      })
    })

    it('returns an object to be used for updating the draft referral via the interventions service community is chosen', async () => {
      const form = await PrisonReleaseForm.createForm(
        {
          body: {
            'prison-release': 'no',
            personCurrentLocationType: CurrentLocationType.custody,
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        isReferralReleasingIn12Weeks: false,
        personCurrentLocationType: CurrentLocationType.custody,
      })
    })
  })
})
