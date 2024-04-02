import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import ConfirmMainPointOfContactDetailsPresenter from './confirmMainPointOfContactDetailsPresenter'

describe('ConfirmMainPointOfContactDetailsPresenter', () => {
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

  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ConfirmMainPointOfContactDetailsPresenter(referral, [], [], [], deliusResponsibleOfficer)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new ConfirmMainPointOfContactDetailsPresenter(
          referral,
          [],
          [],
          [],
          deliusResponsibleOfficer,
          {
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
          }
        )

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
      const presenter = new ConfirmMainPointOfContactDetailsPresenter(referral, [], [], [], deliusResponsibleOfficer)

      expect(presenter.backLinkUrl).toBe(`/referrals/${referral.id}/form`)
      expect(presenter.text).toEqual({
        title: 'Confirm main point of contact details',
        label: 'Geoffrey Blue (CRN: X123456)',
        description:
          'These details will be sent to the service provider. When a probation practitioner is allocated these details will be replaced.',
        location: {
          errorMessage: null,
        },
        probationPractitionerName: {
          label: 'Name',
          errorMessage: null,
        },
        probationPractitionerPhoneNumber: {
          label: 'Phone number',
          errorMessage: null,
        },
        probationRoleOrJobTitle: {
          label: 'Role / job title',
          errorMessage: null,
        },
        probationPractitionerEmail: {
          label: 'Email address',
          errorMessage: null,
        },
        probationPractitionerEstablishmentSelect: {
          label: 'Establishment',
          hint: `Start typing then choose prison name from the list.`,
          errorMessage: null,
        },
        probationPractitionerOfficeSelect: {
          label: 'Probation office',
          hint: `Start typing then choose probation office from the list.`,
          errorMessage: null,
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new ConfirmMainPointOfContactDetailsPresenter(
          referral,
          [],
          [],
          [],
          deliusResponsibleOfficer,
          {
            errors: [
              {
                formFields: ['location'],
                errorSummaryLinkedField: 'location',
                message: 'location msg',
              },
            ],
          }
        )

        expect(presenter.text).toMatchObject({
          location: {
            errorMessage: 'location msg',
          },
        })
      })
    })
  })
})
