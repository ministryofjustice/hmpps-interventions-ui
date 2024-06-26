import { Express } from 'express'
import request from 'supertest'
import createError from 'http-errors'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import caseNoteFactory from '../../../testutils/factories/caseNote'
import pageFactory from '../../../testutils/factories/page'
import { CaseNote } from '../../models/caseNote'
import { Page } from '../../models/pagination'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import userDetailsFactory from '../../../testutils/factories/userDetails'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import { createDraftFactory } from '../../../testutils/factories/draft'
import DraftsService from '../../services/draftsService'
import { DraftCaseNote } from './caseNotesController'
import interventionFactory from '../../../testutils/factories/intervention'

jest.mock('../../services/interventionsService')
jest.mock('../../services/ramDeliusApiService')
jest.mock('../../services/hmppsAuthService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>
const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>
const draftCaseNoteFactory = createDraftFactory<DraftCaseNote>(null)
const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

let app: Express

afterEach(() => {
  jest.resetAllMocks()
})

describe.each([
  { userType: 'service-provider', source: AppSetupUserType.serviceProvider },
  { userType: 'probation-practitioner', source: AppSetupUserType.serviceProvider },
])('as a %s user', user => {
  beforeEach(() => {
    app = appWithAllRoutes({
      overrides: {
        interventionsService,
        ramDeliusApiService,
        hmppsAuthService,
        draftsService,
      },
      userType: user.source,
    })
  })
  const sentReferral = sentReferralFactory.build()

  describe(`GET /${user.userType}/referrals/:id/case-notes`, () => {
    it('displays all case notes', async () => {
      const caseNote = caseNoteFactory.build({ subject: 'case note 1 subject', body: 'case note 1 body text' })
      const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())
      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('case note 1 subject')
          expect(res.text).toContain('case note 1 body text')
        })
    })

    it('should call hmpss auth', async () => {
      const caseNote = caseNoteFactory.build({
        sentBy: { authSource: 'auth' },
      })
      const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(
        userDetailsFactory.build({ name: 'firstName lastName' })
      )
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())

      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('firstName lastName')
        })
    })

    describe('and there is a failure to call hmpps auth', () => {
      it('should display username instead', async () => {
        const caseNote = caseNoteFactory.build({
          sentBy: { username: 'username', authSource: 'auth' },
        })
        const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
        interventionsService.getSentReferral.mockResolvedValue(sentReferral)
        interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())
        hmppsAuthService.getUserDetailsByUsername.mockRejectedValue(createError(404))
        ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())
        await request(app)
          .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Deactivated R&M account')
          })
      })
    })

    it('should combine the same users into a single call', async () => {
      const caseNote1 = caseNoteFactory.build({
        sentBy: { userId: '1', username: 'username', authSource: 'delius' },
      })
      const caseNote2 = caseNoteFactory.build({
        sentBy: { userId: '1', username: 'username', authSource: 'delius' },
      })
      const caseNotePage = pageFactory.pageContent([caseNote1, caseNote2]).build() as Page<CaseNote>
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(
        userDetailsFactory.build({ name: 'firstName surname' })
      )
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())
      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('firstName surname')
        })
      expect(hmppsAuthService.getUserDetailsByUsername).toHaveBeenCalledTimes(1)
    })
  })

  describe(`POST /${user.userType}/referrals/:id/add-case-note/start`, () => {
    it('should generate a draft id and redirect to start of draft journey', async () => {
      const draftCaseNote = draftCaseNoteFactory.build()
      draftsService.createDraft.mockResolvedValue(draftCaseNote)
      await request(app)
        .post(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/start`)
        .expect(302)
        .expect('Location', `/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
      expect(draftsService.createDraft).toHaveBeenCalledWith('caseNote', null, { userId: '123' })
    })
  })

  describe(`GET /${user.userType}/referrals/:id/add-case-note/:draftCaseNoteId/details`, () => {
    it('should present an empty form if the draft is new', async () => {
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())

      const draftCaseNote = draftCaseNoteFactory.build()
      draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
        .expect(200)
    })

    it('should present an render draft case note values if the draft already exists', async () => {
      const draftCaseNote = draftCaseNoteFactory.build({
        data: caseNoteFactory.build({ subject: 'case note subject text', body: 'case note body text' }),
      })
      draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())

      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('case note subject text')
          expect(res.text).toContain('case note body text')
        })
    })

    describe('when draft object no longer exists', () => {
      it('should render an appropriate error page', async () => {
        draftsService.fetchDraft.mockResolvedValue(null)
        interventionsService.getSentReferral.mockResolvedValue(sentReferral)
        hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())

        await request(app)
          .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/non-existent-draft/details`)
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain('You have not sent this case note.')
          })
      })
    })
  })

  describe(`POST /${user.userType}/referrals/:id/add-case-note/:draftCaseNoteId/details`, () => {
    describe('when there is an error', () => {
      it('should display errors to the user', async () => {
        const draftCaseNote = draftCaseNoteFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
        interventionsService.getSentReferral.mockResolvedValue(sentReferral)
        hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())
        await request(app)
          .post(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
          .type('form')
          .send({})
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Enter a subject for your case note')
            expect(res.text).toContain('Enter some details about your case note')
          })
      })
    })

    describe('when there are no validation failures', () => {
      it('should direct users to relevant page', async () => {
        const draftCaseNote = draftCaseNoteFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
        interventionsService.getSentReferral.mockResolvedValue(sentReferral)
        hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build())

        await request(app)
          .post(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
          .type('form')
          .send({ 'case-note-subject': 'subject', 'case-note-body': 'body', 'send-case-note-email': false })
          .expect(302)
          .expect(
            'Location',
            `/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/check-answers`
          )
      })
    })
  })

  describe(`GET /${user.userType}/referrals/:id/add-case-note/:draftCaseNoteId/check-answers`, () => {
    it('should provide a summary of case note draft', async () => {
      const draftCaseNote = draftCaseNoteFactory.build({
        data: caseNoteFactory.build({ subject: 'case note subject text', body: 'case note body text' }),
      })
      draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
      hmppsAuthService.getUserDetails.mockResolvedValue(userDetailsFactory.build())

      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())

      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/check-answers`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('case note subject text')
          expect(res.text).toContain('case note body text')
        })
    })
  })

  describe(`POST /${user.userType}/referrals/:id/add-case-note/:draftCaseNoteId/submit`, () => {
    it('should submit draft case note to interventions service', async () => {
      const draftCaseNote = draftCaseNoteFactory.build({
        data: caseNoteFactory.build({ subject: 'case note subject text', body: 'case note body text' }),
      })
      draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
      await request(app)
        .post(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/submit`)
        .expect(302)
        .expect('Location', `/${user.userType}/referrals/${sentReferral.id}/add-case-note/confirmation`)
    })
  })

  describe(`GET /${user.userType}/referrals/:id/add-case-note/confirmation`, () => {
    it('should show confirmation of case note added', async () => {
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build({}))

      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/confirmation`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('New case note added')
        })
    })
  })

  describe(`GET /${user.userType}/case-note/:caseNoteId`, () => {
    it('should provide a summary of case note', async () => {
      const caseNote = caseNoteFactory.build({
        subject: 'case note subject text',
        body: 'case note body text',
        sentAt: '2021-01-01T09:45:21.986389Z',
      })
      const userDetails = userDetailsFactory.build({ name: 'firstName lastName' })
      interventionsService.getCaseNote.mockResolvedValue(caseNote)
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetails)

      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())

      await request(app)
        .get(`/${user.userType}/case-note/${caseNote.id}`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('case note subject text')
          expect(res.text).toContain('case note body text')
          expect(res.text).toContain('1 January 2021')
          expect(res.text).toContain('9:45am')
          expect(res.text).toContain('firstName lastName')
        })
    })
  })
})
