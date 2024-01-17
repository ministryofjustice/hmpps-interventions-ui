import { Request } from 'express'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmProbationPractitionerDetailsForm from './confirmProbationPractitionerDetailsForm'

describe('ConfirmProbationPractitionerDetailsForm', () => {
  const referral = draftReferralFactory
    .serviceCategorySelected()
    .serviceUserSelected()
    .build({ serviceUser: { firstName: 'Bob' }, ndeliusPPName: 'Bob Alice' })

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
        ndeliusPPName: 'Bob Alice',
        ndeliusPPEmailAddress: `${deliusResponsibleOfficer?.communityManager.email}`,
        ndeliusPDU: `${deliusResponsibleOfficer?.communityManager.pdu.description}`,
        ndeliusPhoneNumber: `${deliusResponsibleOfficer?.communityManager.telephoneNumber}`,
        ndeliusTeamPhoneNumber: `${deliusResponsibleOfficer?.communityManager.team.telephoneNumber}`,
      })
    })
  })
})
