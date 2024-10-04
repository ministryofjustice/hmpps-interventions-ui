import request from 'supertest'
import { Express } from 'express'
import moment from 'moment-timezone'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import referralDetails from '../../../testutils/factories/referralDetails'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import prisonAndSecuredChildFactory from '../../../testutils/factories/secureChildAgency'
import prisonFactory from '../../../testutils/factories/prison'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import sentReferral from '../../../testutils/factories/sentReferral'
import SentReferral from '../../models/sentReferral'
import ServiceCategory from '../../models/serviceCategory'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import PrisonApiService from '../../services/prisonApiService'
import PrisonAndSecuredChildAgency from '../../models/prisonAndSecureChildAgency'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import ReferenceDataService from '../../services/referenceDataService'
import { CurrentLocationType } from '../../models/draftReferral'

jest.mock('../../services/interventionsService')
jest.mock('../../services/ramDeliusApiService')
jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/prisonApiService')
jest.mock('../../services/prisonAndSecuredChildAgencyService')
jest.mock('../../services/referenceDataService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>
const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>
const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>
const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
) as jest.Mocked<PrisonAndSecuredChildAgencyService>
const referenceDataService = new ReferenceDataService() as jest.Mocked<ReferenceDataService>

let app: Express
let referral: SentReferral

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, ramDeliusApiService, prisonAndSecuredChildAgencyService, referenceDataService },
    userType: AppSetupUserType.probationPractitioner,
  })
  referral = sentReferral.build()
})

afterEach(() => {
  jest.clearAllMocks()
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

describe('GET /referrals/:referralId/amend-reason-for-referral', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to update additional information', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/amend-reason-for-referral`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Provide the reason for this referral and further information for the service provider'
        )
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-reason-for-referral', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-reason-for-referral`)
      .send({
        'reason-for-change': 'new value',
        'amend-reason-for-referral': 'For custody and crs',
        'amend-reason-for-referral-further-information': 'more info',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-reason-for-referral`)
        .send({ 'reason-for-change': ' ' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain(
            'Provide the reason for this referral and further information for the service provider'
          )
        })
    })
  })
})

describe('GET /referrals/:referralId/amend-probation-practitioner-name', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to update additional information', () => {
    return request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/amend-probation-practitioner-name`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Update probation practitioner name')
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-probation-practitioner-name', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-probation-practitioner-name`)
      .send({
        'amend-probation-practitioner-name': 'Luke right',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-probation-practitioner-name`)
        .send({ 'amend-probation-practitioner-name': '' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter probation practitioner name')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-prison-establishment', () => {
  const prisonAndSecuredChildAgencyList = prisonAndSecuredChildFactory.build()
  const prisonList = prisonFactory.build()
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(prisonAndSecuredChildAgencyList)

    const prisonsAndSecuredChildAgencies: PrisonAndSecuredChildAgency[] = []

    prisonList.forEach(prison =>
      prisonsAndSecuredChildAgencies.push({ id: prison.prisonId, description: prison.prisonName })
    )
    prisonAndSecuredChildAgencyList.forEach(securedChildAgency =>
      prisonsAndSecuredChildAgencies.push({
        id: securedChildAgency.agencyId,
        description: securedChildAgency.description,
      })
    )
    prisonAndSecuredChildAgencyService.getPrisonsAndSecureChildAgencies.mockResolvedValue(
      prisonsAndSecuredChildAgencies
    )
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-prison-establishment`)
      .send({
        'reason-for-change': 'new value',
        'amend-prison-establishment': 'bbb',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-prison-establishment`)
        .send({
          'reason-for-change': 'new value',
          'amend-prison-establishment': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter a prison establishment')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-expected-release-date', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('redirects to the referral details page on success of amending expected release date', () => {
    const tomorrow = moment().add(5, 'days')
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-release-date`)
      .send({
        'release-date': 'confirm',
        'amend-expected-release-date-year': tomorrow.format('YYYY'),
        'amend-expected-release-date-month': tomorrow.format('M'),
        'amend-expected-release-date-day': tomorrow.format('D'),
        'amend-date-unknown-reason': null,
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors when amending expected release date', () => {
    it('renders an error message', () => {
      const tomorrow = moment().add(5, 'days')
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-release-date`)
        .send({
          'release-date': 'confirm',
          'amend-expected-release-date-year': '',
          'amend-expected-release-date-month': tomorrow.format('M'),
          'amend-expected-release-date-day': tomorrow.format('D'),
          'amend-date-unknown-reason': null,
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter the expected release date')
        })
    })
  })

  it('redirects to the referral details page on success of amending expected release date not known reason', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-release-date`)
      .send({
        'release-date': 'change',
        'amend-date-unknown-reason': 'some reason',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors when amending expected release date not known reason', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-release-date`)
        .send({
          'release-date': 'change',
          'amend-date-unknown-reason': null,
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter a reason')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-expected-probation-office', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    referenceDataService.getProbationOffices.mockResolvedValue([])
  })

  describe('referral is not in custody (pre-release) or does not have an allocated com', () => {
    it('does not update probation practitioner probation office', async () => {
      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-probation-office`)
        .send({
          'probation-office': 'new value',
        })
        .expect(302)

      expect(interventionsService.updateExpectedProbationOffice).toBeCalledTimes(1)
      expect(interventionsService.updateProbationPractitionerProbationOffice).toBeCalledTimes(0)
    })
  })

  describe('referral is in custody (pre-release) and has an allocated com', () => {
    it('also updates probation practitioner probation office', async () => {
      referral.referral.personCurrentLocationType = CurrentLocationType.custody
      referral.referral.isReferralReleasingIn12Weeks = null
      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-probation-office`)
        .send({
          'probation-office': 'new value',
        })
        .expect(302)

      expect(interventionsService.updateExpectedProbationOffice).toBeCalledTimes(1)
      expect(interventionsService.updateProbationPractitionerProbationOffice).toBeCalledTimes(1)
    })
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-probation-office`)
      .send({
        'probation-office': 'new value',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-expected-probation-office`)
        .send({
          'probation-office': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select a Probation Office')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/amend-pp-probation-office', () => {
  beforeEach(() => {
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails.build({ referralId: referral.id }))
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    referenceDataService.getProbationOffices.mockResolvedValue([])
  })

  describe('referral is not in custody (pre-release) or does not have an allocated com', () => {
    it('does not update expected probation office', async () => {
      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-pp-probation-office`)
        .send({
          'probation-office': 'new value',
        })
        .expect(302)

      expect(interventionsService.updateProbationPractitionerProbationOffice).toBeCalledTimes(1)
      expect(interventionsService.updateExpectedProbationOffice).toBeCalledTimes(0)
    })
  })

  describe('referral is in custody (pre-release) and has an allocated com', () => {
    it('also updates expected probation office', async () => {
      referral.referral.personCurrentLocationType = CurrentLocationType.custody
      referral.referral.isReferralReleasingIn12Weeks = null
      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-pp-probation-office`)
        .send({
          'probation-office': 'new value',
        })
        .expect(302)

      expect(interventionsService.updateProbationPractitionerProbationOffice).toBeCalledTimes(1)
      expect(interventionsService.updateExpectedProbationOffice).toBeCalledTimes(1)
    })
  })

  it('redirects to the referral details page on success', () => {
    return request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/amend-pp-probation-office`)
      .send({
        'probation-office': 'new value',
      })
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/${referral.id}/details?detailsUpdated=true`)
  })

  describe('with form validation errors', () => {
    it('renders an error message', () => {
      return request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/amend-pp-probation-office`)
        .send({
          'probation-office': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select a Probation Office')
        })
    })
  })
})
