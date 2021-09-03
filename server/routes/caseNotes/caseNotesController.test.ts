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
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import userDetailsFactory from '../../../testutils/factories/userDetails'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

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
        hmppsAuthService,
      },
      userType: user.source,
    })
  })
  const sentReferral = sentReferralFactory.build()

  describe(`GET /${user.userType}/referrals/:id/case-notes`, () => {
    it('displays all case notes', async () => {
      const caseNote = caseNoteFactory.build({ subject: 'case note 1 subject', body: 'case note 1 body text' })
      const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
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
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(
        userDetailsFactory.build({ name: 'firstName lastName' })
      )
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
        interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
        hmppsAuthService.getUserDetailsByUsername.mockImplementation(() => {
          return Promise.reject()
        })
        await request(app)
          .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
          .expect(res => {
            expect(res.text).toContain('username')
          })
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
    interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
    hmppsAuthService.getUserDetailsByUsername.mockResolvedValue(userDetailsFactory.build({ name: 'firstName surname' }))
    await request(app)
      .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('firstName surname')
      })
    expect(hmppsAuthService.getUserDetailsByUsername).toHaveBeenCalledTimes(1)
  })
})
