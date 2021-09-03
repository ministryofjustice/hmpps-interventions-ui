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

jest.mock('../../services/interventionsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

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
      },
      userType: user.source,
    })
  })

  describe(`GET /${user.userType}/referrals/:id/case-notes`, () => {
    it('displays all case notes', async () => {
      const sentReferral = sentReferralFactory.build()
      const caseNote = caseNoteFactory.build({ subject: 'case note 1 subject', body: 'case note 1 body text' })
      const caseNotePage: Page<CaseNote> = pageFactory.pageContent([caseNote]).build() as Page<CaseNote>
      interventionsService.getCaseNotes.mockResolvedValue(caseNotePage)
      await request(app)
        .get(`/${user.userType}/referrals/${sentReferral.id}/case-notes`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('case note 1 subject')
          expect(res.text).toContain('case note 1 body text')
        })
    })
  })
})
