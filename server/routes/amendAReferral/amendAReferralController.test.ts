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
import AmendNeedsAndRequirementsForm from '../makeAReferral/needs-and-requirements/amendNeedsAndRequirementsForm'
import TestUtils from '../../../testutils/testUtils'
import errorMessages from '../../utils/errorMessages'

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

describe('GET /probation-practitioner/referrals/:id/update-needs-requirements', () => {
  const referral = sentReferral.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to update needs and requirement for probation practitioner for referral', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/update-needs-requirements`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do you want to change the needs and requirements? (optional)')
        expect(res.text).toContain('What&#39;s the reason for changing the needs and requirement?')
        expect(res.text).not.toContain('You need to add a reason for changing the needs and requirements')
        expect(res.text).toContain(`/probation-practitioner/referrals/${referral.id}/details`)
      })
  })

  it('redirects to the referral details page on success for update on needs and requirement', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/update-needs-requirements`)
      .send({ 'reason-for-change': 'new value', 'accessibility-needs': 'not today' })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })
  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/update-needs-requirements`)
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('You need to add a reason for changing the needs and requirements')
        })
    })
  })
})

describe(AmendNeedsAndRequirementsForm, () => {
  describe('data', () => {
    describe('when a valid reason is passed', () => {
      it('returns a paramsForUpdate with the reasonForChange property', async () => {
        const req = TestUtils.createRequest({
          'accessibility-needs': 'not today',
          'additional-needs-information': 'she needs help',
          'needs-interpreter': 'no',
          'reason-for-change': 'some reason',
        })
        const data = await new AmendNeedsAndRequirementsForm(req).data()

        expect(data.paramsForUpdate?.reasonForChange).toEqual('some reason')
        expect(data.paramsForUpdate?.accessibilityNeeds).toEqual('not today')
      })
    })
  })

  describe('invalid fields', () => {
    it('returns an error when the reason-for-change property is not present or empty', async () => {
      const requestWithMissingReason = TestUtils.createRequest({
        'accessibility-needs': 'not todays',
      })
      const missingData = await new AmendNeedsAndRequirementsForm(requestWithMissingReason).data()

      const requestWithEmptyReason = TestUtils.createRequest({
        'accessibility-needs': 'not today',
        'reason-for-change': '   ',
      })
      const emptyData = await new AmendNeedsAndRequirementsForm(requestWithEmptyReason).data()
      expect(requestWithMissingReason).not.toEqual(requestWithEmptyReason)
      expect(missingData).toEqual(emptyData)
      expect(missingData.error?.errors).toContainEqual({
        errorSummaryLinkedField: AmendNeedsAndRequirementsForm.reasonForChangeId,
        formFields: [AmendNeedsAndRequirementsForm.reasonForChangeId],
        message: errorMessages.amendNeedsAndRequirements.missingReason,
      })
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
