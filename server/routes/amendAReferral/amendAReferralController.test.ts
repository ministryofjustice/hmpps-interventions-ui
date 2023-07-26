import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import referralDetails from '../../../testutils/factories/referralDetails'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import sentReferral from '../../../testutils/factories/sentReferral'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'

jest.mock('../../services/interventionsService')
jest.mock('../../services/ramDeliusApiService')
const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>

let app: Express
let referral: SentReferral

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, ramDeliusApiService },
    userType: AppSetupUserType.probationPractitioner,
  })
  referral = sentReferral.build()
})

describe('GET /probation-practitioner/referrals/:id/update-maximum-enforceable-days', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
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

describe('GET /probation-practitioner/referrals/:id/interpreter-needs', () => {
  const serviceUser = deliusServiceUser.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
  })

  it('allows pp to change referral language needs', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/interpreter-needs`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Does ${serviceUser?.name?.forename} need an interpreter?`)
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/interpreter-needs', () => {
  const serviceUser = deliusServiceUser.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
    interventionsService.updateNeedsAndRequirments.mockImplementation(() => {
      return Promise.resolve()
    })
  })

  it('updates changes of referral language needs and redirects successfully', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/interpreter-needs`)
      .send({
        'reason-for-change': 'some reason',
        needsInterpreter: 'true',
        'interpreter-language': 'French',
        changesMade: 'true',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })
  it('updates changes of referral language needs redirects when no changes made', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/interpreter-needs`)
      .send({
        'reason-for-change': 'some reason',
        'needs-interpreter': 'yes',
        'interpreter-language': 'Spanish',

        originalInterpreterNeeds: {
          needsInterpreter: 'yes',
          intepreterLanguage: 'Spanish',
        },
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/interpreter-needs?noChanges=true`)
  })
})

describe('POST /probation-practitioner/referrals/:id/update-maximum-enforceable-days', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
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
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
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

describe('GET /referrals/:referralId/update-additional-information', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to update additional information', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/update-additional-information`)
      .expect(200)
  })
})

describe('POST /probation-practitioner/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', () => {
  let serviceCategory: ServiceCategory

  beforeEach(() => {
    serviceCategory = serviceCategoryFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
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
    it('redirects to amend referral with changesMade query param set if no changes made', () => {
      const desiredOutcomes = referral.referral.desiredOutcomes[0]
      return request(app)
        .post(
          `/probation-practitioner/referrals/${referral.id}/${desiredOutcomes.serviceCategoryId}/update-desired-outcomes`
        )
        .send({
          'reason-for-change': 'no changes to outcomes',
          'desired-outcomes-ids': desiredOutcomes.desiredOutcomesIds,
        })
        .expect(302)
        .expect(
          'Location',
          `/probation-practitioner/referrals/${referral.id}/${desiredOutcomes.serviceCategoryId}/update-desired-outcomes?noChanges=true`
        )
    })

    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/${serviceCategory.id}/update-desired-outcomes`)
        .send({ 'reason-for-change': ' ', 'desired-outcomes-ids': ['3415a6f2-38ef-4613-bb95-33355deff17e'] })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('A reason for changing the referral must be supplied')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/update-complexity-level', () => {
  const socialInclusionServiceCategory = serviceCategoryFactory.build({
    id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
    name: 'social inclusion',
  })
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(
        `/probation-practitioner/referrals/${referral.id}/service-category/${socialInclusionServiceCategory.id}/update-complexity-level`
      )
      .send({ 'reason-for-change': 'new value', 'complexity-level-id': '10' })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(
          `/probation-practitioner/referrals/${referral.id}/service-category/${socialInclusionServiceCategory.id}/update-complexity-level`
        )
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('A reason for changing the referral must be supplied')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/employment-responsibilities', () => {
  const socialInclusionServiceCategory = serviceCategoryFactory.build({
    id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
    name: 'social inclusion',
  })
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/employment-responsibilities`)
      .send({
        'reason-for-change': 'new value',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': '9 to 5',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/employment-responsibilities`)
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('A reason for changing the referral must be supplied')
        })
    })
  })

  it('redirects to same page with no changes banner when no changes are made', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/employment-responsibilities`)
      .send({
        'reason-for-change': 'new value',
        'has-additional-responsibilities': `${referral.referral.hasAdditionalResponsibilities ? 'yes' : 'no'}`,
        'when-unavailable': `${referral.referral.whenUnavailable}`,
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/employment-responsibilities?noChanges=true`)
  })
})

describe('GET /probation-practitioner/referrals/:id/employment-responsibilities', () => {
  let serviceCategory: ServiceCategory

  beforeEach(() => {
    serviceCategory = serviceCategoryFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders the page to employment responsibilities', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/employment-responsibilities`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do you want to change whether Alex has caring or employment responsibilities?')
      })
  })
})
