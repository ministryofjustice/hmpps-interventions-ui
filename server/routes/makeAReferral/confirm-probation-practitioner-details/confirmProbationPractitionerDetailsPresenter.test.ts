import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmProbationPractitionerDetailsPresenter from './confirmProbationPractitionerDetailsPresenter'

describe('ConfirmProbationPractitionerDetailsPresenter', () => {
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

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/form`)
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
        label: 'Geoffrey Blue (CRN: X123456)',
        probationPractitionerEmail: {
          label: 'Email address (if known)',
          errorMessage: null,
        },
        probationPractitionerPduSelect: {
          label: 'PDU (Probation Delivery Unit)',
          hint: `Start typing then choose from the list.`,
          errorMessage: null,
        },
        probationPractitionerOfficeSelect: {
          label: 'Which probation office are they in? (If known)',
          hint: `Start typing then choose from the list.`,
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

  describe('summary list items', () => {
    it('returns summary list items when all the optional elements are returned with value', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({
          ndeliusPPName: 'Alex River',
          ndeliusPPEmailAddress: 'a.z@xyz.com',
          ndeliusPDU: 'London',
          ndeliusPhoneNumber: '07503434343',
          ndeliusTeamPhoneNumber: '020-2323232322',
          ppProbationOffice: 'Sheffield',
          serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' },
        })
      const presenter = new ConfirmProbationPractitionerDetailsPresenter(referral, [], [], deliusResponsibleOfficer)

      expect(presenter.summary).toEqual([
        {
          key: 'Name',
          lines: ['Alex River'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-name`,
        },
        {
          key: 'Email address',
          lines: ['a.z@xyz.com'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-email-address`,
          deleteLink: `/referrals/${referral.id}/delete-probation-practitioner-email-address`,
          valueLink: undefined,
        },
        {
          key: 'Phone number',
          lines: ['07503434343'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-phone-number`,
          deleteLink: `/referrals/${referral.id}/delete-probation-practitioner/phone-number`,
          valueLink: undefined,
        },
        {
          key: 'PDU (Probation Delivery Unit)',
          lines: ['London'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-pdu`,
        },
        {
          key: 'Probation office',
          lines: ['Sheffield'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-office`,
          deleteLink: `/referrals/${referral.id}/delete-probation-practitioner/probation-office`,
          valueLink: undefined,
        },
        {
          key: 'Team Phone number',
          lines: ['020-2323232322'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-team-phone-number`,
          deleteLink: `/referrals/${referral.id}/delete-probation-practitioner/team-phone-number`,
          valueLink: undefined,
        },
      ])
    })
    it('returns summary list items when not all the optional elements are returned with value', () => {
      const deliusResponsibleOfficerWithOptionalValuesNotPresent = {
        communityManager: {
          code: 'aaa',
          name: { forename: 'Bob', surname: 'Alice' },
          username: 'bobalice',
          email: null,
          telephoneNumber: null,
          responsibleOfficer: true,
          pdu: { code: 'L', description: 'London' },
          team: { code: 'R and M', description: 'R and M team', telephoneNumber: null, email: 'a.b@xyz.com' },
          unallocated: false,
        },
      }
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({
          ndeliusPPName: 'Alex River',
          ndeliusPPEmailAddress: null,
          ndeliusPDU: 'London',
          ndeliusPhoneNumber: null,
          ndeliusTeamPhoneNumber: null,
          ppProbationOffice: null,
          serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' },
        })
      const presenter = new ConfirmProbationPractitionerDetailsPresenter(
        referral,
        [],
        [],
        deliusResponsibleOfficerWithOptionalValuesNotPresent
      )

      expect(presenter.summary).toEqual([
        {
          key: 'Name',
          lines: ['Alex River'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-name`,
        },
        {
          key: 'Email address',
          lines: [`Not found`],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-email-address`,
          deleteLink: `/referrals/${referral.id}/delete-probation-practitioner-email-address`,
          valueLink: `<a href="/referrals/${referral.id}/update-probation-practitioner-email-address" class="govuk-link">Enter email address</a>`,
        },
        {
          key: 'Phone number',
          lines: [`Not found`],
          changeLink: undefined,
          deleteLink: undefined,
          valueLink: `<a href="/referrals/${referral.id}/update-probation-practitioner-phone-number" class="govuk-link">Enter phone number</a>`,
        },
        {
          key: 'PDU (Probation Delivery Unit)',
          lines: ['London'],
          changeLink: `/referrals/${referral.id}/update-probation-practitioner-pdu`,
        },
        {
          key: 'Probation office',
          lines: [`Not found`],
          changeLink: undefined,
          deleteLink: undefined,
          valueLink: `<a href="/referrals/${referral.id}/update-probation-practitioner-office" class="govuk-link">Enter probation office</a>`,
        },
        {
          key: 'Team Phone number',
          lines: [`Not found`],
          changeLink: undefined,
          valueLink: `<a href="/referrals/${referral.id}/update-probation-practitioner-team-phone-number" class="govuk-link">Enter team phone number</a>`,
        },
      ])
    })
  })
})
