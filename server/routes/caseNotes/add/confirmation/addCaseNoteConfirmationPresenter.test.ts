import AddCaseNoteConfirmationPresenter from './addCaseNoteConfirmationPresenter'
import SentReferralFactory from '../../../../../testutils/factories/sentReferral'
import interventionFactory from '../../../../../testutils/factories/intervention'

describe('AddCaseNotePresenter', () => {
  describe('Link to case notes', () => {
    it('should show correct link to case notes for a service provider', () => {
      const presenter = new AddCaseNoteConfirmationPresenter(
        SentReferralFactory.build(),
        interventionFactory.build(),
        'service-provider'
      )
      expect(presenter.caseNotesHref).toEqual('/service-provider/referrals/1/case-notes')
    })

    it('should show correct link to case notes for a probation practitioner', () => {
      const presenter = new AddCaseNoteConfirmationPresenter(
        SentReferralFactory.build(),
        interventionFactory.build(),
        'probation-practitioner'
      )
      expect(presenter.caseNotesHref).toEqual('/probation-practitioner/referrals/2/case-notes')
    })
  })

  describe('What happend next text', () => {
    it('should show correct what happens next text for a service provider', () => {
      const presenter = new AddCaseNoteConfirmationPresenter(
        SentReferralFactory.build(),
        interventionFactory.build(),
        'service-provider'
      )
      expect(presenter.text.whatHappensNext).toEqual(
        'The probation practitioner will now be able to view the case note.'
      )
    })

    it('should show correct what happens next text for a probation practitioner', () => {
      const presenter = new AddCaseNoteConfirmationPresenter(
        SentReferralFactory.build(),
        interventionFactory.build(),
        'probation-practitioner'
      )
      expect(presenter.text.whatHappensNext).toEqual('The service provider will now be able to view the case note.')
    })
  })
})
