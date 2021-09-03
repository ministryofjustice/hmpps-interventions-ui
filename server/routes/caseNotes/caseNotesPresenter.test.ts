import caseNoteFactory from '../../../testutils/factories/caseNote'
import pageFactory from '../../../testutils/factories/page'
import CaseNotesPresenter from './caseNotesPresenter'
import { CaseNote } from '../../models/caseNote'
import { Page } from '../../models/pagination'

describe('CaseNotesPresenter', () => {
  describe('tableRows', () => {
    it('should format sent day correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page)
      expect(presenter.tableRows[0].sentAtDay).toEqual('Friday')
    })

    it('should format sent date correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page)
      expect(presenter.tableRows[0].sentAtDate).toEqual('1 January 2021')
    })

    it('should format sent time correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page)
      expect(presenter.tableRows[0].sentAtTime).toEqual('9:45am')
    })
  })
})
