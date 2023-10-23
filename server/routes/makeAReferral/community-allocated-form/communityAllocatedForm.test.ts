import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import CommunityAllocatedForm from './communityAllocatedForm'

describe('CommunityAllocatedForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex' } })

  describe('errors', () => {
    it('returns no error with all fields populated for community allocated', async () => {
      const form = await CommunityAllocatedForm.createForm(
        {
          body: {
            'community-allocated': 'yes',
          },
        } as Request,
        referral
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when community allocated is not selected', async () => {
      const form = await CommunityAllocatedForm.createForm(
        {
          body: {
            'community-allocated': '',
          },
        } as Request,
        referral
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['community-allocated'],
            errorSummaryLinkedField: 'community-allocated',
            message: 'Select yes or no',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the community allocated form', async () => {
      const form = await CommunityAllocatedForm.createForm(
        {
          body: {
            'community-allocated': 'yes',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        allocatedCommunityPP: true,
      })
    })

    it('returns an object to be used for updating the draft referral via the interventions service community is chosen', async () => {
      const form = await CommunityAllocatedForm.createForm(
        {
          body: {
            'community-allocated': 'no',
          },
        } as Request,
        referral
      )

      expect(form.paramsForUpdate).toEqual({
        allocatedCommunityPP: false,
      })
    })
  })
})
