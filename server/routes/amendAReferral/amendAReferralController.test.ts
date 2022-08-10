import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import referralDetails from '../../../testutils/factories/referralDetails'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import sentReferral from '../../../testutils/factories/sentReferral'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

let app: Express
let referral: SentReferral

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService },
    userType: AppSetupUserType.probationPractitioner,
  })
  referral = sentReferral.build()
})

describe('GET /probation-practitioner/referrals/:id/update-maximum-enforceable-days', () => {
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
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
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

describe('GET /probation-practitioner/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', () => {
  let serviceCategory: ServiceCategory

  beforeEach(() => {
    serviceCategory = serviceCategoryFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders the page to update desired outcomes', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/${serviceCategory.id}/update-desired-outcomes`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What is the reason for changing the desired outcomes?')
      })
  })
})

describe('POST /probation-practitioner/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', () => {
  let serviceCategory: ServiceCategory

  beforeEach(() => {
    serviceCategory = serviceCategoryFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.updateDesiredOutcomesForServiceCategory.mockResolvedValue(null)
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/${serviceCategory.id}/update-desired-outcomes`)
      .send({
        'reason-for-change': 'new value',
        'desired-outcomes-ids': ['outcome1', 'outcome2'],
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/${serviceCategory.id}/update-desired-outcomes`)
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('A reason for changing the referral must be supplied')
        })
    })
  })
})
