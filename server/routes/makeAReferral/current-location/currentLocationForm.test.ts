import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import CurrentLocationForm from './currentLocationForm'

describe('CurrentLocationForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Alex' } })

  describe('errors', () => {
    it('returns no error when user selects yes after they are ok with already set location', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': 'aaa',
            'already-know-prison-name': 'yes',
          },
        } as Request,
        referral,
        'london'
      )

      expect(form.error).toBeNull()
    })
    it('returns no error when user selects no and inputs the location', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': 'aaa',
            'already-know-prison-name': 'no',
          },
        } as Request,
        referral,
        null
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when the prison is empty after selecting yes', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': '',
            'already-know-prison-name': '',
          },
        } as Request,
        referral,
        null
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['already-know-prison-name'],
            errorSummaryLinkedField: 'already-know-prison-name',
            message: 'Select yes or no',
          },
        ],
      })
    })
    it('returns an error when the prison is empty after selecting no', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': '',
            'already-know-prison-name': 'no',
          },
        } as Request,
        referral,
        null
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['prison-select'],
            errorSummaryLinkedField: 'prison-select',
            message: 'Select a prison establishment from the list',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object when the user knows the prison already set is good', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': '',
            'already-know-prison-name': 'yes',
          },
        } as Request,
        referral,
        'MDI'
      )

      expect(form.paramsForUpdate).toEqual({
        personCustodyPrisonId: 'MDI',
        alreadyKnowPrisonName: true,
      })
    })

    it('returns an object when the user knows the prison set is not right and the user inputs the data', async () => {
      const form = await CurrentLocationForm.createForm(
        {
          body: {
            'prison-select': 'aaa',
            'already-know-prison-name': 'no',
          },
        } as Request,
        referral,
        'MDI'
      )

      expect(form.paramsForUpdate).toEqual({
        personCustodyPrisonId: 'aaa',
        alreadyKnowPrisonName: false,
      })
    })
  })
})
