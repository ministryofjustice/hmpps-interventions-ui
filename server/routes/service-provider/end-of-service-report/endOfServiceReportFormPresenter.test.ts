import EndOfServiceReportFormPresenter from './endOfServiceReportFormPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'

describe(EndOfServiceReportFormPresenter, () => {
  const referral = sentReferralFactory.build({
    referral: {
      desiredOutcomes: [
        { serviceCategoryId: '1', desiredOutcomesIds: ['1', '2'] },
        { serviceCategoryId: '2', desiredOutcomesIds: ['3', '4', '5'] },
      ],
    },
  })

  describe('title', () => {
    it('returns the title for all the form pages', () => {
      const presenter = new EndOfServiceReportFormPresenter('Personal Wellbeing', referral).checkAnswersPage
      expect(presenter.text.title).toEqual('Personal wellbeing: End of service report')
    })
  })

  describe('numberOfPages', () => {
    it('returns the number of pages in the end of service report journey', () => {
      const presenter = new EndOfServiceReportFormPresenter('Personal Wellbeing', referral).checkAnswersPage
      expect(presenter.text.numberOfPages).toEqual('7')
      expect(presenter.text.title).toEqual('Personal wellbeing: End of service report')
    })
  })

  describe('.outcomePage', () => {
    it('has the correct page number', () => {
      const presenter = new EndOfServiceReportFormPresenter('Personal Wellbeing', referral).desiredOutcomePage(2)
      expect(presenter.text.pageNumber).toEqual('2')
      expect(presenter.text.title).toEqual('Personal wellbeing: End of service report')
    })
  })

  describe('.furtherInformationPage', () => {
    it('has the correct page number', () => {
      const presenter = new EndOfServiceReportFormPresenter('Personal Wellbeing', referral).furtherInformationPage
      expect(presenter.text.pageNumber).toEqual('6')
      expect(presenter.text.title).toEqual('Personal wellbeing: End of service report')
    })
  })

  describe('.checkAnswersPage', () => {
    it('has the correct page number', () => {
      const presenter = new EndOfServiceReportFormPresenter('Personal Wellbeing', referral).checkAnswersPage
      expect(presenter.text.pageNumber).toEqual('7')
      expect(presenter.text.title).toEqual('Personal wellbeing: End of service report')
    })
  })
})
