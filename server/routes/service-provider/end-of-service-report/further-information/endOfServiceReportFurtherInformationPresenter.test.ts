import EndOfServiceReportFurtherInformationPresenter from './endOfServiceReportFurtherInformationPresenter'
import endOfServiceReportFactory from '../../../../../testutils/factories/endOfServiceReport'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'
import sentReferralFactory from '../../../../../testutils/factories/sentReferral'

describe(EndOfServiceReportFurtherInformationPresenter, () => {
  const endOfServiceReport = endOfServiceReportFactory.build({ furtherInformation: 'Some further information' })
  const serviceCategory = serviceCategoryFactory.build()
  const referral = sentReferralFactory.build()

  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new EndOfServiceReportFurtherInformationPresenter(endOfServiceReport, serviceCategory, referral)

      expect(presenter.text).toEqual({
        subTitle: 'Would you like to give any additional information about this intervention (optional)?',
      })
    })
  })

  describe('fields', () => {
    describe('furtherInformation', () => {
      describe('when there is no user input data', () => {
        it('returns the value from the model', () => {
          const presenter = new EndOfServiceReportFurtherInformationPresenter(
            endOfServiceReport,
            serviceCategory,
            referral,
            null
          )

          expect(presenter.fields).toEqual({ furtherInformation: { value: 'Some further information' } })
        })
      })

      describe('when there is user input data', () => {
        it('returns the user input value', () => {
          const presenter = new EndOfServiceReportFurtherInformationPresenter(
            endOfServiceReport,
            serviceCategory,
            referral,
            {
              'further-information': 'Some user input further information',
            }
          )

          expect(presenter.fields).toEqual({ furtherInformation: { value: 'Some user input further information' } })
        })
      })
    })
  })
})
