import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'

import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')

const interventionsService = new InterventionsService(apiConfig.apis.interventionsService) as jest.Mocked<
  InterventionsService
>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/dashboard', () => {
  interventionsService.getDraftReferralsForUser.mockResolvedValue([])

  it('displays a dashboard page', async () => {
    await request(app)
      .get('/probation-practitioner/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Refer and monitor an intervention')
        expect(res.text).toContain('Find interventions')
      })
  })

  it('displays a list in-progress referrals', async () => {
    const referral = draftReferralFactory.serviceUserSelected().build()

    interventionsService.getDraftReferralsForUser.mockResolvedValue([referral])

    await request(app)
      .get('/probation-practitioner/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
      })
  })
})
