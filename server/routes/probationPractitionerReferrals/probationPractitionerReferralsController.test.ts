import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'

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

describe('GET /probation-practitioner/find', () => {
  interventionsService.getDraftReferralsForUser.mockResolvedValue([])

  it('displays a dashboard page', async () => {
    await request(app)
      .get('/probation-practitioner/find')
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
      .get('/probation-practitioner/find')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
      })
  })
})

describe('GET /probation-practitioner/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const serviceUser = deliusServiceUserFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { serviceCategoryId: serviceCategory.id },
    })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Intervention sessions')
        expect(res.text).toContain('These show the progress of each intervention session')
      })
  })
})
