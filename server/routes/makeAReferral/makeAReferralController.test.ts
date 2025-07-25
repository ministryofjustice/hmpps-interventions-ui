import request from 'supertest'
import { Express } from 'express'
import createError from 'http-errors'
import moment from 'moment-timezone'
import InterventionsService from '../../services/interventionsService'
import ServiceUser from '../../models/serviceUser'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import prisonFactory from '../../../testutils/factories/prison'
import deliusResponsibleOfficerFactory from '../../../testutils/factories/deliusResponsibleOfficer'
import deliusOfficeLocationFactory from '../../../testutils/factories/deliusOfficeLocation'
import deliusProbationDeliveryUnitFactory from '../../../testutils/factories/deliusProbationDeliveryUnit'
import apiConfig from '../../config'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import caseConvictionFactory from '../../../testutils/factories/caseConviction'
import caseConvictionsFactory from '../../../testutils/factories/caseConvictions'
import interventionFactory from '../../../testutils/factories/intervention'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import draftOasysRiskInformation from '../../../testutils/factories/draftOasysRiskInformation'
import referralDetailsFactory from '../../../testutils/factories/referralDetails'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonApiService from '../../services/prisonApiService'
import ReferenceDataService from '../../services/referenceDataService'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import { CurrentLocationType } from '../../models/draftReferral'
import secureChildAgency from '../../../testutils/factories/secureChildAgency'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import prisoner from '../../../testutils/factories/prisoner'
import AuditService from '../../services/auditService'
import HmppsAuditClient from '../../data/hmppsAuditClient'

jest.mock('../../services/interventionsService')
jest.mock('../../services/ramDeliusApiService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/referenceDataService')
jest.mock('../../services/prisonApiService')
jest.mock('../../services/auditService')

const auditClientConfig = {
  queueUrl: 'http://localhost:4566/000000000000/mainQueue',
  region: 'eu-west-2',
  serviceName: 'hmpps-service',
  enabled: true,
}

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>
const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>
const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>
const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>
const referenceDataService = new ReferenceDataService() as jest.Mocked<ReferenceDataService>
const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
)
const hmppsAuditClient = new HmppsAuditClient(auditClientConfig) as jest.Mocked<HmppsAuditClient>
const auditService = new AuditService(hmppsAuditClient) as jest.Mocked<AuditService>

const serviceUser = {
  crn: 'X123456',
  title: 'Mr',
  firstName: 'Alex',
  lastName: 'River',
  dateOfBirth: '1980-01-01',
  gender: 'Male',
  preferredLanguage: 'English',
  ethnicity: 'British',
  religionOrBelief: 'Agnostic',
  disabilities: ['Autism'],
} as ServiceUser

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      ramDeliusApiService,
      assessRisksAndNeedsService,
      prisonRegisterService,
      prisonApiService,
      referenceDataService,
      prisonAndSecuredChildAgencyService,
      auditService,
    },
    userType: AppSetupUserType.probationPractitioner,
  })

  const referral = draftReferralFactory.justCreated().build({ id: '1' })
  interventionsService.createDraftReferral.mockResolvedValue(referral)
  interventionsService.getDraftReferralsForUserToken.mockResolvedValue([])
  interventionsService.serializeDeliusServiceUser.mockReturnValue(serviceUser)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /intervention/:id/refer', () => {
  beforeEach(() => {
    interventionsService.getDraftReferralsForUserToken.mockResolvedValue([])
  })

  it('renders the page to start a referral', () => {
    return request(app)
      .get('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain("Enter the person's case identifier")
      })
  })
})

describe('POST /intervention/:id/refer', () => {
  describe('when searching for a CRN found in Delius and an intervention has been selected', () => {
    beforeEach(() => {
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
      ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(deliusResponsibleOfficerFactory.build())
    })

    it('creates a referral on the interventions service and redirects to the referral form', async () => {
      const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
      const serviceUserCRN = 'X123456'

      await request(app)
        .post(`/intervention/${interventionId}/refer`)
        .send({ 'service-user-crn': serviceUserCRN })
        .expect(301)
        .expect('Location', '/referrals/1/community-allocated-form')

      expect(auditService.logSearchServiceUser).toHaveBeenCalledWith({
        details: { identifier: 'X123456' },
        who: 'user1',
      })
      expect(interventionsService.createDraftReferral).toHaveBeenCalledWith('token', serviceUserCRN, interventionId)
    })

    it('updates the newly-created referral on the interventions service with the found service user', async () => {
      await request(app)
        .post('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
        .send({ 'service-user-crn': 'X123456' })

      expect(interventionsService.patchDraftReferral).toHaveBeenCalledWith('token', '1', {
        serviceUser,
      })
    })
  })

  describe('The user is taken to prison release form page when there is no allocated COM', () => {
    beforeEach(() => {
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
      ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(
        deliusResponsibleOfficerFactory.build({
          communityManager: {
            unallocated: true,
          },
        })
      )
    })

    it('creates a referral on the interventions service and redirects to the referral form', async () => {
      const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
      const serviceUserCRN = 'X123456'

      await request(app)
        .post(`/intervention/${interventionId}/refer`)
        .send({ 'service-user-crn': serviceUserCRN })
        .expect(301)
        .expect('Location', '/referrals/1/community-allocated-form')

      expect(auditService.logSearchServiceUser).toHaveBeenCalledWith({
        details: { identifier: 'X123456' },
        who: 'user1',
      })
      expect(interventionsService.createDraftReferral).toHaveBeenCalledWith('token', serviceUserCRN, interventionId)
    })

    it('updates the newly-created referral on the interventions service with the found service user', async () => {
      await request(app)
        .post('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
        .send({ 'service-user-crn': 'X123456' })

      expect(interventionsService.patchDraftReferral).toHaveBeenCalledWith('token', '1', {
        serviceUser,
      })
    })
  })

  describe('when a non standard CRN is entered', () => {
    beforeEach(() => {
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
      ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(deliusResponsibleOfficerFactory.build())
    })
    describe('having leading and trailing whitespace', () => {
      it('trims any leading and trailing whitespace', async () => {
        const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
        const serviceUserCRN = ' X123456 '
        const serviceUserCRNTrimmed = 'X123456'

        await request(app)
          .post(`/intervention/${interventionId}/refer`)
          .send({ 'service-user-crn': serviceUserCRN })
          .expect(301)
          .expect('Location', '/referrals/1/community-allocated-form')

        expect(ramDeliusApiService.getCaseDetailsByCrn).toHaveBeenCalledWith(serviceUserCRNTrimmed)
        expect(interventionsService.createDraftReferral).toHaveBeenCalledWith(
          'token',
          serviceUserCRNTrimmed,
          interventionId
        )
      })
    })
    describe('having lowercase characters', () => {
      it('transforms lowercase characters to uppercase', async () => {
        const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
        const serviceUserCRN = 'x123456'
        const serviceUserCRNTransformed = 'X123456'

        await request(app)
          .post(`/intervention/${interventionId}/refer`)
          .send({ 'service-user-crn': serviceUserCRN })
          .expect(301)
          .expect('Location', '/referrals/1/community-allocated-form')

        expect(ramDeliusApiService.getCaseDetailsByCrn).toHaveBeenCalledWith(serviceUserCRNTransformed)
        expect(interventionsService.createDraftReferral).toHaveBeenCalledWith(
          'token',
          serviceUserCRNTransformed,
          interventionId
        )
      })
    })
  })
  describe('when the interventions service returns an error', () => {
    beforeEach(() => {
      interventionsService.createDraftReferral.mockRejectedValue(new Error('Failed to create intervention'))
    })

    it('displays an error page', async () => {
      await request(app)
        .post('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
        .send({ 'service-user-crn': 'X123456' })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Failed to create intervention')
        })

      expect(interventionsService.createDraftReferral).toHaveBeenCalledTimes(1)
    })
  })

  describe('when a crn is not entered', () => {
    it('renders a validation error', async () => {
      await request(app)
        .post('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
        .type('form')
        .send({ 'service-user-crn': '' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('CRN is needed')
        })

      expect(ramDeliusApiService.getCaseDetailsByCrn).toHaveBeenCalledTimes(0)
    })
  })

  describe('when there is an issue with the crn', () => {
    beforeEach(() => {
      ramDeliusApiService.getCaseDetailsByCrn.mockRejectedValue({ status: 404 })
    })

    it('renders a validation error', async () => {
      await request(app)
        .post('/intervention/98a42c61-c30f-4beb-8062-04033c376e2d/refer')
        .type('form')
        .send({ 'service-user-crn': 'X123456' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('CRN not found in nDelius')
        })

      expect(ramDeliusApiService.getCaseDetailsByCrn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('GET /referrals/:id/referral-type-form', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build()
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to select the referral type', () => {
    return request(app)
      .get('/referrals/1/referral-type-form')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What type of referral is this?')
      })
  })
})

describe('POST /referrals/:id/referral-type-form', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build()
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the form page when the user selects the custody', () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      personCurrentLocationType: CurrentLocationType.custody,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)
    return request(app)
      .post('/referrals/1/referral-type-form')
      .type('form')
      .send({
        'current-location': CurrentLocationType.custody,
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')
  })
  it('renders the form page when the user selects the custody', () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      personCurrentLocationType: CurrentLocationType.community,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)
    return request(app)
      .post('/referrals/1/referral-type-form')
      .type('form')
      .send({
        'current-location': CurrentLocationType.community,
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')
  })
  it('returns the 400 when there is a API error', () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to update current location'))
    return request(app)
      .post('/referrals/1/referral-type-form')
      .type('form')
      .send({
        'current-location': CurrentLocationType.community,
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to update current location')
      })
  })
})

describe('GET /referrals/:id/prison-release-form', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: {
        firstName: 'Alex',
        lastName: 'River',
      },
    })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the page to select whether the referrer knows the prison release date', () => {
    return request(app)
      .get('/referrals/1/prison-release-form')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Will Alex River be released during the intervention?')
      })
  })
})

describe('POST /referrals/:id/prison-release-form', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build()
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
  })

  it('renders the form page when the user knows when the referral is releasing from prison', () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      isReferralReleasingIn12Weeks: true,
      personCurrentLocationType: CurrentLocationType.custody,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)
    return request(app)
      .post('/referrals/1/prison-release-form')
      .type('form')
      .send({
        'prison-release': 'yes',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')
  })
  it('renders the form page when the user does not know when the referral is releasing from prison', () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      isReferralReleasingIn12Weeks: false,
      personCurrentLocationType: CurrentLocationType.custody,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)
    return request(app)
      .post('/referrals/1/prison-release-form')
      .type('form')
      .send({
        'prison-release': 'no',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')
  })
  it('returns the 500 when there is a API error', () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to update prison release information'))
    return request(app)
      .post('/referrals/1/referral-type-form')
      .type('form')
      .send({
        'current-location': CurrentLocationType.community,
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to update prison release information')
      })
  })
})

describe('GET /referrals/:id/form', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const intervention = interventionFactory.build({
      serviceCategories: [serviceCategory],
    })
    const referral = draftReferralFactory
      .serviceCategorySelected(serviceCategory.id)
      .build({ id: '1', interventionId: intervention.id })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('fetches the referral from the interventions service displays its service category in the form', async () => {
    await request(app)
      .get('/referrals/1/form')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add Accommodation referral details')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  describe('when the interventions service returns an error', () => {
    beforeEach(() => {
      interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get intervention'))
    })

    it('displays an error page', async () => {
      await request(app)
        .get('/referrals/1/form')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Failed to get intervention')
        })
    })
  })

  describe('if a service category has not been selected for a single referral', () => {
    beforeEach(() => {
      const referral = draftReferralFactory.build({ id: '1' })
      interventionsService.getDraftReferral.mockResolvedValue(referral)
    })

    it('displays an error page', async () => {
      await request(app)
        .get('/referrals/1/form')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('No service category selected')
        })
    })
  })
})

describe('GET /referrals/:id/service-user-details', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceUserSelected().build({ id: '1' })
    const prisonList = prisonFactory.build()
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(expandedDeliusServiceUserFactory.build())
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
  })

  it('renders a service user details page', async () => {
    await request(app)
      .get('/referrals/1/service-user-details')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Review Alex River&#39;s information`)
      })
  })
})

describe('POST /referrals/:id/confirm-service-user-details', () => {
  it('redirects to the next question', async () => {
    await request(app)
      .post('/referrals/1/service-user-details')
      .type('form')
      .expect(302)
      .expect('Location', '/referrals/1/risk-information')
  })
})

describe('GET /referrals/:id/risk-information', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders an error when the get risk summary call fails', async () => {
    assessRisksAndNeedsService.getRiskSummary.mockRejectedValue(new Error('failed to get risk summary'))
    await request(app)
      .get('/referrals/1/risk-information')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('failed to get risk summary')
      })
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/risk-information')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })

  describe('when risk information exists in OASys', () => {
    beforeEach(() => {
      const riskSummary = riskSummaryFactory.build()
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    })

    it('renders an OASys risk information page', async () => {
      await request(app)
        .get('/referrals/1/risk-information')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('OASys risk information')
          expect(res.text).toContain('physically aggressive')
        })
    })
  })

  describe('when risk information exists in OASys and has been edited', () => {
    beforeEach(() => {
      const riskSummary = riskSummaryFactory.build()
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
      interventionsService.getDraftOasysRiskInformation.mockResolvedValue({
        riskSummaryWhoIsAtRisk: 'Risk to staff.',
        riskSummaryNatureOfRisk: 'Physically aggressive',
        riskSummaryRiskImminence: 'Can happen at the drop of a hat',
        riskToSelfSuicide: 'Manic episodes are frequent',
        riskToSelfSelfHarm: null,
        riskToSelfHostelSetting: null,
        riskToSelfVulnerability: null,
        additionalInformation: 'No more comments.',
      })
    })

    it('renders an OASys risk information page with edited risk information', async () => {
      await request(app)
        .get('/referrals/1/risk-information')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('OASys risk information')
          expect(res.text).toContain('Physically aggressive')
          expect(res.text).toContain('Can happen at the drop of a hat')
          expect(res.text).toContain('Risk to staff.')
          expect(res.text).toContain('Manic episodes are frequent')
        })
    })
  })
})

describe('POST /referrals/:id/risk-information', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    const riskSummary = riskSummaryFactory.build()

    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the referral on the backend and redirects to the next question', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      additionalRiskInformation: 'High risk to the elderly',
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/risk-information')
      .type('form')
      .send({
        'additional-risk-information': 'High risk to the elderly',
      })
      .expect(302)
      .expect('Location', '/referrals/1/needs-and-requirements')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        additionalRiskInformation: 'High risk to the elderly',
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/risk-information')
        .type('form')
        .send({
          'additional-risk-information': 'a'.repeat(4001),
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Risk information must be 4000 characters or fewer')
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/risk-information')
      .type('form')
      .send({
        'additional-risk-information': 'High risk to the elderly',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/edit-oasys-risk-information', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  describe('when risk information exists in OASys', () => {
    beforeEach(() => {
      const riskSummary = riskSummaryFactory.build()
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    })

    it('renders an edit OASys risk information page', async () => {
      await request(app)
        .get('/referrals/1/edit-oasys-risk-information')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('OASys risk information')
          expect(res.text).toContain('physically aggressive')
        })
    })
  })
})

describe('POST /referrals/:id/edit-oasys-risk-information', () => {
  it('updates the draft oasys risk information on the backend and redirects to the next question', async () => {
    interventionsService.updateDraftOasysRiskInformation.mockResolvedValue(draftOasysRiskInformation.build())

    await request(app)
      .post('/referrals/1/edit-oasys-risk-information')
      .type('form')
      .send({
        'who-is-at-risk': 'Risk to staff.',
        'nature-of-risk': 'Physically aggressive',
        'risk-imminence': 'Can happen at the drop of a hat',
        'risk-to-self-suicide': 'Manic episodes are common',
        'risk-to-self-self-harm': 'No self harm',
        'risk-to-self-hostel-setting': 'No hostel',
        'risk-to-self-vulnerability': 'Not vulnerable',
        'additional-information': 'No more comments.',
        'confirm-understood': 'understood',
      })
      .expect(302)
      .expect('Location', '/referrals/1/needs-and-requirements')

    expect(interventionsService.updateDraftOasysRiskInformation.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        riskSummaryWhoIsAtRisk: 'Risk to staff.',
        riskSummaryNatureOfRisk: 'Physically aggressive',
        riskSummaryRiskImminence: 'Can happen at the drop of a hat',
        riskToSelfSuicide: 'Manic episodes are common',
        riskToSelfSelfHarm: 'No self harm',
        riskToSelfHostelSetting: 'No hostel',
        riskToSelfVulnerability: 'Not vulnerable',
        additionalInformation: 'No more comments.',
      },
    ])
  })
})

describe('POST /referrals/:id/confirm-edit-oasys-risk-information', () => {
  describe('when the user selects that they want to edit risk information', () => {
    it('they are directed to edit the risk information', async () => {
      await request(app)
        .post('/referrals/1/confirm-edit-oasys-risk-information')
        .type('form')
        .send({
          'edit-risk-confirmation': 'yes',
        })
        .expect(302)
        .expect('Location', '/referrals/1/edit-oasys-risk-information')
    })
  })
  describe("when the user selects that they don't want to edit risk information", () => {
    it('updates the draft oasys risk information on the backend and redirects to the next question', async () => {
      interventionsService.getDraftReferral.mockResolvedValue(draftReferralFactory.build())
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummaryFactory.build())
      interventionsService.updateDraftOasysRiskInformation.mockResolvedValue(draftOasysRiskInformation.build())
      await request(app)
        .post('/referrals/1/confirm-edit-oasys-risk-information')
        .type('form')
        .send({
          'edit-risk-confirmation': 'no',
          'confirm-understood': 'understood',
        })
        .expect(302)
        .expect('Location', '/referrals/1/needs-and-requirements')
      expect(interventionsService.updateDraftOasysRiskInformation.mock.calls[0]).toEqual([
        'token',
        '1',
        {
          riskSummaryWhoIsAtRisk: null,
          riskSummaryNatureOfRisk: 'physically aggressive',
          riskSummaryRiskImminence: 'can happen at the drop of a hat',
          riskToSelfSuicide: 'Manic episodes are common.',
          riskToSelfSelfHarm: null,
          riskToSelfHostelSetting: null,
          riskToSelfVulnerability: null,
          additionalInformation: null,
        },
      ])
    })
  })

  describe("when the user selects that they don't want to edit risk information after having already edited the risk information", () => {
    it('updates the draft oasys risk information on the backend with the edited risk information and redirects to the next question', async () => {
      interventionsService.getDraftReferral.mockResolvedValue(draftReferralFactory.build())
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummaryFactory.build())
      interventionsService.getDraftOasysRiskInformation.mockResolvedValue({
        riskSummaryWhoIsAtRisk: 'Risk to staff',
        riskSummaryNatureOfRisk: 'Violent',
        riskSummaryRiskImminence: 'Can happen at the drop of a hat',
        riskToSelfSuicide: 'Manic episodes are frequent',
        riskToSelfSelfHarm: null,
        riskToSelfHostelSetting: null,
        riskToSelfVulnerability: null,
        additionalInformation: 'No more comments.',
      })
      interventionsService.updateDraftOasysRiskInformation.mockResolvedValue(draftOasysRiskInformation.build())
      await request(app)
        .post('/referrals/1/confirm-edit-oasys-risk-information')
        .type('form')
        .send({
          'edit-risk-confirmation': 'no',
          'confirm-understood': 'understood',
        })
        .expect(302)
        .expect('Location', '/referrals/1/needs-and-requirements')
      expect(interventionsService.updateDraftOasysRiskInformation.mock.calls[0]).toEqual([
        'token',
        '1',
        {
          riskSummaryWhoIsAtRisk: 'Risk to staff',
          riskSummaryNatureOfRisk: 'Violent',
          riskSummaryRiskImminence: 'Can happen at the drop of a hat',
          riskToSelfSuicide: 'Manic episodes are frequent',
          riskToSelfSelfHarm: null,
          riskToSelfHostelSetting: null,
          riskToSelfVulnerability: null,
          additionalInformation: null,
        },
      ])
    })
  })
})

describe('GET /referrals/:id/needs-and-requirements', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/needs-and-requirements')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Geoffrey’s needs and requirements')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/needs-and-requirements')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/needs-and-requirements', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the referral on the backend and redirects to the form', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      additionalNeedsInformation: 'Alex is currently sleeping on his aunt’s sofa',
      accessibilityNeeds: 'He uses a wheelchair',
      needsInterpreter: true,
      interpreterLanguage: 'Spanish',
      hasAdditionalResponsibilities: true,
      whenUnavailable: 'He works on Fridays 7am - midday',
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/needs-and-requirements')
      .type('form')
      .send({
        'additional-needs-information': 'Alex is currently sleeping on his aunt’s sofa',
        'accessibility-needs': 'He uses a wheelchair',
        'needs-interpreter': 'yes',
        'interpreter-language': 'Spanish',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': 'He works on Fridays 7am - midday',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        additionalNeedsInformation: 'Alex is currently sleeping on his aunt’s sofa',
        accessibilityNeeds: 'He uses a wheelchair',
        needsInterpreter: true,
        interpreterLanguage: 'Spanish',
        hasAdditionalResponsibilities: true,
        whenUnavailable: 'He works on Fridays 7am - midday',
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/needs-and-requirements')
        .type('form')
        .send({
          'needs-interpreter': 'yes',
          'interpreter-language': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter the language for which Geoffrey needs an interpreter')
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/needs-and-requirements')
      .type('form')
      .send({
        'additional-needs-information': 'Alex is currently sleeping on his aunt’s sofa',
        'accessibility-needs': 'He uses a wheelchair',
        'needs-interpreter': 'yes',
        'interpreter-language': 'Spanish',
        'has-additional-responsibilities': 'yes',
        'when-unavailable': 'He works on Fridays 7am - midday',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/expected-release-date', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  describe('when prisoner search does not return a release date', () => {
    beforeEach(() => {
      interventionsService.getPrisonerDetails.mockResolvedValue({
        prisonId: '',
        prisonerNumber: null,
        releaseDate: null,
        confirmedReleaseDate: null,
        nonDtoReleaseDate: null,
        automaticReleaseDate: null,
        postRecallReleaseDate: null,
        conditionalReleaseDate: null,
        actualParoleDate: null,
        dischargeDate: null,
      })
    })
    it('renders the expected release date form page ', async () => {
      await request(app)
        .get('/referrals/1/expected-release-date')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(`Do you know Geoffrey&#39;s expected release date?`)
        })

      expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
    })
  })

  describe('when prisoner search returns a release date', () => {
    beforeEach(() => {
      interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
    })
    it('renders the select expected release date form page', async () => {
      await request(app)
        .get('/referrals/1/expected-release-date')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(`Confirm Geoffrey Blue&#39;s expected release date`)
          expect(res.text).toContain('Choose a different date')
        })

      expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
    })
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/expected-release-date')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/expected-release-date/submit', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the expected release date on the backend and redirects to the expected probation office form for referrals without COM', async () => {
    const tomorrow = moment().add(1, 'days')
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
      hasExpectedReleaseDate: true,
    })

    interventionsService.getDraftReferral.mockResolvedValue(updatedReferral)
    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/expected-release-date/submit')
      .type('form')
      .send({
        'expected-release-date': 'yes',
        'release-date-day': tomorrow.format('DD'),
        'release-date-month': tomorrow.format('MM'),
        'release-date-year': tomorrow.format('YYYY'),
      })
      .expect(302)
      .expect('Location', '/referrals/1/expected-probation-office')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
        hasExpectedReleaseDate: true,
        expectedReleaseDateMissingReason: null,
      },
    ])
  })

  it('updates the expected release date on the backend and redirects to the draft form for referrals with COM', async () => {
    const tomorrow = moment().add(1, 'days')
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
      hasExpectedReleaseDate: true,
      personCurrentLocationType: CurrentLocationType.custody,
    })

    interventionsService.getDraftReferral.mockResolvedValue(updatedReferral)
    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/expected-release-date/submit')
      .type('form')
      .send({
        'expected-release-date': 'yes',
        'release-date-day': tomorrow.format('DD'),
        'release-date-month': tomorrow.format('MM'),
        'release-date-year': tomorrow.format('YYYY'),
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
        hasExpectedReleaseDate: true,
        expectedReleaseDateMissingReason: null,
      },
    ])
  })

  it('updates the expected release date not known reason on the backend and redirects to the draft form', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDateMissingReason: 'yet to receive the information from prison',
      hasExpectedReleaseDate: false,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/expected-release-date/submit')
      .type('form')
      .send({
        'expected-release-date': 'no',
        'release-date-unknown-reason': 'yet to receive the information from prison',
      })
      .expect(302)
      .expect('Location', '/referrals/1/expected-probation-office')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDate: null,
        hasExpectedReleaseDate: false,
        expectedReleaseDateMissingReason: 'yet to receive the information from prison',
      },
    ])
  })
  it('returns a 500 if the API call fails with a non-validation error', async () => {
    const tomorrow = moment().add(1, 'days')
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/expected-release-date/submit')
      .type('form')
      .send({
        'expected-release-date': 'yes',
        'release-date-day': tomorrow.format('DD'),
        'release-date-month': tomorrow.format('MM'),
        'release-date-year': tomorrow.format('YYYY'),
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('POST /referrals/:id/select-expected-release-date/submit', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
  })

  it('updates the backend with the release date from prisoner search prisoner details when confirm is selected and redirects to the draft form', async () => {
    const tomorrow = moment().add(1, 'days')
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
      hasExpectedReleaseDate: true,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/select-expected-release-date/submit')
      .type('form')
      .send({
        'expected-release-date': 'confirm',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDate: '2023-05-02',
        hasExpectedReleaseDate: true,
      },
    ])
  })
})

describe('GET /referrals/:id/change-expected-release-date', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/change-expected-release-date')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Enter Geoffrey Blue&#39;s expected release date`)
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/change-expected-release-date')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/change-expected-release-date', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the expected release date on the backend and redirects to the draft form', async () => {
    const tomorrow = moment().add(1, 'days')
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
      hasExpectedReleaseDate: true,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/change-expected-release-date')
      .type('form')
      .send({
        'release-date-day': tomorrow.format('DD'),
        'release-date-month': tomorrow.format('MM'),
        'release-date-year': tomorrow.format('YYYY'),
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDate: tomorrow.format('YYYY-MM-DD'),
        hasExpectedReleaseDate: true,
        expectedReleaseDateMissingReason: null,
      },
    ])
  })

  it('returns a 500 if the API call fails with a non-validation error', async () => {
    const tomorrow = moment().add(1, 'days')
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/change-expected-release-date')
      .type('form')
      .send({
        'release-date-day': tomorrow.format('DD'),
        'release-date-month': tomorrow.format('MM'),
        'release-date-year': tomorrow.format('YYYY'),
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/expected-release-date-unknown', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/expected-release-date-unknown')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Enter why the expected release date is not known`)
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/expected-release-date-unknown')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/expected-release-date-unknown', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the expected release date not known reason on the backend and redirects to the draft form', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      expectedReleaseDateMissingReason: 'yet to receive the information from prison',
      hasExpectedReleaseDate: false,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/expected-release-date-unknown')
      .type('form')
      .send({
        'release-date-unknown-reason': 'yet to receive the information from prison',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        expectedReleaseDateMissingReason: 'yet to receive the information from prison',
      },
    ])
  })

  it('returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/expected-release-date-unknown')
      .type('form')
      .send({
        'release-date-unknown-reason': 'yet to receive the information from prison',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/submit-current-location', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/submit-current-location')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm Geoffrey Blue’s current location')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/submit-current-location')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/submit-current-location', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
  })

  it('updates the referral on the backend and redirects to the expected release date page', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      personCustodyPrisonId: 'abc',
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/submit-current-location')
      .type('form')
      .send({
        'prison-select': 'abc',
        'already-know-prison-name': 'no',
      })
      .expect(302)
      .expect('Location', '/referrals/1/expected-release-date')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        personCustodyPrisonId: 'abc',
        alreadyKnowPrisonName: false,
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/submit-current-location')
        .type('form')
        .send({
          'prison-select': '',
          'already-know-prison-name': 'no',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain(`Select a prison establishment from the list`)
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/submit-current-location')
      .type('form')
      .send({
        'prison-select': 'abc',
        'already-know-prison-name': 'no',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/confirm-probation-practitioner-details', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.patchDraftReferral.mockResolvedValue(referral)

    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)

    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    const officeList = deliusOfficeLocationFactory.officeList()
    referenceDataService.getProbationOffices.mockResolvedValue(officeList)

    const pduList = deliusProbationDeliveryUnitFactory.pduList()
    referenceDataService.getProbationDeliveryUnits.mockResolvedValue(pduList)

    const responsibleOfficer = deliusResponsibleOfficerFactory.build()
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/confirm-probation-practitioner-details')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm probation practitioner details')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/confirm-probation-practitioner-details')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/confirm-probation-practitioner-details', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)

    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    const officeList = deliusOfficeLocationFactory.officeList()
    referenceDataService.getProbationOffices.mockResolvedValue(officeList)

    const pduList = deliusProbationDeliveryUnitFactory.pduList()
    referenceDataService.getProbationDeliveryUnits.mockResolvedValue(pduList)

    const responsibleOfficer = deliusResponsibleOfficerFactory.build()
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
  })

  it('updates the referral on the backend and redirects to the form page', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      ndeliusPPName: 'John Alice',
      ndeliusPPEmailAddress: 'john@example.com',
      ndeliusPDU: 'Sheffield',
      ndeliusPhoneNumber: '98454243243',
      ndeliusTeamPhoneNumber: '044-2545453442',
      ppProbationOffice: 'London',
    })

    interventionsService.getDraftReferral.mockResolvedValue(updatedReferral)
    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/confirm-probation-practitioner-details')
      .type('form')
      .send({
        'confirm-details': 'no',
        'probation-practitioner-name': 'John',
        'probation-practitioner-email': 'john@example.com',
        'probation-practitioner-office': undefined,
        'probation-practitioner-pdu': 'East Sussex',
      })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        ndeliusPPName: 'John Alice',
        ndeliusPPEmailAddress: 'john@example.com',
        ndeliusPDU: 'Sheffield',
        ndeliusPhoneNumber: '98454243243',
        ndeliusTeamPhoneNumber: '044-2545453442',
        ppProbationOffice: 'London',
      },
    ])
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      ndeliusPPName: 'John Alice',
      ndeliusPPEmailAddress: 'john@example.com',
      ndeliusPDU: 'Sheffield',
      ndeliusPhoneNumber: '98454243243',
      ndeliusTeamPhoneNumber: '044-2545453442',
      ppProbationOffice: 'London',
    })
    interventionsService.getDraftReferral.mockResolvedValue(updatedReferral)
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/confirm-probation-practitioner-details')
      .type('form')
      .send()
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/confirm-main-point-of-contact', () => {
  beforeEach(() => {
    const referral = draftReferralFactory
      .serviceUserSelected()
      .build({ serviceUser: { firstName: 'Geoffrey', lastName: 'Blue' } })
    interventionsService.getDraftReferral.mockResolvedValue(referral)

    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)

    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    const officeList = deliusOfficeLocationFactory.officeList()
    referenceDataService.getProbationOffices.mockResolvedValue(officeList)

    const pduList = deliusProbationDeliveryUnitFactory.pduList()
    referenceDataService.getProbationDeliveryUnits.mockResolvedValue(pduList)

    const responsibleOfficer = deliusResponsibleOfficerFactory.build()
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/confirm-main-point-of-contact')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm main point of contact details')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/confirm-probation-practitioner-details')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/confirm-main-point-of-contact', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)

    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    const officeList = deliusOfficeLocationFactory.officeList()
    referenceDataService.getProbationOffices.mockResolvedValue(officeList)

    const pduList = deliusProbationDeliveryUnitFactory.pduList()
    referenceDataService.getProbationDeliveryUnits.mockResolvedValue(pduList)

    const responsibleOfficer = deliusResponsibleOfficerFactory.build()
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
  })

  it('updates the referral on the backend and redirects to the form page', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      serviceUser: { firstName: 'Geoffrey' },
      ppName: 'Bob',
      ppEmailAddress: 'a.b@xyz.com',
      roleOrJobTitle: 'Probation Practitioner',
      ppProbationOffice: 'London',
      isReferralReleasingIn12Weeks: true,
    })

    interventionsService.getDraftReferral.mockResolvedValue(updatedReferral)
    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/confirm-main-point-of-contact')
      .type('form')
      .send({
        location: 'probation office',
        'probation-practitioner-name': 'John',
        'probation-practitioner-roleOrJobTitle': 'Probation Practitioner',
        'probation-practitioner-email': 'a.b@xyz.com',
        'probation-practitioner-office': 'London',
        'probation-practitioner-pdu': '',
      })
      .expect(302)
      .expect('Location', '/referrals/1/reason-for-referral-before-allocation')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        ppName: 'John',
        ppEmailAddress: 'a.b@xyz.com',
        ppProbationOffice: 'London',
        ppEstablishment: '',
        ppLocationType: 'probation office',
        roleOrJobTitle: 'Probation Practitioner',
        hasMainPointOfContactDetails: true,
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/confirm-main-point-of-contact')
        .type('form')
        .send({
          location: 'probation office',
          'probation-practitioner-name': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain(`Add main point of contact name - this is a mandatory field`)
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })
    await request(app)
      .post('/referrals/1/confirm-main-point-of-contact')
      .type('form')
      .send({
        location: 'probation office',
        'probation-practitioner-name': 'John',
        'probation-practitioner-roleOrJobTitle': 'Probation Practitioner',
        'probation-practitioner-email': 'a.b@xyz.com',
        'probation-practitioner-office': 'London',
        'probation-practitioner-pdu': '',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/completion-deadline', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('renders a form page', async () => {
    interventionsService.getSentReferral.mockRejectedValue({
      status: 404,
    })

    await request(app)
      .get('/referrals/1/completion-deadline')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What date does the Women&#39;s service intervention need to be completed by?')
      })
  })

  it('renders a form page for amend completion-deadline', async () => {
    interventionsService.getDraftReferral.mockRejectedValue({
      status: 404,
      message: 'Some backend error message',
    })
    interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

    await request(app)
      .get('/referrals/1/completion-deadline')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What date does the Women&#39;s service intervention need to be completed by?')
      })
      .expect(res => {
        expect(res.text).toContain('What is the reason for changing the completion date?')
      })
  })
  // TODO how do we (or indeed, do we) test what happens when the request has a completion deadline - i.e. that the
  // day/month/year fields are correctly populated? Do we just do it as a presenter test?
})

describe('POST /referrals/:id/completion-deadline', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  describe('when the user inputs a valid date', () => {
    it('updates the referral on the backend and redirects to the next question if the API call succeeds', async () => {
      const referralDetails = referralDetailsFactory.build({ completionDeadline: '2021-09-15' })
      interventionsService.getSentReferral.mockRejectedValue({
        status: 404,
        message: 'Some backend error message',
      })
      interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails)

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(302)
        .expect('Location', '/referrals/1/reason-for-referral')
    })

    it('successfully calls the backend and redirects if the sent referral is being amended ', async () => {
      const referral = sentReferralFactory.build()
      const referralDetails = referralDetailsFactory.build()

      interventionsService.getDraftReferral.mockRejectedValue({
        status: 404,
        message: 'draft referral not found',
      })

      interventionsService.getSentReferral.mockResolvedValue(referral)

      interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails)

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({
          'completion-deadline-day': '15',
          'completion-deadline-month': '9',
          'completion-deadline-year': '2021',
          'reason-for-change': 'reason',
        })
        .expect(302)
        .expect('Location', '/probation-practitioner/referrals/1/details?detailsUpdated=true')

      expect(interventionsService.updateSentReferralDetails.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15', reasonForChange: 'reason' },
      ])
    })

    it('updates the referral on the backend and returns a 400, rendering the question page with an error message, if the API call fails with a validation error', async () => {
      const sentReferral = sentReferralFactory.build({})
      interventionsService.sendDraftReferral.mockResolvedValue(sentReferral)
      interventionsService.getSentReferral.mockRejectedValue({
        status: 404,
        message: 'Some backend error message',
      })
      interventionsService.patchDraftReferral.mockRejectedValue(
        createError(400, 'bad request', {
          message: 'The date by which the service needs to be completed must be in the future',
          response: {
            body: {
              validationErrors: [{ field: 'completionDeadline', error: 'DATE_MUST_BE_IN_THE_FUTURE' }],
            },
          },
        })
      )
      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The date by which the service needs to be completed must be in the future')
          expect(res.text).toContain('What date does the Women&#39;s service intervention need to be completed by?')
        })
    })

    it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
      interventionsService.getSentReferral.mockRejectedValue({
        message: 'Some backend error message',
      })
      const referralDetails = referralDetailsFactory.build({ completionDeadline: '2021-09-15' })
      interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails)

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Some backend error message')
        })
    })
  })

  describe('when the user inputs an invalid date', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      const referralDetails = referralDetailsFactory.build({ completionDeadline: '2021-09-15' })
      const sentReferral = sentReferralFactory.build({})
      interventionsService.updateSentReferralDetails.mockResolvedValue(referralDetails)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({
          'completion-deadline-day': '15',
          'completion-deadline-month': '9',
          'completion-deadline-year': 'this year',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The date by which the service needs to be completed must be a real date')
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })
})

describe('GET /referrals/:referralId/service-category/:service-category-id/complexity-level', () => {
  beforeEach(() => {
    const socialInclusionServiceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })
    const accommodationServiceCategory = serviceCategoryFactory.build({
      id: 'd69b80d5-0005-4f08-b5d8-404999c9e843',
      name: 'accommodation',
    })

    const referral = draftReferralFactory
      .serviceCategoriesSelected([socialInclusionServiceCategory.id, accommodationServiceCategory.id])
      .build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategoryByIdAndContractReference.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What is the complexity level for the Social inclusion service?')
      })

    expect(interventionsService.getServiceCategoryByIdAndContractReference).toHaveBeenCalledWith(
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39',
      '160'
    )
  })

  it('renders an error when the request for a service category fails', async () => {
    interventionsService.getServiceCategoryByIdAndContractReference.mockRejectedValue(
      new Error('Failed to get service category')
    )

    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get service category')
      })
  })
})

describe('POST /referrals/:referralId/service-category/:service-category-id/complexity-level', () => {
  describe('for a single-service referral', () => {
    beforeEach(() => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({
        id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        name: 'social inclusion',
      })

      const referral = draftReferralFactory.serviceCategoriesSelected([socialInclusionServiceCategory.id]).build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
    })

    it('updates the referral on the backend and redirects to the completion deadline page', async () => {
      await request(app)
        .post('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
        .type('form')
        .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
        .expect(302)
        .expect('Location', '/referrals/1/enforceable-days')

      expect(interventionsService.setComplexityLevelForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
    })
  })

  describe('for a cohort referral', () => {
    beforeEach(() => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({
        id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        name: 'social inclusion',
      })
      const accommodationServiceCategory = serviceCategoryFactory.build({
        id: 'd69b80d5-0005-4f08-b5d8-404999c9e843',
        name: 'accommodation',
      })

      const referral = draftReferralFactory
        .serviceCategoriesSelected([socialInclusionServiceCategory.id, accommodationServiceCategory.id])
        .build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
    })

    it("updates the referral on the backend and redirects to the next desired outcome if it's not the last service category", async () => {
      await request(app)
        .post('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
        .type('form')
        .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
        .expect(302)
        .expect('Location', '/referrals/1/service-category/d69b80d5-0005-4f08-b5d8-404999c9e843/desired-outcomes')

      expect(interventionsService.setComplexityLevelForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
    })
    it("updates the referral on the backend and redirects to the completion deadline page if it's the last service category", async () => {
      await request(app)
        .post('/referrals/1/service-category/d69b80d5-0005-4f08-b5d8-404999c9e843/complexity-level')
        .type('form')
        .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
        .expect(302)
        .expect('Location', '/referrals/1/enforceable-days')

      expect(interventionsService.setComplexityLevelForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'd69b80d5-0005-4f08-b5d8-404999c9e843',
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
    })
  })

  describe('when the API call fails with a non-validation error', () => {
    beforeEach(() => {
      const socialInclusionServiceCategory = serviceCategoryFactory.build({
        id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        name: 'social inclusion',
      })

      const referral = draftReferralFactory.serviceCategoriesSelected([socialInclusionServiceCategory.id]).build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
    })

    it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
      interventionsService.setComplexityLevelForServiceCategory.mockRejectedValue({
        message: 'Some backend error message',
      })

      await request(app)
        .post('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
        .type('form')
        .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Some backend error message')
        })

      expect(interventionsService.setComplexityLevelForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
      })
    })
  })
})

describe('GET /referrals/:id/further-information', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/further-information')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Do you have further information for the Women&#39;s service referral service provider? (optional)'
        )
      })
  })
})

describe('POST /referrals/:id/further-information', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('updates the referral on the backend and redirects to the referral form', async () => {
    await request(app)
      .post('/referrals/1/further-information')
      .type('form')
      .send({ 'further-information': 'Further information about the service user' })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { furtherInformation: 'Further information about the service user' },
    ])
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/further-information')
      .type('form')
      .send({ 'further-information': 'Further information about the service user' })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { furtherInformation: 'Further information about the service user' },
    ])
  })
})

describe('GET /referrals/:id/relevant-sentence', () => {
  let serviceUserCRN: string

  beforeEach(() => {
    const intervention = interventionFactory.build()
    const referral = draftReferralFactory.justCreated().build({ interventionId: intervention.id })

    serviceUserCRN = referral.serviceUser.crn

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    ramDeliusApiService.getConvictionsByCrn.mockResolvedValue(caseConvictionsFactory.build())
  })

  it('renders a form page and fetches a conviction from the Community API', async () => {
    await request(app)
      .get('/referrals/1/relevant-sentence')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select the relevant sentence for the Accommodation referral')
      })

    expect(ramDeliusApiService.getConvictionsByCrn).toHaveBeenCalledWith(serviceUserCRN)
  })

  it('renders an error when the request for the intervention fails', async () => {
    interventionsService.getIntervention.mockRejectedValue(new Error('Failed to get intervention'))

    await request(app)
      .get('/referrals/1/relevant-sentence')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get intervention')
      })
  })

  it('renders an error when no convictions are found for that service user', async () => {
    ramDeliusApiService.getConvictionsByCrn.mockResolvedValue({
      caseDetail: deliusServiceUser.build(),
      convictions: [],
    })

    await request(app)
      .get('/referrals/1/relevant-sentence')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain(`No active convictions found for ${serviceUserCRN}`)
        expect(res.text).toContain(`No convictions were found in nDelius for ${serviceUserCRN}`)
      })
  })
})

describe('POST /referrals/:id/relevant-sentence', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build()
    const serviceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })
    const referral = draftReferralFactory
      .serviceCategorySelected(serviceCategory.id)
      .build({ interventionId: intervention.id })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('updates the referral on the backend and redirects to the next question', async () => {
    await request(app)
      .post('/referrals/1/relevant-sentence')
      .type('form')
      .send({ 'relevant-sentence-id': 2500284169 })
      .expect(302)
      .expect('Location', `/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes`)

    expect(interventionsService.patchDraftReferral).toHaveBeenCalledWith('token', '1', {
      relevantSentenceId: 2500284169,
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/relevant-sentence')
      .type('form')
      .send({ 'relevant-sentence-id': 2500284169 })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })

    expect(interventionsService.patchDraftReferral).toHaveBeenCalledWith('token', '1', {
      relevantSentenceId: 2500284169,
    })
  })
})

describe('GET /referrals/:id/service-categories', () => {
  it('renders a form page', async () => {
    const serviceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })

    const intervention = interventionFactory.build({
      serviceCategories: [serviceCategory],
    })

    const referral = draftReferralFactory.serviceUserSelected().serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .get('/referrals/1/service-categories')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What service categories are you referring Alex to?')
      })
  })
})

describe('POST /referrals/:id/service-categories', () => {
  it('updates the referral on the backend and redirects to the next question', async () => {
    const serviceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })

    const intervention = interventionFactory.build({
      serviceCategories: [serviceCategory],
    })

    const referral = draftReferralFactory.serviceUserSelected().serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .post('/referrals/1/service-categories')
      .type('form')
      .send({ 'service-category-ids[]': [serviceCategory.id] })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral).toHaveBeenCalledWith('token', '1', {
      serviceCategoryIds: [serviceCategory.id],
    })
  })
})

describe('GET /referrals/:referralId/service-category/:service-category-id/desired-outcomes', () => {
  beforeEach(() => {
    const socialInclusionServiceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })
    const accommodationServiceCategory = serviceCategoryFactory.build({
      id: 'd69b80d5-0005-4f08-b5d8-404999c9e843',
      name: 'accommodation',
    })

    const referral = draftReferralFactory
      .serviceCategoriesSelected([socialInclusionServiceCategory.id, accommodationServiceCategory.id])
      .build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategoryByIdAndContractReference.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What are the desired outcomes for the Social inclusion service?')
      })

    expect(interventionsService.getServiceCategoryByIdAndContractReference.mock.calls[0]).toEqual([
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39',
      '192',
    ])
  })

  it('renders an error when the request for a service category fails', async () => {
    interventionsService.getServiceCategoryByIdAndContractReference.mockRejectedValue(
      new Error('Failed to get service category')
    )

    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get service category')
      })
  })
})

describe('POST /referrals/:referralId/service-category/:service-category-id/desired-outcomes/', () => {
  const desiredOutcomes = [
    {
      id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
      description:
        'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
    },
    {
      id: '65924ac6-9724-455b-ad30-906936291421',
      description: 'Service user makes progress in obtaining accommodation',
    },
    {
      id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
      description: 'Service user is helped to secure social or supported housing',
    },
    {
      id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
      description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
    },
  ]

  describe('for a single-service referral', () => {
    beforeEach(() => {
      const serviceCategory = serviceCategoryFactory.build({
        id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        desiredOutcomes,
        name: 'social inclusion',
      })
      const referral = draftReferralFactory.serviceCategoriesSelected([serviceCategory.id]).build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    })

    it('updates the referral on the backend and redirects to the complexity level page', async () => {
      await request(app)
        .post('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes')
        .type('form')
        .send({ 'desired-outcomes-ids[]': [desiredOutcomes[0].id, desiredOutcomes[1].id] })
        .expect(302)
        .expect('Location', '/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')

      expect(interventionsService.setDesiredOutcomesForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
      })
    })
  })

  describe('for a cohort referral', () => {
    const serviceCategory1Id = 'b33c19d1-7414-4014-b543-e543e59c5b39'
    const serviceCategory2Id = '83379e52-cf8f-4fbf-8a13-64c6f85ccf51'
    beforeEach(() => {
      const serviceCategory1 = serviceCategoryFactory.build({
        id: serviceCategory1Id,
        desiredOutcomes,
        name: 'social inclusion',
      })
      const referral = draftReferralFactory.serviceCategoriesSelected([serviceCategory1Id, serviceCategory2Id]).build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory1)
    })

    it('updates the referral on the backend and redirects to the complexity level page', async () => {
      await request(app)
        .post(`/referrals/1/service-category/${serviceCategory1Id}/desired-outcomes`)
        .type('form')
        .send({ 'desired-outcomes-ids[]': [desiredOutcomes[0].id, desiredOutcomes[1].id] })
        .expect(302)
        .expect('Location', `/referrals/1/service-category/${serviceCategory1Id}/complexity-level`)

      expect(interventionsService.setDesiredOutcomesForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
      })
    })
  })

  describe('when the API call fails with a non-validation error', () => {
    beforeEach(() => {
      const serviceCategory = serviceCategoryFactory.build({
        id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        desiredOutcomes,
        name: 'social inclusion',
      })
      const referral = draftReferralFactory.serviceCategoriesSelected([serviceCategory.id]).build()

      interventionsService.getDraftReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    })

    it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
      interventionsService.setDesiredOutcomesForServiceCategory.mockRejectedValue({
        message: 'Some backend error message',
      })

      await request(app)
        .post('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes')
        .type('form')
        .send({ 'desired-outcomes-ids[]': [desiredOutcomes[0].id, desiredOutcomes[1].id] })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Some backend error message')
        })

      expect(interventionsService.setDesiredOutcomesForServiceCategory).toHaveBeenCalledWith('token', '1', {
        serviceCategoryId: 'b33c19d1-7414-4014-b543-e543e59c5b39',
        desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
      })
    })
  })
})

describe('GET /referrals/:id/enforceable-days', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/enforceable-days')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('How many days will you use for this service?')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/enforceable-days')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })
})

describe('POST /referrals/:id/enforceable-days', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the referral on the backend and redirects to the next question', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      maximumEnforceableDays: 10,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/enforceable-days')
      .type('form')
      .send({
        'maximum-enforceable-days': '10',
      })
      .expect(302)
      .expect('Location', '/referrals/1/completion-deadline')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        maximumEnforceableDays: 10,
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/enforceable-days')
        .type('form')
        .send({
          'maximum-enforceable-days': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('How many days will you use for this service?')
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/enforceable-days')
      .type('form')
      .send({
        'maximum-enforceable-days': '10',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/check-all-referral-information', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = draftReferralFactory
      .serviceCategorySelected(serviceCategory.id)
      .completionDeadlineSet()
      .build({
        serviceUser: { firstName: 'Johnny', lastName: 'Blair', religionOrBelief: 'Agnostic' },
        relevantSentenceId: 123,
        personCurrentLocationType: CurrentLocationType.community,
      })
    const conviction = caseConvictionFactory.build()
    const prisonList = prisonFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(expandedDeliusServiceUserFactory.build())
    ramDeliusApiService.getConvictionByCrnAndId.mockResolvedValue(conviction)
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
  })

  it('displays a summary of the draft referral', async () => {
    await request(app)
      .get('/referrals/1/check-all-referral-information')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Check all referral information')
        expect(res.text).toContain('Johnny Blair’s personal details')
        expect(res.text).toContain('Agnostic')
      })
  })

  describe('when an API call returns an error', () => {
    it('returns a 500 and displays an error message', async () => {
      interventionsService.getDraftReferral.mockRejectedValue(new Error('Backend error message'))

      await request(app)
        .get('/referrals/1/check-all-referral-information')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Backend error message')
        })
    })
  })
})

describe('POST /referrals/:id/send', () => {
  it('sends the draft referral on the interventions service and redirects to the confirmation page', async () => {
    const referral = sentReferralFactory.build()
    interventionsService.sendDraftReferral.mockResolvedValue(referral)

    await request(app)
      .post('/referrals/1/send')
      .expect(303)
      .expect('Location', `/referrals/${referral.id}/confirmation`)

    expect(interventionsService.sendDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  describe('when the interventions service returns an error', () => {
    beforeEach(() => {
      interventionsService.sendDraftReferral.mockRejectedValue(new Error('Failed to create referral'))
    })

    it('displays an error page', async () => {
      await request(app)
        .post('/referrals/1/send')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Failed to create referral')
        })

      expect(interventionsService.sendDraftReferral).toHaveBeenCalledTimes(1)
    })
  })
})

describe('GET /referrals/:id/confirmation', () => {
  it('displays a submission confirmation page', async () => {
    const referral = sentReferralFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)

    await request(app)
      .get('/referrals/1/confirmation')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('We’ve sent your referral to Harmony Living')
        expect(res.text).toContain(referral.referenceNumber)
      })
  })

  describe('when an API call returns an error', () => {
    it('returns a 500 and displays an error message', async () => {
      interventionsService.getSentReferral.mockRejectedValue(new Error('Backend error message'))

      await request(app)
        .get('/referrals/1/confirmation')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Backend error message')
        })
    })
  })
})
