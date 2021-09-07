import { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import caseNoteFactory from '../../../testutils/factories/caseNote'
import pageFactory from '../../../testutils/factories/page'
import { CaseNote } from '../../models/caseNote'
import { Page } from '../../models/pagination'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import userDetailsFactory from '../../../testutils/factories/userDetails'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import { createDraftFactory } from '../../../testutils/factories/draft'
import DraftsService from '../../services/draftsService'
import { DraftCaseNote } from './caseNotesController'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>
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
        communityApiService,
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
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUserFactory.build())
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
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(
        userDetailsFactory.build({ name: 'firstName lastName' })
      )
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUserFactory.build())

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
        hmppsAuthService.getUserDetailsByUsername.mockImplementation(() => {
          return Promise.reject()
        })
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUserFactory.build())
        await request(app)
          .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('username')
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
      const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote1, caseNote2]).build() as Page<CaseNote>
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(
        userDetailsFactory.build({ name: 'firstName surname' })
      )
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUserFactory.build())
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
        await request(app)
          .get(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/non-existent-draft/details`)
          .expect(500)
          .expect(res => {
            expect(res.text).toContain(
              'Too much time has passed since you started creating this case note. Your answers have not been saved, and you will need to start again.'
            )
          })
      })
    })
  })

  describe(`POST /${user.userType}/referrals/:id/add-case-note/:draftCaseNoteId/details`, () => {
    describe('when there is an error', () => {
      it('should display errors to the user', async () => {
        const draftCaseNote = draftCaseNoteFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftCaseNote)
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
        await request(app)
          .post(`/${user.userType}/referrals/${sentReferral.id}/add-case-note/${draftCaseNote.id}/details`)
          .type('form')
          .send({ 'case-note-subject': 'subject', 'case-note-body': 'body' })
          .expect(302)
          .expect('Location', `/${user.userType}/referrals/${sentReferral.id}/case-notes`)
      })
    })
  })
})
