import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmMainPointOfContactDetailsForm from './confirmMainPointOfContactDetailsForm'

describe('ConfirmProbationPractitionerDetailsForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Bob' } })

  const deliusResponsibleOfficer = {
    communityManager: {
      code: 'aaa',
      name: { forename: 'Bob', surname: 'Alice' },
      username: 'bobalice',
      email: 'bobalice@example.com',
      telephoneNumber: '07595025281',
      responsibleOfficer: true,
      pdu: { code: 'L', description: 'London' },
      team: { code: 'R and M', description: 'R and M team', telephoneNumber: '07595025281', email: 'a.b@xyz.com' },
      unallocated: true,
    },
  }

  describe('errors', () => {
    it('returns no error when all fields correctly populated', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-roleOrJobTitle': 'Probation Practitioner',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when neither yes or no radio buttons to confirm the correct details are selected', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: '',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-roleOrJobTitle': 'Probation Practitioner',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['location'],
            errorSummaryLinkedField: 'location',
            message: 'Select prison establishment or probation office',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner name is empty', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': '',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-roleOrJobTitle': 'Probation Practitioner',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['probation-practitioner-name'],
            errorSummaryLinkedField: 'probation-practitioner-name',
            message: 'Add main point of contact name - this is a mandatory field',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner role or job title is empty', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-roleOrJobTitle': '',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['probation-practitioner-roleOrJobTitle'],
            errorSummaryLinkedField: 'probation-practitioner-roleOrJobTitle',
            message: 'Add role / job title - this is a mandatory field',
          },
        ],
      })
    })

    it('returns an error when the establishment is empty after selecting establishment', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-roleOrJobTitle': 'PP',
            'probation-practitioner-email': 'a.b@xyz.com',
            'prison-select': '',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
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

    it('returns an error when the probation office is empty after selecting probation office', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'probation office',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-roleOrJobTitle': 'PP',
            'probation-practitioner-email': 'a.b@xyz.com',
            'probation-practitioner-office': '',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['probation-practitioner-office'],
            errorSummaryLinkedField: 'probation-practitioner-office',
            message: 'Select a probation office from the list',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner email is invalid', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-roleOrJobTitle': 'PP',
            'probation-practitioner-email': 'incorrectlyformattedemail.com',
            'probation-practitioner-office': 'London',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['probation-practitioner-email'],
            errorSummaryLinkedField: 'probation-practitioner-email',
            message: 'Enter email address in the correct format',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the interventions service', async () => {
      const form = await ConfirmMainPointOfContactDetailsForm.createForm(
        {
          body: {
            location: 'establishment',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-roleOrJobTitle': 'PP',
            'probation-practitioner-email': 'bob@example.com',
            'prison-select': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.paramsForUpdate).toEqual({
        ppName: 'Bob',
        roleOrJobTitle: 'PP',
        ppEmailAddress: 'bob@example.com',
        ppEstablishment: 'London',
        ppLocationType: 'establishment',
        ppProbationOffice: '',
        hasMainPointOfContactDetails: true,
      })
    })
  })
})
