import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmProbationPractitionerDetailsPresenter from './confirmProbationPractitionerDetailsPresenter'

describe('ConfirmProbationPractitionerDetailsPresenter', () => {
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

  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ConfirmProbationPractitionerDetailsPresenter(referral, [], [], deliusResponsibleOfficer)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ConfirmProbationPractitionerDetailsPresenter(referral, [], [], deliusResponsibleOfficer, {
          errors: [
            {
              formFields: ['probation-practitioner-name'],
              errorSummaryLinkedField: 'probation-practitioner-name',
              message: 'probation-practitioner-name msg',
            },
            {
              formFields: ['probation-practitioner-pdu'],
              errorSummaryLinkedField: 'probation-practitioner-pdu',
              message: 'probation-practitioner-pdu msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'probation-practitioner-name', message: 'probation-practitioner-name msg' },
          { field: 'probation-practitioner-pdu', message: 'probation-practitioner-pdu msg' },
        ])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
      const presenter = new ConfirmProbationPractitionerDetailsPresenter(referral, [], [], deliusResponsibleOfficer)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/submit-current-location`)
      expect(presenter.text).toEqual({
        title: 'Confirm probation practitioner details',
        description: 'These contact details will be sent to the service provider for the referral. Are they correct?',
        confirmCorrectDetailsFormDescription: 'Enter the correct contact details to be sent to the service provider.',
        confirmDetails: {
          errorMessage: null,
        },
        probationPractitionerName: {
          label: 'Name',
          errorMessage: null,
        },
        probationPractitionerEmail: {
          label: 'Email address (if known)',
          errorMessage: null,
        },
        probationPractitionerPduSelect: {
          label: 'PDU (probation delivery input)',
          hint: `Start typing, then choose from the list.`,
          errorMessage: null,
        },
        probationPractitionerOfficeSelect: {
          label: 'Which probation office are they in? (If known)',
          hint: `Start typing, then choose from the list.`,
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new ConfirmProbationPractitionerDetailsPresenter(referral, [], [], deliusResponsibleOfficer, {
          errors: [
            {
              formFields: ['confirm-details'],
              errorSummaryLinkedField: 'confirm-details',
              message: 'confirm-details msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          confirmDetails: {
            errorMessage: 'confirm-details msg',
          },
        })
      })
    })
  })
})
