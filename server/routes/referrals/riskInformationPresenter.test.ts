import RiskInformationPresenter from './riskInformationPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'

describe('RiskInformationPresenter', () => {
  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey' } })
      const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build())

      expect(presenter.text).toEqual({
        title: 'Geoffrey’s risk information',
        additionalRiskInformation: {
          errorMessage: null,
          label: 'Information for the service provider about Geoffrey’s risks',
        },
      })
    })

    describe('when there are errors', () => {
      it('populates error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build(), {
          errors: [
            {
              formFields: ['additional-risk-information'],
              errorSummaryLinkedField: 'additional-risk-information',
              message: 'additionalRiskInformation msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          additionalRiskInformation: {
            errorMessage: 'additionalRiskInformation msg',
          },
        })
      })
    })
  })

  // This is tested in detail in the tests for ReferralDataPresenterUtils.
  // I’m just hoping to test a little here that things are glued together correctly.
  describe('fields', () => {
    describe('when the referral has no additional risk information', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.serviceUserSelected().build()
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build())

        expect(presenter.fields).toEqual({
          additionalRiskInformation: '',
        })
      })
    })

    describe('when the referral has additional risk information and there’s no user input', () => {
      it('replays the value from the referral', () => {
        const referral = draftReferralFactory
          .serviceUserSelected()
          .build({ additionalRiskInformation: 'Risk to the elderly' })
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build())

        expect(presenter.fields).toEqual({
          additionalRiskInformation: 'Risk to the elderly',
        })
      })
    })

    describe('when there’s user input', () => {
      it('replays the user input', () => {
        const referral = draftReferralFactory.serviceUserSelected().build()
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build(), null, {
          'additional-risk-information': 'Risk to the vulnerable',
        })

        expect(presenter.fields).toEqual({
          additionalRiskInformation: 'Risk to the vulnerable',
        })
      })
    })
  })

  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceUserSelected().build()
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build(), null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns the errors', () => {
        const referral = draftReferralFactory.serviceUserSelected().build()
        const presenter = new RiskInformationPresenter(referral, riskSummaryFactory.build(), {
          errors: [
            {
              formFields: ['additional-risk-information'],
              errorSummaryLinkedField: 'additional-risk-information',
              message: 'msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'additional-risk-information', message: 'msg' }])
      })
    })
  })
})
