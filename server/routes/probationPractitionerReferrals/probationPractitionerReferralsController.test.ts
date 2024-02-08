import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import getCookieValue from '../testutils/responseUtils'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import sentReferralSummariesFactory from '../../../testutils/factories/sentReferralSummaries'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import prisonFactory from '../../../testutils/factories/prison'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import interventionFactory from '../../../testutils/factories/intervention'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import caseConvictionFactory from '../../../testutils/factories/caseConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import SentReferral from '../../models/sentReferral'
import { RamDeliusUser } from '../../models/delius/deliusUser'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import DraftsService from '../../services/draftsService'
import { PPDashboardType } from './dashboardPresenter'
import pageFactory from '../../../testutils/factories/page'
import { Page } from '../../models/pagination'
import UserDataService from '../../services/userDataService'
import SentReferralSummaries from '../../models/sentReferralSummaries'
import ApprovedActionPlanSummary from '../../models/approvedActionPlanSummary'
import { ActionPlanAppointment } from '../../models/appointment'
import approvedActionPlanSummary from '../../../testutils/factories/approvedActionPlanSummary'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonApiService from '../../services/prisonApiService'
import { DeliusResponsibleOfficer } from '../../models/delius/deliusResponsibleOfficer'
import deliusResponsibleOfficerFactory from '../../../testutils/factories/deliusResponsibleOfficer'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import ramDeliusUserFactory from '../../../testutils/factories/ramDeliusUser'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import { CurrentLocationType } from '../../models/draftReferral'
import secureChildAgency from '../../../testutils/factories/secureChildAgency'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'

jest.mock('../../services/interventionsService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')
jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/ramDeliusApiService')
jest.mock('../../services/prisonApiService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>

const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>

const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
)

const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

const userDataService = {
  store: jest.fn(),
  retrieve: jest.fn(),
} as unknown as jest.Mocked<UserDataService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      hmppsAuthService,
      assessRisksAndNeedsService,
      draftsService,
      userDataService,
      prisonRegisterService,
      ramDeliusApiService,
      prisonApiService,
      prisonAndSecuredChildAgencyService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
  const prisonList = prisonFactory.build()
  prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/find', () => {
  interventionsService.getDraftReferralsForUserToken.mockResolvedValue([])
  userDataService.retrieve.mockResolvedValue(Promise.resolve(null))

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
        expect(res.text).toContain('Accommodation')
      })
  })
})

describe('GET /probation-practitioner/dashboard', () => {
  const dashboardRequests: { type: PPDashboardType; url: string; dashboardType: string; searchString: string }[] = [
    {
      type: 'Open cases',
      url: '/probation-practitioner/dashboard?page=2',
      dashboardType: '',
      searchString: 'page=2',
    },
    {
      type: 'Open cases',
      url: '/probation-practitioner/dashboard/open-cases?page=2',
      dashboardType: '/open-cases',
      searchString: 'page=2',
    },
    {
      type: 'Unassigned cases',
      url: '/probation-practitioner/dashboard/unassigned-cases?page=2',
      dashboardType: '/unassigned-cases',
      searchString: 'page=2',
    },
    {
      type: 'Completed cases',
      url: '/probation-practitioner/dashboard/completed-cases?page=2',
      dashboardType: '/completed-cases',
      searchString: 'page=2',
    },
    {
      type: 'Cancelled cases',
      url: '/probation-practitioner/dashboard/cancelled-cases?page=2',
      dashboardType: '/cancelled-cases',
      searchString: 'page=2',
    },
  ]
  describe.each(dashboardRequests)('for dashboard %s', dashboard => {
    it('displays a dashboard page', async () => {
      const referrals = [sentReferralSummariesFactory.build()]
      const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

      interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

      await request(app)
        .get(dashboard.url)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(dashboard.type)
          expect(res.text).toContain('Alex River')
          expect(res.text).toContain('Accommodation Services - West Midlands')
        })
    })

    it('stores dashboard link in cookies', async () => {
      const referrals = [sentReferralSummariesFactory.build()]
      const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

      interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

      await request(app)
        .get(dashboard.url)
        .expect(res => {
          const cookieVal = getCookieValue(res.header['set-cookie'])
          expect(cookieVal).toMatchObject({
            dashboardOriginPage: `/probation-practitioner/dashboard${dashboard.dashboardType}?${dashboard.searchString}`,
          })
        })
    })
  })
  it('displays a dashboard page with invalid page number', async () => {
    apiConfig.dashboards.probationPractitioner.openCases = 1
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'River',
        },
      }),
    ]
    const page = pageFactory
      .pageContent(referrals)
      .build({ totalPages: 2, totalElements: 2 }) as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/probation-practitioner/dashboard/open-cases?page=-200')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('Showing <b>1</b> to <b>2</b> of <b>2</b>')
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
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])

    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Intervention sessions')
        expect(res.text).toContain('These show the progress of each intervention session')
      })
  })
  it('displays information about the intervention progress with Action plan appointment not attended with same session number', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const actionPlan = actionPlanFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
      actionPlanId: actionPlan.id,
    })
    const appointment = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 1,
      appointmentTime: `Thu Jun 18 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      oldAppointments: [
        actionPlanAppointmentFactory.attended('no', false).build({
          sessionNumber: 1,
          appointmentTime: `Thu Jun 17 2022 17:20`,
          durationInMinutes: 1,
          sessionType: 'ONE_TO_ONE',
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
        }),
        actionPlanAppointmentFactory.attended('no', false).build({
          sessionNumber: 1,
          appointmentTime: `Thu Jun 16 2022 17:20`,
          durationInMinutes: 1,
          sessionType: 'ONE_TO_ONE',
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
        }),
      ],
    })

    const appointmentDuplicate3 = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 2,
      appointmentTime: `Thu Jun 19 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      oldAppointments: [
        actionPlanAppointmentFactory.attended('no', false).build({
          sessionNumber: 2,
          appointmentTime: `Thu Jun 20 2022 17:20`,
          durationInMinutes: 1,
          sessionType: 'ONE_TO_ONE',
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
        }),
      ],
    })

    const appointmentDuplicate5 = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 3,
      appointmentTime: `Thu Jun 20 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
    })
    const approvedSummary = approvedActionPlanSummary.build()
    const approvedSummaries: ApprovedActionPlanSummary[] = [approvedSummary]
    const actionPlanAppointments: ActionPlanAppointment[] = [appointment, appointmentDuplicate3, appointmentDuplicate5]

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedSummaries)
    interventionsService.getActionPlanAppointments.mockResolvedValue(actionPlanAppointments)
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Intervention sessions')
        expect(res.text).toContain('did not attend')
        expect(res.text).toContain('scheduled')
        expect(res.text).not.toContain('Reschedule session')
        expect(res.text).toContain('View feedback form')
        expect(res.text).toContain(`17 Jun 2022`)
        expect(res.text).toContain(`18 Jun 2022`)
        expect(res.text).toContain(`19 Jun 2022`)
        expect(res.text).toContain(`20 Jun 2022`)
      })
  })
  it('does not show session history drop down when no children available', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const actionPlan = actionPlanFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
      actionPlanId: actionPlan.id,
    })
    const appointment = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 1,
      appointmentTime: `Thu Jun 18 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      oldAppointments: [],
    })

    const appointmentDuplicate3 = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 2,
      appointmentTime: `Thu Jun 19 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      oldAppointments: [],
    })

    const appointmentDuplicate5 = actionPlanAppointmentFactory.scheduled().build({
      sessionNumber: 3,
      appointmentTime: `Thu Jun 20 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
    })
    const approvedSummary = approvedActionPlanSummary.build()
    const approvedSummaries: ApprovedActionPlanSummary[] = [approvedSummary]
    const actionPlanAppointments: ActionPlanAppointment[] = [appointment, appointmentDuplicate3, appointmentDuplicate5]

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedSummaries)
    interventionsService.getActionPlanAppointments.mockResolvedValue(actionPlanAppointments)
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).not.toContain('Session 1 history')
      })
  })
})

describe('GET /probation-practitioner/end-of-service-report/:id', () => {
  it('renders a page with the contents of the end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
})

describe('GET /probation-practitioner/referrals/:id/details', () => {
  const intervention = interventionFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
  const conviction = caseConvictionFactory.build()
  const riskSummary: RiskSummary = riskSummaryFactory.build()
  let sentReferral: SentReferral
  let ramDeliusUser: RamDeliusUser
  let expandedDeliusServiceUser: DeliusServiceUser
  let supplementaryRiskInformation: SupplementaryRiskInformation
  let responsibleOfficer: DeliusResponsibleOfficer

  beforeEach(() => {
    sentReferral = sentReferralFactory.build()
    ramDeliusUser = ramDeliusUserFactory.build()
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
    responsibleOfficer = deliusResponsibleOfficerFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    ramDeliusApiService.getUserByUsername.mockResolvedValue(ramDeliusUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(expandedDeliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getConvictionByCrnAndId.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
  })

  it('displays information about the referral and service user', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        personCurrentLocationType: CurrentLocationType.community,
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build()
    responsibleOfficer = deliusResponsibleOfficerFactory.build({
      communityManager: {
        name: { forename: 'Peter', surname: 'Practitioner' },
        team: {
          telephoneNumber: '07890 123456',
          email: 'probation-team4692@justice.gov.uk',
        },
      },
    })

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    ramDeliusApiService.getUserByUsername.mockResolvedValue(ramDeliusUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(expandedDeliusServiceUser)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This intervention is not yet assigned to a caseworker')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('b.a@xyz.com')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('0123456789')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
      })
  })

  it('displays information about the referral and service user for a custody referral', async () => {
    sentReferral = sentReferralFactory.unassigned().build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build()
    responsibleOfficer = deliusResponsibleOfficerFactory.build({
      communityManager: {
        name: { forename: 'Peter', surname: 'Practitioner' },
        team: {
          telephoneNumber: '07890 123456',
          email: 'probation-team4692@justice.gov.uk',
        },
      },
    })

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    ramDeliusApiService.getUserByUsername.mockResolvedValue(ramDeliusUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(expandedDeliusServiceUser)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This intervention is not yet assigned to a caseworker')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('b.a@xyz.com')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('0123456789')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      sentReferral = sentReferralFactory.assigned().build()
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])
      prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
      prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())

      await request(app)
        .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This intervention is assigned to')
          expect(res.text).toContain('John Smith')
          expect(res.text).toContain('change-link')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/action-plan', () => {
  it('displays information about the latest action plan and service user', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build({ crn: 'X123456' })
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    const approvedActionPlanSummaries = approvedActionPlanSummary.buildList(2)
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedActionPlanSummaries)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
    const deliusServiceUser = deliusServiceUserFactory.build({ crn: 'X123456' })
    const actionPlan = actionPlanFactory.approved().build()
    const approvedActionPlanSummaries = approvedActionPlanSummary.buildList(2)
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedActionPlanSummaries)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
    const deliusServiceUser = deliusServiceUserFactory.build({ crn: 'X123456' })
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
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
    const deliusServiceUser = deliusServiceUserFactory.build({ crn: 'X123456' })

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
