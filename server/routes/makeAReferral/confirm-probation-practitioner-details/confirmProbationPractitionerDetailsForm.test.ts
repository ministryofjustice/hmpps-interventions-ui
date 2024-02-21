import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmProbationPractitionerDetailsForm from './confirmProbationPractitionerDetailsForm'

describe('ConfirmProbationPractitionerDetailsForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({
      serviceUser: { firstName: 'Bob' },
      ndeliusPPName: 'Bob Alice',
      ndeliusPPEmailAddress: 'a.b@xyz.com',
      ndeliusPDU: 'London',
      ndeliusPhoneNumber: '0759434343',
      ndeliusTeamPhoneNumber: '020334343435',
      ppProbationOffice: 'Sheffield',
    })

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
      unallocated: false,
    },
  }

  describe('errors', () => {
    it('returns no error when all fields correctly populated', async () => {
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {},
        } as Request,
        referral,
        deliusResponsibleOfficer
      )

      expect(form.error).toBeNull()
    })
    it('returns an error when the probation practitioner name is empty', async () => {
      const referralWithOutName = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({
          serviceUser: { firstName: 'Bob' },
          ndeliusPPName: null,
          ndeliusPPEmailAddress: 'a.b@xyz.com',
          ndeliusPDU: 'London',
          ndeliusPhoneNumber: '0759434343',
          ndeliusTeamPhoneNumber: '020334343435',
          ppProbationOffice: 'Sheffield',
        })
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {},
        } as Request,
        referralWithOutName,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: [''],
            errorSummaryLinkedField: '',
            message: 'Add probation practitioner name - this is a mandatory field',
          },
        ],
      })
    })
    it('returns an error when the probation practitioner pdu is empty', async () => {
      const referralWithOutPdu = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({
          serviceUser: { firstName: 'Bob' },
          ndeliusPPName: 'Bob Willis',
          ndeliusPPEmailAddress: 'a.b@xyz.com',
          ndeliusPDU: null,
          ndeliusPhoneNumber: '0759434343',
          ndeliusTeamPhoneNumber: '020334343435',
          ppProbationOffice: 'Sheffield',
        })
      const form = await ConfirmProbationPractitionerDetailsForm.createForm(
        {
          body: {},
        } as Request,
        referralWithOutPdu,
        deliusResponsibleOfficer
      )

      expect(form.error).toEqual({
        errors: [
          {
            formFields: [''],
            errorSummaryLinkedField: '',
            message: 'Add PDU (Probation Delivery Unit) - this is a mandatory field',
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

      expect(form.paramsForUpdate(referral)).toEqual({
        ndeliusPPName: `${referral.ndeliusPPName}`,
        ndeliusPPEmailAddress: `${referral.ndeliusPPEmailAddress}`,
        ndeliusPDU: `${referral.ndeliusPDU}`,
        ndeliusPhoneNumber: `${referral.ndeliusPhoneNumber}`,
        ndeliusTeamPhoneNumber: `${referral.ndeliusTeamPhoneNumber}`,
        ppProbationOffice: `${referral.ppProbationOffice}`,
      })
    })
  })
})
