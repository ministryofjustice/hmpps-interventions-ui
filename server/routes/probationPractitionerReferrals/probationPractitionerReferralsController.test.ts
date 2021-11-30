import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import deliusOffenderManagerFactory from '../../../testutils/factories/deliusOffenderManager'
import { DeliusOffenderManager } from '../../models/delius/deliusOffenderManager'
import DraftsService from '../../services/draftsService'
import approvedActionPlanSummaryFactory from '../../../testutils/factories/approvedActionPlanSummary'
import { PPDashboardType } from './dashboardPresenter'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
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
    },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/find', () => {
  interventionsService.getDraftReferralsForUserToken.mockResolvedValue([])

  it('displays a list in-progress referrals', async () => {
    const referral = draftReferralFactory.serviceUserSelected().build()

    interventionsService.getDraftReferralsForUserToken.mockResolvedValue([referral])

    await request(app)
      .get('/probation-practitioner/find')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Refer and monitor an intervention')
        expect(res.text).toContain('Find interventions')
        expect(res.text).toContain('Alex River')
      })
  })
})

describe('GET /probation-practitioner/dashboard', () => {
  const dashboardRequests: { type: PPDashboardType; url: string }[] = [
    {
      type: 'Open cases',
      url: '/probation-practitioner/dashboard',
    },
    {
      type: 'Open cases',
      url: '/probation-practitioner/dashboard/open-cases',
    },
    {
      type: 'Unassigned cases',
      url: '/probation-practitioner/dashboard/unassigned-cases',
    },
    {
      type: 'Completed cases',
      url: '/probation-practitioner/dashboard/completed-cases',
    },
    {
      type: 'Cancelled cases',
      url: '/probation-practitioner/dashboard/cancelled-cases',
    },
  ]
  describe.each(dashboardRequests)('for dashboard %s', dashboard => {
    it('displays a dashboard page', async () => {
      const intervention = interventionFactory.build({ id: '1', title: 'Accommodation Services - West Midlands' })
      const referrals = [
        sentReferralFactory.assigned().build({
          referral: {
            interventionId: '1',
            serviceUser: {
              firstName: 'Alex',
              lastName: 'River',
            },
          },
        }),
      ]

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferralsForUserToken.mockResolvedValue(referrals)

      await request(app)
        .get(dashboard.url)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(dashboard.type)
          expect(res.text).toContain('Alex River')
          expect(res.text).toContain('Accommodation Services - West Midlands')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const hmppsAuthUser = hmppsAuthUserFactory.build()
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const serviceUser = deliusServiceUserFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
    })
    const supplierAssessment = supplierAssessmentFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

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

describe('GET /probation-practitioner/end-of-service-report/:id', () => {
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
      .get(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)
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
      .get(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Expected service categories are missing in intervention')
      })
  })
})

describe('GET /probation-practitioner/referrals/:id/details', () => {
  const intervention = interventionFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
  const conviction = deliusConvictionFactory.build()
  const riskSummary: RiskSummary = riskSummaryFactory.build()
  let sentReferral: SentReferral
  let deliusUser: DeliusUser
  let expandedDeliusServiceUser: ExpandedDeliusServiceUser
  let supplementaryRiskInformation: SupplementaryRiskInformation
  let responsibleOfficer: DeliusOffenderManager

  beforeEach(() => {
    sentReferral = sentReferralFactory.build()
    deliusUser = deliusUserFactory.build()
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
    responsibleOfficer = deliusOffenderManagerFactory.responsibleOfficer().build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(expandedDeliusServiceUser)
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
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
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
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(expandedDeliusServiceUser)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    communityApiService.getResponsibleOfficerForServiceUser.mockResolvedValue(responsibleOfficer)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This intervention is not yet assigned to a caseworker')
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
        .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This intervention is assigned to')
          expect(res.text).toContain('John Smith')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/action-plan', () => {
  it('displays information about the latest action plan and service user', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    const approvedActionPlanSummaries = approvedActionPlanSummaryFactory.buildList(2)
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedActionPlanSummaries)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/action-plan`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('Action plan status')
        expect(res.text).toContain('Awaiting approval')
        expect(res.text).toContain('Do you want to approve this action plan?')
      })
  })
})

describe('GET /probation-practitioner/action-plan/:actionPlanId', () => {
  it('displays information about the specified action plan and service user', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.approved().build()
    const approvedActionPlanSummaries = approvedActionPlanSummaryFactory.buildList(2)
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedActionPlanSummaries)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/probation-practitioner/action-plan/${actionPlan.id}`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('X123456')
        expect(res.text).toContain('Action plan status')
        expect(res.text).toContain('Approved')
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/action-plan/approve', () => {
  it('calls interventions service to approve action plan', async () => {
    const sentReferral = sentReferralFactory.assigned().build({ actionPlanId: '724bf133-65cb-43d4-bff9-ca692ad1d381' })
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)

    await request(app)
      .post(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approve`)
      .type('form')
      .send({ 'confirm-approval': 'confirmed' })
      .expect(302)
    expect(interventionsService.approveActionPlan.mock.calls.length).toBe(1)
    expect(interventionsService.approveActionPlan.mock.calls[0][1]).toBe('724bf133-65cb-43d4-bff9-ca692ad1d381')
  })

  it("redirects back to action-plan if approval hasn't been confirmed", async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])

    await request(app)
      .post(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approve`)
      .type('form')
      .send({})
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select the checkbox to confirm before you approve the action plan')
      })
    expect(interventionsService.approveActionPlan.mock.calls.length).toBe(0)
  })
})

describe('GET /probation-practitioner/referrals/:id/action-plan/approved', () => {
  it('displays a panel and link back to the intervention progress page', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approved`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('Action plan approved')
        expect(res.text).toContain('Return to intervention progress')
        expect(res.text).toContain(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      })
  })
})

describe('GET /probation-practitioner/referrals/:id/supplier-assessment', () => {
  it('shows a summary of the current supplier assessment appointment', async () => {
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'Liam',
      lastName: 'Johnson',
      username: 'liam.johnson',
    })
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

    const referral = sentReferralFactory.build({ assignedTo: { username: hmppsAuthUser.username } })
    interventionsService.getSentReferral.mockResolvedValue(referral)

    const appointments = [
      ...initialAssessmentAppointmentFactory.buildList(2),
      initialAssessmentAppointmentFactory.newlyBooked().build({
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
      }),
    ]
    const supplierAssessment = supplierAssessmentFactory.build({
      appointments,
      currentAppointmentId: appointments[2].id,
    })
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

    await request(app)
      .get(`/probation-practitioner/referrals/1/supplier-assessment`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Liam Johnson')
        expect(res.text).toContain('24 March 2021')
        expect(res.text).toContain('9:02am to 10:17am')
      })
  })
})
