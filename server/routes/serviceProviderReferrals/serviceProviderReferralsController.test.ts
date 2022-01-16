import request from 'supertest'
import { Express } from 'express'
import createError from 'http-errors'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import HmppsAuthService from '../../services/hmppsAuthService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import { DeliusOffenderManager } from '../../models/delius/deliusOffenderManager'
import deliusOffenderManagerFactory from '../../../testutils/factories/deliusOffenderManager'
import ServiceProviderSentReferralSummary from '../../models/serviceProviderSentReferralSummary'
import { createDraftFactory } from '../../../testutils/factories/draft'
import { DraftAssignmentData } from './serviceProviderReferralsController'
import DraftsService from '../../services/draftsService'
import MockReferenceDataService from '../testutils/mocks/mockReferenceDataService'
import ReferenceDataService from '../../services/referenceDataService'
import serviceProviderSentReferralSummaryFactory from '../../../testutils/factories/serviceProviderSentReferralSummary'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')

const draftAssignmentFactory = createDraftFactory<DraftAssignmentData>({ email: null })

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

const referenceDataService = new MockReferenceDataService() as jest.Mocked<ReferenceDataService>

const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      communityApiService,
      hmppsAuthService,
      assessRisksAndNeedsService,
      draftsService,
      referenceDataService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /service-provider/dashboard', () => {
  it('displays a list of my cases', async () => {
    const referralsSummary: ServiceProviderSentReferralSummary[] = [
      {
        referralId: '1',
        sentAt: '2021-01-26T13:00:00.000000Z',
        referenceNumber: 'ABCABCA1',
        interventionTitle: 'Accommodation Services - West Midlands',
        assignedToUserName: 'user1',
        serviceUserFirstName: 'George',
        serviceUserLastName: 'Michael',
      },
      {
        referralId: '2',
        sentAt: '2020-10-13T13:00:00.000000Z',
        referenceNumber: 'ABCABCA2',
        interventionTitle: "Women's Services - West Midlands",
        assignedToUserName: 'user1',
        serviceUserFirstName: 'Jenny',
        serviceUserLastName: 'Jones',
      },
    ]

    interventionsService.getServiceProviderSentReferralsSummaryForUserToken.mockResolvedValue(referralsSummary)

    await request(app)
      .get('/service-provider/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Jenny Jones')
        expect(res.text).toContain('Women&#39;s Services - West Midlands')
      })
  })
})

describe('GET /service-provider/dashboard/my-cases', () => {
  it('displays a list of my cases', async () => {
    const assignedToSelf = serviceProviderSentReferralSummaryFactory.withAssignedUser('user1').open().build({
      referenceNumber: 'assignedToSelfRef',
    })
    interventionsService.getServiceProviderSentReferralsSummaryForUserToken.mockResolvedValue([assignedToSelf])
    await request(app)
      .get('/service-provider/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('assignedToSelfRef')
      })
  })
})

describe('GET /service-provider/dashboard/all-open-cases', () => {
  it('displays a list of all open cases', async () => {
    const assignedToSelf = serviceProviderSentReferralSummaryFactory.withAssignedUser('user1').open().build({
      referenceNumber: 'assignedToSelfRef',
    })
    interventionsService.getServiceProviderSentReferralsSummaryForUserToken.mockResolvedValue([assignedToSelf])
    await request(app)
      .get('/service-provider/dashboard/all-open-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('assignedToSelfRef')
      })
  })
})

describe('GET /service-provider/dashboard/unassigned-cases', () => {
  it('displays a list of unassigned cases', async () => {
    const unassigned = serviceProviderSentReferralSummaryFactory.unassigned().open().build({
      referenceNumber: 'unassignedRef',
    })
    interventionsService.getServiceProviderSentReferralsSummaryForUserToken.mockResolvedValue([unassigned])
    await request(app)
      .get('/service-provider/dashboard/unassigned-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Unassigned cases')
        expect(res.text).toContain('unassignedRef')
      })
  })
})

describe('GET /service-provider/dashboard/completed-cases', () => {
  it('displays a list of completed cases', async () => {
    const completed = serviceProviderSentReferralSummaryFactory.completed().build({
      referenceNumber: 'completedRef',
    })
    interventionsService.getServiceProviderSentReferralsSummaryForUserToken.mockResolvedValue([completed])
    await request(app)
      .get('/service-provider/dashboard/completed-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Completed cases')
        expect(res.text).toContain('completedRef')
      })
  })
})

describe('GET /service-provider/referrals/:id/details', () => {
  const intervention = interventionFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
  const conviction = deliusConvictionFactory.build()
  const riskSummary: RiskSummary = riskSummaryFactory.build()
  let sentReferral: SentReferral
  let deliusUser: DeliusUser
  let deliusServiceUser: ExpandedDeliusServiceUser
  let supplementaryRiskInformation: SupplementaryRiskInformation
  let responsibleOfficer: DeliusOffenderManager

  beforeEach(() => {
    sentReferral = sentReferralFactory.build()
    deliusUser = deliusUserFactory.build()
    deliusServiceUser = expandedDeliusServiceUserFactory.build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
    responsibleOfficer = deliusOffenderManagerFactory.responsibleOfficer().build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    communityApiService.getConvictionById.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    communityApiService.getResponsibleOfficerForServiceUser.mockResolvedValue(responsibleOfficer)
  })

  it('displays information about the referral and service user', async () => {
    sentReferral = sentReferralFactory.unassigned().build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
    deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })
    deliusServiceUser = expandedDeliusServiceUserFactory.build({
      firstName: 'Alex',
      surname: 'River',
      contactDetails: {
        emailAddresses: ['alex.river@example.com'],
        phoneNumbers: [
          {
            number: '07123456789',
            type: 'MOBILE',
          },
        ],
        addresses: [
          {
            addressNumber: 'Flat 10',
            buildingName: null,
            streetName: 'Test Walk',
            postcode: 'SW16 1AQ',
            town: 'London',
            district: 'City of London',
            county: 'Greater London',
            from: '2021-01-01',
            to: null,
            noFixedAbode: false,
          },
        ],
      },
    })
    responsibleOfficer = deliusOffenderManagerFactory
      .responsibleOfficer()
      .build({ staff: { forenames: 'Peter', surname: 'Practitioner' } })

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    communityApiService.getResponsibleOfficerForServiceUser.mockResolvedValue(responsibleOfficer)

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Peter Practitioner')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain("service user's Risk of Serious Harm (ROSH) levels")
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
        expect(res.text).toContain('07890 123456')
        expect(res.text).toContain('probation-team4692@justice.gov.uk')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      sentReferral = sentReferralFactory.assigned().build()
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      await request(app)
        .get(`/service-provider/referrals/${sentReferral.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This intervention is assigned to')
          expect(res.text).toContain('John Smith')
        })
    })
  })
})

describe('GET /service-provider/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })

    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
    })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Session progress')
      })
  })
})

describe('POST /service-provider/referrals/:id/assignment/start', () => {
  it('creates a draft assignment using the drafts service and redirects to the check answers page', async () => {
    const draftAssignment = draftAssignmentFactory.build({ data: { email: 'tom@tom.com' } })
    draftsService.createDraft.mockResolvedValue(draftAssignment)

    await request(app)
      .post(`/service-provider/referrals/123456/assignment/start`)
      .type('form')
      .send({ email: 'tom@tom.com' })
      .expect(302)
      .expect('Location', `/service-provider/referrals/123456/assignment/${draftAssignment.id}/check`)

    expect(draftsService.createDraft).toHaveBeenCalledWith('assignment', { email: 'tom@tom.com' }, { userId: '123' })
  })

  it('redirects to referral details page with an error if the assignee email address is missing from the request body', async () => {
    await request(app)
      .post(`/service-provider/referrals/123456/assignment/start`)
      .expect(302)
      .expect('Location', '/service-provider/referrals/123456/details?error=An%20email%20address%20is%20required')

    expect(draftsService.createDraft).not.toHaveBeenCalled()
  })

  it('redirects to referral details page with an error if the assignee email address is not found in HMPPS Auth', async () => {
    hmppsAuthService.getSPUserByEmailAddress.mockRejectedValue(new Error(''))

    await request(app)
      .post(`/service-provider/referrals/123456/assignment/start`)
      .type('form')
      .send({ email: 'tom@tom.com' })
      .expect(302)
      .expect('Location', '/service-provider/referrals/123456/details?error=Email%20address%20not%20found')

    expect(draftsService.createDraft).not.toHaveBeenCalled()
  })
})

describe('GET /service-provider/referrals/:id/assignment/:draftAssignmentId/check', () => {
  it('displays the name of the selected caseworker', async () => {
    const draftAssignment = draftAssignmentFactory.build({ data: { email: 'john@harmonyliving.org.uk' } })
    draftsService.fetchDraft.mockResolvedValue(draftAssignment)

    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.build({ referral: { interventionId: intervention.id } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${referral.id}/assignment/${draftAssignment.id}/check`)
      .query({ email: 'john@harmonyliving.org.uk' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm the Accommodation referral assignment')
        expect(res.text).toContain('John Smith')
        expect(res.text).toContain('john@harmonyliving.org.uk')
      })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .get(`/service-provider/referrals/abc/assignment/def/check`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started assigning this intervention to a caseworker. The referral has not been assigned, and you will need to start again.'
          )
        })
    })
  })

  describe('when the draft assignment has been soft deleted', () => {
    it('responds with a 410 Gone status and renders an error message', async () => {
      const draftAssignment = draftAssignmentFactory.build({ softDeleted: true })
      draftsService.fetchDraft.mockResolvedValue(draftAssignment)

      const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
      const referral = sentReferralFactory.build({ referral: { interventionId: intervention.id } })
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      hmppsAuthService.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/assignment/${draftAssignment.id}/check`)
        .query({ email: 'john@harmonyliving.org.uk' })
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})

describe('POST /service-provider/referrals/:id/:draftAssignmentId/submit', () => {
  it('assigns the referral to the selected caseworker', async () => {
    const draftAssignment = draftAssignmentFactory.build({ data: { email: 'john@harmonyliving.org.uk' } })
    draftsService.fetchDraft.mockResolvedValue(draftAssignment)
    draftsService.deleteDraft.mockResolvedValue()

    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.build({
      referral: { interventionId: intervention.id, serviceUser: { firstName: 'Alex', lastName: 'River' } },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)
    interventionsService.assignSentReferral.mockResolvedValue(referral)

    await request(app)
      .post(`/service-provider/referrals/${referral.id}/assignment/${draftAssignment.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/referrals/${referral.id}/assignment/confirmation`)

    expect(interventionsService.assignSentReferral.mock.calls[0][2]).toEqual({
      username: 'john.smith',
      userId: hmppsAuthUser.userId,
      authSource: 'auth',
    })
    expect(draftsService.deleteDraft).toHaveBeenCalledWith(draftAssignment.id, { userId: '123' })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .post(`/service-provider/referrals/abc/assignment/def/submit`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started assigning this intervention to a caseworker. The referral has not been assigned, and you will need to start again.'
          )
        })
    })
  })
})

describe('GET /service-provider/referrals/:id/assignment/confirmation', () => {
  it('displays details of the assigned caseworker and the referral', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        interventionId: intervention.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
      assignedTo: { username: 'john.smith' },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${referral.id}/assignment/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain(referral.referenceNumber)
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('John Smith')
      })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/add-activity/:number', () => {
  it('displays a page to add activities to an action plan', async () => {
    const desiredOutcome = { id: '1', description: 'Achieve a thing' }
    const serviceCategories = [
      serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] }),
    ]
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategories[0].id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomes: [
          {
            serviceCategoryId: serviceCategories[0].id,
            desiredOutcomesIds: [desiredOutcome.id],
          },
        ],
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', createdAt: '2021-03-01T10:00:00Z' }],
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add activity 2 to action plan')
        expect(res.text).toContain('Referred outcomes for Alex')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Achieve a thing')
      })
  })

  it('prefills the text area for existing activities', async () => {
    const referral = sentReferralFactory.assigned().build()
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build({
      activities: [
        { id: 'bca57234-f2f3-4a25-8f25-b17008bd9052', description: 'Do a thing', createdAt: '2021-03-01T10:00:00Z' },
        {
          id: '084a64c2-e8f5-43de-be52-b65cf4425eb4',
          description: 'Do another thing',
          createdAt: '2021-03-01T11:00:00Z',
        },
      ],
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategoryFactory.build())

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add activity 2 to action plan')
        expect(res.text).toContain('Do another thing')
        expect(res.text).toContain('084a64c2-e8f5-43de-be52-b65cf4425eb4')
      })
  })

  it('errors if the activity number is invalid', async () => {
    await request(app)
      .get(`/service-provider/action-plan/123/add-activity/invalid`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('activity number specified in URL cannot be parsed')
      })
  })

  it('errors if the activity number is too big', async () => {
    const referral = sentReferralFactory.build()
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()
    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)

    await request(app)
      .get(`/service-provider/action-plan/123/add-activity/2`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('activity number specified in URL is too big')
      })
  })
})

describe('POST /service-provider/action-plan/:id/add-activity/:number', () => {
  it('errors when an invalid activity number is passed in the URL', async () => {
    await request(app)
      .post(`/service-provider/action-plan/123/add-activity/invalid`)
      .type('form')
      .send({
        description: 'Attend training course',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('activity number specified in URL cannot be parsed')
      })
  })

  it('updates the action plan with the specified activity and renders the add activity form again', async () => {
    const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation' })]
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategories[0].id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

    await request(app)
      .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)
      .type('form')
      .send({
        description: 'Attend training course',
      })
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)

    expect(interventionsService.updateDraftActionPlan).toHaveBeenCalledWith('token', draftActionPlan.id, {
      newActivity: {
        description: 'Attend training course',
      },
    })
  })

  it('updates the action plan activity with the specified description and renders the add activity form again', async () => {
    const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation' })]
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategories[0].id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.oneActivityAdded().build()
    const activityId = draftActionPlan.activities[0].id

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

    await request(app)
      .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)
      .type('form')
      .send({
        description: 'Attend training course',
        'activity-id': activityId,
      })
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${draftActionPlan.id}/add-activity/2`)

    expect(interventionsService.updateActionPlanActivity).toHaveBeenCalledWith(
      'token',
      draftActionPlan.id,
      activityId,
      'Attend training course'
    )
  })

  describe('when the user enters no description', () => {
    it('does not update the action plan on the backend and returns a 400 with an error message', async () => {
      const desiredOutcome = { id: '8eb52caf-b462-4100-a0e9-7022d2551c92', description: 'Achieve a thing' }
      const serviceCategories = [
        serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] }),
      ]
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryIds: [serviceCategories[0].id],
          serviceUser: { firstName: 'Alex', lastName: 'River' },
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategories[0].id,
              desiredOutcomesIds: [desiredOutcome.id],
            },
          ],
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

      await request(app)
        .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity/1`)
        .type('form')
        .send({
          description: '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter an activity')
        })

      expect(interventionsService.updateDraftActionPlan).not.toHaveBeenCalled()
    })
  })
})

describe('POST /service-provider/action-plan/:id/add-activities', () => {
  const desiredOutcomes = [
    {
      id: '1',
      description: 'Description 1',
    },
    {
      id: '2',
      description: 'Description 2',
    },
    {
      id: '3',
      description: 'Description 3',
    },
  ]
  const serviceCategory = serviceCategoryFactory.build({ desiredOutcomes })
  const referral = sentReferralFactory.build({
    referral: {
      serviceCategoryIds: [serviceCategory.id],
      desiredOutcomes: [
        {
          serviceCategoryId: serviceCategory.id,
          desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
        },
      ],
    },
  })

  describe('when there is at least one activity in the action plan', () => {
    it('redirects to the next page of the action plan journey', async () => {
      const actionPlan = actionPlanFactory.build({
        activities: [
          { id: '1', createdAt: new Date().toISOString(), description: '' },
          { id: '2', createdAt: new Date().toISOString(), description: '' },
        ],
      })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(302)
        .expect('Location', `/service-provider/action-plan/${actionPlan.id}/number-of-sessions`)
    })
  })

  describe('when there is no activity in the action plan', () => {
    it('responds with a 400 and renders an error', async () => {
      const actionPlan = actionPlanFactory.build({ activities: [] })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('You must add at least one activity')
        })
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/number-of-sessions', () => {
  it('displays a page to set the number of sessions on an action plan', async () => {
    const deliusServiceUser = deliusServiceUserFactory.build()
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/number-of-sessions`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Accommodation - create action plan')
        expect(res.text).toContain('Add number of sessions for Alex’s action plan')
      })
  })
})

describe('POST /service-provider/action-plan/:actionPlanId/number-of-sessions', () => {
  describe('when a valid number of sessions is given', () => {
    it('updates the action plan on the interventions service and redirects to the next page of the journey', async () => {
      await request(app)
        .post(`/service-provider/action-plan/1/number-of-sessions`)
        .type('form')
        .send({ 'number-of-sessions': '10' })
        .expect(302)
        .expect('Location', `/service-provider/action-plan/1/review`)

      expect(interventionsService.updateDraftActionPlan).toHaveBeenCalledWith('token', '1', { numberOfSessions: 10 })
    })
  })

  describe('when an invalid number of sessions is given', () => {
    it('does not try to update the action plan on the interventions service, and renders an error message', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Alex', lastName: 'River' },
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/1/number-of-sessions`)
        .type('form')
        .send({ 'number-of-sessions': '0' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The number of sessions must be 1 or more')
        })

      expect(interventionsService.updateDraftActionPlan).not.toHaveBeenCalled()
    })
  })

  describe('when the interventions service with an error when trying to reduce the number of sessions on a previously-approved action plan', () => {
    it('renders a specific error message', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Alex', lastName: 'River' },
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      interventionsService.updateDraftActionPlan.mockRejectedValue(
        createError(400, 'bad request', {
          response: {
            body: {
              validationErrors: [{ field: 'numberOfSessions', error: 'CANNOT_BE_REDUCED' }],
            },
          },
        })
      )

      await request(app)
        .post(`/service-provider/action-plan/1/number-of-sessions`)
        .type('form')
        .send({ 'number-of-sessions': '3' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('You cannot reduce the number of sessions for a previously-approved action plan.')
        })

      expect(interventionsService.updateDraftActionPlan).toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/review', () => {
  it('renders a summary of the action plan', async () => {
    const desiredOutcome = { id: '1', description: 'Achieve a thing' }
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id] }],
      },
    })
    const draftActionPlan = actionPlanFactory.readyToSubmit(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', createdAt: '2021-03-01T10:00:00Z' }],
      numberOfSessions: 10,
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/review`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm action plan')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Achieve a thing')
        expect(res.text).toContain('Activity 1')
        expect(res.text).toContain('Do a thing')
        expect(res.text).toContain('Suggested number of sessions: 10')
      })
  })
})

describe('POST /service-provider/action-plan/:actionPlanId/submit', () => {
  it('submits the action plan and redirects to the confirmation page', async () => {
    const submittedActionPlan = actionPlanFactory.submitted().build()

    interventionsService.submitActionPlan.mockResolvedValue(submittedActionPlan)

    await request(app)
      .post(`/service-provider/action-plan/${submittedActionPlan.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${submittedActionPlan.id}/confirmation`)

    expect(interventionsService.submitActionPlan).toHaveBeenCalledWith('token', submittedActionPlan.id)
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/confirmation', () => {
  it('renders a page confirming that the action plan has been submitted', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })

    interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${submittedActionPlan.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Action plan submitted for approval')
      })
  })
})

describe('GET /service-provider/end-of-service-report/:id', () => {
  it('renders a page with the contents of the end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        desiredOutcomes: [
          { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id] },
        ],
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.submitted().build({
      outcomes: [
        {
          desiredOutcome: serviceCategory.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments',
          additionalTaskComments: 'Some task comments',
        },
      ],
      furtherInformation: 'Some further information',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Achieved')
        expect(res.text).toContain(serviceCategory.desiredOutcomes[0].description)
        expect(res.text).toContain('Some progression comments')
        expect(res.text).toContain('Some task comments')
        expect(res.text).toContain('Some further information')
      })
  })

  it('throws error if not all service categories were obtainable', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id, 'someOtherId'],
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Expected service categories are missing in intervention')
      })
  })

  it('throws an error if trying to view an in-progress end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
      },
    })
    const inProgressEndOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(inProgressEndOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${inProgressEndOfServiceReport.id}`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain(
          'You cannot view an end of service report that has not yet been submitted. Please submit the end of service report before trying to view it.'
        )
      })
  })
})

describe('POST /service-provider/referrals/:id/end-of-service-report', () => {
  describe('when a draft end of service report does not yet exist', () => {
    it('creates an end of service report for that referral on the interventions service, and redirects to the first page of the service provider end of service report journey', async () => {
      const referral = sentReferralFactory.build({ id: '19', endOfServiceReport: null })
      const endOfServiceReport = endOfServiceReportFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.createDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

      await request(app)
        .post(`/service-provider/referrals/19/end-of-service-report`)
        .expect(303)
        .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)

      expect(interventionsService.createDraftEndOfServiceReport).toHaveBeenCalledWith('token', '19')
    })
  })

  describe('when a draft end of service report has been created but not yet submitted', () => {
    it('creates an end of service report for that referral on the interventions service, and redirects to the first page of the service provider end of service report journey', async () => {
      const endOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
      const referral = sentReferralFactory.build({
        id: '19',
        endOfServiceReport,
      })

      interventionsService.getSentReferral.mockResolvedValue(referral)

      await request(app)
        .post(`/service-provider/referrals/19/end-of-service-report`)
        .expect(303)
        .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)

      expect(interventionsService.createDraftEndOfServiceReport).not.toHaveBeenCalledWith('token', '19')
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/outcomes/:number', () => {
  it('renders a form', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const desiredOutcome = serviceCategory.desiredOutcomes[0]
    const referral = sentReferralFactory.build({
      referral: {
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] }],
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Social inclusion: End of service report')
        expect(res.text).toContain('About desired outcome 1')
        expect(res.text).toContain(desiredOutcome.description)
      })
  })

  describe('when the outcome number is greater than the number of desired outcomes in the referral', () => {
    it('returns a 400 status code', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = sentReferralFactory.build({
        referral: { desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['1', '2', '3'] }] },
      })
      const endOfServiceReport = endOfServiceReportFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)

      await request(app).get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`).expect(400)
    })
  })
})

describe('POST /service-provider/end-of-service-report/:id/outcomes/:number', () => {
  describe('with valid data', () => {
    describe('when the outcome number doesn’t refer to the last of the referral’s desired outcomes', () => {
      it('updates the appointment on the interventions service and redirects to the page for the next outcome', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] },
            ],
            serviceCategoryIds: [serviceCategory.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/2`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
              progressionComments: 'Some progression comments',
            },
          }
        )
      })
    })

    describe('when the outcome refers to the last of the referral’s desired outcomes', () => {
      it('updates the appointment on the interventions service and redirects to the further information form', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['2', '3', desiredOutcome.id] },
            ],
            serviceCategoryIds: [serviceCategory.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/3`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              progressionComments: 'Some progression comments',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
            },
          }
        )
      })
    })

    describe('when the outcome number is greater than the number of desired outcomes in the referral', () => {
      it('returns a 400 and doesn’t try to update the end of service report', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['1', '2', '3'] }],
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(400)

        expect(interventionsService.updateDraftEndOfServiceReport).not.toHaveBeenCalled()
      })
    })

    describe('when the outcome number exists on the second service category', () => {
      it('should find the correct desired outcome and return the correct service category', async () => {
        const serviceCategory1 = serviceCategoryFactory.build()
        const serviceCategory2 = serviceCategoryFactory.build({
          desiredOutcomes: [
            {
              id: '27186755-7b67-497f-ad6f-6c0fde016f89',
              description: 'Service user makes progress in obtaining accommodation',
            },
            {
              id: '73a836a4-0b5d-49a5-a4d7-1564876f3e69',
              description: 'Service user is helped to secure social or supported housing',
            },
          ],
        })
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory1, serviceCategory2] })
        const desiredOutcome = serviceCategory2.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: ['1', '2', '3'] },
              { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [desiredOutcome.id, '5'] },
            ],
            serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/5`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
              progressionComments: 'Some progression comments',
            },
          }
        )
      })
    })
  })

  describe('with invalid data', () => {
    it('renders an error page and does not update the appointment on the interventions service', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
      const desiredOutcome = serviceCategory.desiredOutcomes[0]
      const referral = sentReferralFactory.build({
        referral: {
          serviceUser: { firstName: 'Alex' },
          desiredOutcomes: [
            { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] },
          ],
          serviceCategoryIds: [serviceCategory.id],
          interventionId: intervention.id,
        },
      })
      const endOfServiceReport = endOfServiceReportFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

      await request(app)
        .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
        .type('form')
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select whether Alex achieved the desired outcome')
        })

      expect(interventionsService.updateDraftEndOfServiceReport).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/further-information', () => {
  it('renders a form page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Would you like to give any additional information about this intervention (optional)?'
        )
      })
  })
})

describe('POST /service-provider/end-of-service-report/:id/further-information', () => {
  it('updates the appointment on the interventions service and redirects to the check your answers page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()

    interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

    await request(app)
      .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
      .type('form')
      .send({ 'further-information': 'Some further information' })
      .expect(302)
      .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/check-answers`)

    expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith('token', endOfServiceReport.id, {
      furtherInformation: 'Some further information',
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/check-answers', () => {
  it('renders a page with the contents of the end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        desiredOutcomes: [
          {
            serviceCategoryId: serviceCategory.id,
            desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id],
          },
        ],
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build({
      outcomes: [
        {
          desiredOutcome: serviceCategory.desiredOutcomes[0],
          achievementLevel: 'ACHIEVED',
          progressionComments: 'Some progression comments',
          additionalTaskComments: 'Some task comments',
        },
      ],
      furtherInformation: 'Some further information',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/check-answers`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Achieved')
        expect(res.text).toContain(serviceCategory.desiredOutcomes[0].description)
        expect(res.text).toContain('Some progression comments')
        expect(res.text).toContain('Some task comments')
        expect(res.text).toContain('Some further information')
      })
  })
})

describe('POST /service-provider/end-of-service-report/:id/submit', () => {
  it('submits the end of service report on the interventions service, and redirects to the confirmation page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    interventionsService.submitEndOfServiceReport.mockResolvedValue(endOfServiceReport)

    await request(app)
      .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/confirmation`)

    expect(interventionsService.submitEndOfServiceReport).toHaveBeenCalledWith('token', endOfServiceReport.id)
  })
})

describe('GET /service-provider/end-of-service-report/:id/confirmation', () => {
  it('displays a confirmation page for that end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const endOfServiceReport = endOfServiceReportFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('End of service report submitted')
      })
  })
})

describe('POST /service-provider/referrals/:id/action-plan/edit', () => {
  it('returns error if no existing action plan exists', async () => {
    const referral = sentReferralFactory.assigned().build()
    interventionsService.getSentReferral.mockResolvedValue(referral)
    await request(app)
      .post(`/service-provider/referrals/${referral.id}/action-plan/edit`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('No existing action plan exists for this referral')
      })
  })

  it('creates a new draft action plan with the attributes of the existing action plan', async () => {
    const existingActionPlan = actionPlanFactory.submitted().build({
      numberOfSessions: 5,
      activities: [
        {
          id: 'd67217a8-82eb-4e8d-bdce-60dbd6ba6db9',
          createdAt: '2020-12-07T20:45:21.986389Z',
          description: 'existing activity - 2020-12-07T20:45:21.986389Z',
        },

        {
          id: '4f3db97b-b258-4aeb-8fc1-4d712cde3e43',
          createdAt: '2020-12-07T20:50:21.986389Z',
          description: 'existing activity - 2020-12-07T20:50:21.986389Z',
        },

        {
          id: '091f94a7-939a-43e2-ba79-e5a948f1f1c3',
          createdAt: '2020-12-10T19:45:21.986389Z',
          description: 'existing activity - 2020-12-10T19:45:21.986389Z',
        },
      ],
    })
    const referral = sentReferralFactory.assigned().build({ actionPlanId: existingActionPlan.id })
    const newActionPlan = actionPlanFactory.justCreated(referral.id).build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getActionPlan.mockResolvedValue(existingActionPlan)
    interventionsService.createDraftActionPlan.mockResolvedValue(newActionPlan)

    await request(app)
      .post(`/service-provider/referrals/${referral.id}/action-plan/edit`)
      .expect(303)
      .expect('Location', `/service-provider/action-plan/${newActionPlan.id}/add-activity/1`)

    expect(interventionsService.createDraftActionPlan).toBeCalledWith('token', referral.id, 5, [
      { description: 'existing activity - 2020-12-07T20:45:21.986389Z' },
      { description: 'existing activity - 2020-12-07T20:50:21.986389Z' },
      { description: 'existing activity - 2020-12-10T19:45:21.986389Z' },
    ])
  })
})
