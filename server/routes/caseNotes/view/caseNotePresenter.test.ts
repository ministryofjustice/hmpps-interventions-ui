import caseNoteFactory from '../../../../testutils/factories/caseNote'
import CaseNotePresenter from './caseNotePresenter'

describe('CaseNotePresenter', () => {
  describe('generated links', () => {
    it('should show correct back link for service provider', () => {
      const presenter = new CaseNotePresenter(
        caseNoteFactory.build({ referralId: '8b588c52-91fd-48fa-89fe-6438748bceda' }),
        'firstName lastName',
        'service-provider'
      )
      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/case-notes'
      )
    })

    it('should show correct back link for probation practitioner', () => {
      const presenter = new CaseNotePresenter(
        caseNoteFactory.build({ referralId: '8b588c52-91fd-48fa-89fe-6438748bceda' }),
        'firstName lastName',
        'probation-practitioner'
      )
      expect(presenter.backLinkHref).toEqual(
        '/probation-practitioner/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/case-notes'
      )
    })
  })

  describe('caseNoteSummary', () => {
    it('should display correct summary for a case note', () => {
      const presenter = new CaseNotePresenter(
        caseNoteFactory.build({
          subject: 'Case note subject',
          body: 'Case note body text',
          sentAt: '2021-01-01T09:45:21.986389Z',
        }),
        'firstName lastName',
        'probation-practitioner'
      )
      expect(presenter.caseNoteSummary.subject).toEqual('Case note subject')
      expect(presenter.caseNoteSummary.body).toEqual('Case note body text')
      expect(presenter.caseNoteSummary.date).toEqual('1 January 2021')
      expect(presenter.caseNoteSummary.time).toEqual('9:45am')
      expect(presenter.caseNoteSummary.from).toEqual('firstName lastName')
    })
  })
})
