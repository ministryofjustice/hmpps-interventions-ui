import caseNoteFactory from '../../../testutils/factories/caseNote'
import pageFactory from '../../../testutils/factories/page'
import CaseNotesPresenter from './caseNotesPresenter'
import { CaseNote } from '../../models/caseNote'
import { Page } from '../../models/pagination'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'

describe('CaseNotesPresenter', () => {
  describe('tableRows', () => {
    it('should format sent day correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page, new Map(), deliusServiceUserFactory.build())
      expect(presenter.tableRows[0].sentAtDay).toEqual('Friday')
    })

    it('should format sent date correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page, new Map(), deliusServiceUserFactory.build())
      expect(presenter.tableRows[0].sentAtDate).toEqual('1 January 2021')
    })

    it('should format sent time correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(page, new Map(), deliusServiceUserFactory.build())
      expect(presenter.tableRows[0].sentAtTime).toEqual('9:45am')
    })

    describe('when displaying officer names', () => {
      describe("if the officer details don't exist", () => {
        it('should display the username', () => {
          const caseNote = caseNoteFactory.build({
            sentBy: {
              username: 'USER_1',
              userId: '1',
              authSource: 'delius',
            },
          })
          const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
          const presenter = new CaseNotesPresenter(page, new Map(), deliusServiceUserFactory.build())
          expect(presenter.tableRows[0].sentBy).toEqual('USER_1')
        })
      })

      describe("if the officer details couldn't be obtained", () => {
        it('should display the username', () => {
          const caseNote = caseNoteFactory.build({
            sentBy: {
              username: 'USER_1',
              userId: '1',
              authSource: 'delius',
            },
          })
          const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
          const presenter = new CaseNotesPresenter(
            page,
            new Map([['USER_1', undefined]]),
            deliusServiceUserFactory.build()
          )
          expect(presenter.tableRows[0].sentBy).toEqual('USER_1')
        })
      })

      describe('if the officer details exist', () => {
        it('should display the name', () => {
          const caseNote = caseNoteFactory.build({
            sentBy: {
              username: 'USER_1',
              userId: '1',
              authSource: 'delius',
            },
          })
          const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
          const presenter = new CaseNotesPresenter(
            page,
            new Map([['USER_1', 'firstName lastName']]),
            deliusServiceUserFactory.build()
          )
          expect(presenter.tableRows[0].sentBy).toEqual('firstName lastName')
        })
      })
    })
  })

  describe('serviceUserName', () => {
    it('should format the name correctly', () => {
      const caseNote = caseNoteFactory.build()
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(
        page,
        new Map(),
        deliusServiceUserFactory.build({ firstName: 'FIRSTNAME', surname: 'SURNAME' })
      )
      expect(presenter.serviceUserName).toEqual('Firstname Surname')
    })
  })
})
