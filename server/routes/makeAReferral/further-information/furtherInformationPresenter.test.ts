import FurtherInformationPresenter from './furtherInformationPresenter'
import interventionFactory from '../../../../testutils/factories/intervention'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'

describe('FurtherInformationPresenter', () => {
  const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
  const draftReferral = draftReferralFactory.build()

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new FurtherInformationPresenter(draftReferral, intervention)
      expect(presenter.title).toEqual(
        "Do you have further information for the Women's service referral service provider? (optional)"
      )
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const presenter = new FurtherInformationPresenter(draftReferral, intervention)
      expect(presenter.hint).toEqual(
        'For example, relevant previous offences, previously completed programmes or further reasons for this referral'
      )
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, intervention)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns an error message', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, intervention, {
          errors: [
            {
              formFields: ['further-information'],
              errorSummaryLinkedField: 'further-information',
              message: 'Something went wrong, please try again',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Something went wrong, please try again')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, intervention)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, intervention, {
          errors: [
            {
              formFields: ['further-information'],
              errorSummaryLinkedField: 'further-information',
              message: 'Something went wrong, please try again',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          {
            field: 'further-information',
            message: 'Something went wrong, please try again',
          },
        ])
      })
    })
  })

  describe('value', () => {
    describe('when the referral already has further information set', () => {
      it('uses that further information as the value attribute', () => {
        draftReferral.furtherInformation = 'Some information about the service user'
        const presenter = new FurtherInformationPresenter(draftReferral, intervention)

        expect(presenter.value).toEqual('Some information about the service user')
      })
    })

    describe('when there is user input data', () => {
      it('uses that further information as the value attribute', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, intervention, null, {
          'further-information': 'Some information about the service user',
        })

        expect(presenter.value).toEqual('Some information about the service user')
      })
    })

    describe('when the referral already has further information and there is user input data', () => {
      it('sets the new input data as the further information value', () => {
        draftReferral.furtherInformation = 'Some old information about the service user'
        const presenter = new FurtherInformationPresenter(draftReferral, intervention, null, {
          'further-information': 'Some new information about the service user',
        })

        expect(presenter.value).toEqual('Some new information about the service user')
      })
    })
  })
})
