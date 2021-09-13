import AddCaseNotePresenter from './addCaseNotePresenter'
import caseNoteFactory from '../../../../testutils/factories/caseNote'
import { FormValidationError } from '../../../utils/formValidationError'

describe('AddCaseNotePresenter', () => {
  const referralId = '8b588c52-91fd-48fa-89fe-6438748bceda'
  describe('backLinkHref', () => {
    it('should show correct back link for service provider', () => {
      const presenter = new AddCaseNotePresenter(referralId, 'service-provider')
      expect(presenter.backLinkHref).toEqual(
        '/service-provider/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/case-notes'
      )
    })

    it('should show correct back link for probation practitioner', () => {
      const presenter = new AddCaseNotePresenter(referralId, 'probation-practitioner')
      expect(presenter.backLinkHref).toEqual(
        '/probation-practitioner/referrals/8b588c52-91fd-48fa-89fe-6438748bceda/case-notes'
      )
    })
  })

  describe('fields', () => {
    describe("when a case note draft doesn't exist", () => {
      it('should show null values for case note fields', () => {
        const presenter = new AddCaseNotePresenter(referralId, 'service-provider')
        expect(presenter.fields).toEqual({
          subject: { errorMessage: null, value: '' },
          body: { errorMessage: null, value: '' },
        })
      })
    })

    describe('when a case note draft has been provided', () => {
      it('should show case note values for case note fields', () => {
        const caseNote = caseNoteFactory.build({ subject: 'subject', body: 'body' })
        const presenter = new AddCaseNotePresenter(referralId, 'service-provider', caseNote)
        expect(presenter.fields).toEqual({
          subject: { errorMessage: null, value: 'subject' },
          body: { errorMessage: null, value: 'body' },
        })
      })
    })

    describe('when there are errors returned', () => {
      it('should show error messages for each field', () => {
        const error: FormValidationError = {
          errors: [
            {
              formFields: ['case-note-subject'],
              errorSummaryLinkedField: 'case-note-subject',
              message: 'subject error',
            },
            { formFields: ['case-note-body'], errorSummaryLinkedField: 'case-note-body', message: 'body error' },
          ],
        }
        const presenter = new AddCaseNotePresenter(referralId, 'service-provider', null, error)
        expect(presenter.fields).toEqual({
          subject: { errorMessage: 'subject error', value: '' },
          body: { errorMessage: 'body error', value: '' },
        })
      })
    })
  })
})
