import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmProbationPractitionerDetailsForm from './confirmProbationPractitionerDetailsForm'

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
      responsibleOfficer: true,
      pdu: { code: 'L', description: 'London' },
    },
  }

  describe('errors', () => {
    it('returns no error when all fields correctly populated', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': 'no',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toBeNull()
    })

    it('returns an error when neither yes or no radio buttons to confirm the correct details are selected', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': '',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['confirm-details'],
            errorSummaryLinkedField: 'confirm-details',
            message: 'Select yes or no',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner name is empty after selecting no', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': 'no',
            'probation-practitioner-name': '',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': 'London',
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
            message: 'Enter name of probation practitioner',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner pdu is empty after selecting no', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': 'no',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': '',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: ['probation-practitioner-pdu'],
            errorSummaryLinkedField: 'probation-practitioner-pdu',
            message: 'Enter the PDU',
          },
        ],
      })
    })

    it('returns an error when the probation practitioner email is invalid', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': 'no',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'incorrectlyformattedemail.com',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': 'London',
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
            message: 'Enter an email address in the correct format',
          },
        ],
      })
    })
  })

  describe('paramsForUpdate', () => {
    it('returns an object to be used for updating the draft referral via the interventions service', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {
            'confirm-details': 'no',
            'probation-practitioner-name': 'Bob',
            'probation-practitioner-email': 'bob@example.com',
            'probation-practitioner-office': 'London',
            'probation-practitioner-pdu': 'London',
          },
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.paramsForUpdate).toEqual({
        ndeliusPPName: `${deliusResponsibleOfficer?.communityManager?.name.forename} ${deliusResponsibleOfficer?.communityManager.name?.surname}`,
        ndeliusPPEmailAddress: `${deliusResponsibleOfficer?.communityManager.email}`,
        ndeliusPDU: `${deliusResponsibleOfficer?.communityManager.pdu.description}`,
        ppName: 'Bob',
        ppEmailAddress: 'bob@example.com',
        ppProbationOffice: 'London',
        ppPdu: 'London',
        hasValidDeliusPPDetails: false,
      })
    })
  })
})
