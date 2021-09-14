import caseNoteFactory from '../../../../testutils/factories/caseNote'
import pageFactory from '../../../../testutils/factories/page'
import CaseNotesPresenter from './caseNotesPresenter'
import { CaseNote } from '../../../models/caseNote'
import { Page } from '../../../models/pagination'
import deliusServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'

describe('CaseNotesPresenter', () => {
  const referralId = 'e2e62d97-97ec-4f90-ae3d-006e42b0fc2d'
  describe('tableRows', () => {
    it('should format sent day correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build(),
        'service-provider'
      )
      expect(presenter.tableRows[0].sentAtDay).toEqual('Friday')
    })

    it('should format sent date correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build(),
        'service-provider'
      )
      expect(presenter.tableRows[0].sentAtDate).toEqual('1 January 2021')
    })

    it('should format sent time correctly', () => {
      const caseNote = caseNoteFactory.build({ sentAt: '2021-01-01T09:45:21.986389Z' })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      const presenter = new CaseNotesPresenter(
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build(),
        'service-provider'
      )
      expect(presenter.tableRows[0].sentAtTime).toEqual('9:45am')
    })

    it('should format the case note links correctly for the relevant logged in user', () => {
      const caseNote = caseNoteFactory.build({
        id: '025a807d-a631-4559-be74-664ba62db279',
        sentAt: '2021-01-01T09:45:21.986389Z',
      })
      const page = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      let presenter = new CaseNotesPresenter(
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build(),
        'service-provider'
      )
      expect(presenter.tableRows[0].caseNoteLink).toEqual(
        '/service-provider/case-note/025a807d-a631-4559-be74-664ba62db279'
      )
      presenter = new CaseNotesPresenter(
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build(),
        'probation-practitioner'
      )
      expect(presenter.tableRows[0].caseNoteLink).toEqual(
        '/probation-practitioner/case-note/025a807d-a631-4559-be74-664ba62db279'
      )
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
          const presenter = new CaseNotesPresenter(
            referralId,
            page,
            new Map(),
            deliusServiceUserFactory.build(),
            'service-provider'
          )
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
            referralId,
            page,
            new Map([['USER_1', undefined]]),
            deliusServiceUserFactory.build(),
            'service-provider'
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
            referralId,
            page,
            new Map([['USER_1', 'firstName lastName']]),
            deliusServiceUserFactory.build(),
            'service-provider'
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
        referralId,
        page,
        new Map(),
        deliusServiceUserFactory.build({ firstName: 'FIRSTNAME', surname: 'SURNAME' }),
        'service-provider'
      )
      expect(presenter.serviceUserName).toEqual('Firstname Surname')
    })
  })
})
