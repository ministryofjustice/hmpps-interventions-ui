import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import referralDetails from '../../../testutils/factories/referralDetails'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import sentReferral from '../../../testutils/factories/sentReferral'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService },
    userType: AppSetupUserType.probationPractitioner,
  })
})

describe('GET /probation-practitioner/referrals/:id/update-maximum-enforceable-days', () => {
  const referral = sentReferral.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to start a referral', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/update-maximum-enforceable-days`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What is the reason for changing the maximum number of days?')
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/update-maximum-enforceable-days', () => {
  const referral = sentReferral.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/update-maximum-enforceable-days`)
      .send({ 'reason-for-change': 'new value', 'maximum-enforceable-days': 10 })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/update-maximum-enforceable-days`)
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('A reason for changing the referral must be supplied')
        })
    })
  })
})
