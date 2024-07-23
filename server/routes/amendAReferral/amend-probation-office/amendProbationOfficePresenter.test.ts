import AmendProbationOfficePresenter from './amendProbationOfficePresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe('AmendProbationOfficePresenter', () => {
  const sentReferral = sentReferralFactory.build()
  describe('text', () => {
    it('contains a title, label, inputHeading and back link url', () => {
      const presenter = new AmendProbationOfficePresenter(sentReferral, [])

      expect(presenter.text.title).toEqual(`Update probation office`)
      expect(presenter.text.label).toEqual(
        `${sentReferral.referral.serviceUser.firstName} ${sentReferral.referral.serviceUser.lastName} (CRN: ${sentReferral.referral.serviceUser.crn})`
      )
      expect(presenter.text.inputHeading).toEqual('Probation office')
      expect(presenter.text.hint).toEqual('Start typing then choose probation office from the list')
      expect(presenter.backLinkUrl).toEqual(`/probation-practitioner/referrals/${sentReferral.id}/details`)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationOfficePresenter(sentReferral, [])
        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new AmendProbationOfficePresenter(sentReferral, [], {
          errors: [
            {
              formFields: ['probation-office'],
              errorSummaryLinkedField: 'probation-office',
              message: 'Enter a probation office',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Enter a probation office')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new AmendProbationOfficePresenter(sentReferral, [])
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new AmendProbationOfficePresenter(sentReferral, [], {
          errors: [
            {
              formFields: ['probation-office'],
              errorSummaryLinkedField: 'probation-office',
              message: 'Enter a probation office',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'probation-office',
            message: 'Enter a probation office',
          },
        ])
      })
    })
  })

  describe('fields', () => {
    describe('when there is user input data', () => {
      it('uses the value as the field value', () => {
        const presenter = new AmendProbationOfficePresenter(sentReferral, [], null, {
          'probation-office': `Barnet: Hendon Probation Office`,
        })
        expect(presenter.fields.probationOffice).toEqual(`Barnet: Hendon Probation Office`)
      })
    })
  })
})
