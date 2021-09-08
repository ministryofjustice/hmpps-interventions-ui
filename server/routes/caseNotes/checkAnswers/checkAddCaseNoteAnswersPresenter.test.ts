import caseNoteFactory from '../../../../testutils/factories/caseNote'
import CheckAddCaseNoteAnswersPresenter from './checkAddCaseNoteAnswersPresenter'
import userDetailsFactory from '../../../../testutils/factories/userDetails'

describe('CheckAddCaseNoteAnswersPresenter', () => {
  const referralId = '8b588c52-91fd-48fa-89fe-6438748bceda'
  const draftId = '1b188e6b-7ebd-42ec-8d2c-cb9af7d022d6'

  describe('generated links', () => {
    it('should show correct back link for service provider', () => {
      const presenter = new CheckAddCaseNoteAnswersPresenter(
        referralId,
        draftId,
        'service-provider',
        userDetailsFactory.build(),
        caseNoteFactory.build()
      )
      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/add-case-note/1b188e6b-7ebd-42ec-8d2c-cb9af7d022d6/details'
      )
      expect(presenter.submitHref).toEqual(
        '/service-provider/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/add-case-note/1b188e6b-7ebd-42ec-8d2c-cb9af7d022d6/submit'
      )
    })

    it('should show correct back link for probation practitioner', () => {
      const presenter = new CheckAddCaseNoteAnswersPresenter(
        referralId,
        draftId,
        'probation-practitioner',
        userDetailsFactory.build(),
        caseNoteFactory.build()
      )
      expect(presenter.backLinkHref).toEqual(
        '/probation-practitioner/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/add-case-note/1b188e6b-7ebd-42ec-8d2c-cb9af7d022d6/details'
      )
      expect(presenter.submitHref).toEqual(
        '/probation-practitioner/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/add-case-note/1b188e6b-7ebd-42ec-8d2c-cb9af7d022d6/submit'
      )
    })
  })

  describe('caseNoteSummary', () => {
    it('should display correct summary for a case note', () => {
      const presenter = new CheckAddCaseNoteAnswersPresenter(
        referralId,
        draftId,
        'service-provider',
        userDetailsFactory.build({ name: 'firstName lastName' }),
        caseNoteFactory.build({ subject: 'subject', body: 'body' })
      )
      expect(presenter.caseNoteSummary.body).toEqual('body')
      expect(presenter.caseNoteSummary.subject).toEqual('subject')
      expect(presenter.caseNoteSummary.from).toEqual('firstName lastName')
    })
  })
})
