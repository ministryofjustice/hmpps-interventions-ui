import request from 'supertest'
import { Express } from 'express'
import createError from 'http-errors'
import moment from 'moment-timezone'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import getCookieValue from '../testutils/responseUtils'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import sentReferralSummariesFactory from '../../../testutils/factories/sentReferralSummaries'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import HmppsAuthService from '../../services/hmppsAuthService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import interventionFactory from '../../../testutils/factories/intervention'
import prisonFactory from '../../../testutils/factories/prison'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import approvedActionPlanSummary from '../../../testutils/factories/approvedActionPlanSummary'
import SentReferral from '../../models/sentReferral'
import { RamDeliusUser } from '../../models/delius/deliusUser'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import { createDraftFactory } from '../../../testutils/factories/draft'
import { DraftAssignmentData } from './serviceProviderReferralsController'
import DraftsService from '../../services/draftsService'
import MockReferenceDataService from '../testutils/mocks/mockReferenceDataService'
import ReferenceDataService from '../../services/referenceDataService'
import pageFactory from '../../../testutils/factories/page'
import { Page } from '../../models/pagination'
import UserDataService from '../../services/userDataService'
import SentReferralSummaries from '../../models/sentReferralSummaries'
import { ActionPlanAppointment } from '../../models/appointment'
import ApprovedActionPlanSummary from '../../models/approvedActionPlanSummary'
import PrisonRegisterService from '../../services/prisonRegisterService'
import Prison from '../../models/prisonRegister/prison'
import { DeliusResponsibleOfficer } from '../../models/delius/deliusResponsibleOfficer'
import deliusResponsibleOfficerFactory from '../../../testutils/factories/deliusResponsibleOfficer'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import MockRamDeliusApiService from '../testutils/mocks/mockRamDeliusApiService'
import ramDeliusUserFactory from '../../../testutils/factories/ramDeliusUser'
import caseConvictionFactory from '../../../testutils/factories/caseConviction'
import { CurrentLocationType } from '../../models/draftReferral'
import PrisonApiService from '../../services/prisonApiService'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import secureChildAgency from '../../../testutils/factories/secureChildAgency'
import prisoner from '../../../testutils/factories/prisoner'

jest.mock('../../services/interventionsService')
jest.mock('../../services/hmppsAuthService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')
jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/prisonApiService')
jest.mock('../../services/ramDeliusApiService')

const draftAssignmentFactory = createDraftFactory<DraftAssignmentData>({ email: null })

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

const referenceDataService = new MockReferenceDataService() as jest.Mocked<ReferenceDataService>

const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>

const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>

const prisonAndSecuredChildAgencyService = new PrisonAndSecuredChildAgencyService(
  prisonRegisterService,
  prisonApiService
)

const userDataService = {
  store: jest.fn(),
  retrieve: jest.fn(),
} as unknown as jest.Mocked<UserDataService>

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
      hmppsAuthService,
      assessRisksAndNeedsService,
      draftsService,
      referenceDataService,
      userDataService,
      prisonRegisterService,
      ramDeliusApiService,
      prisonApiService,
      prisonAndSecuredChildAgencyService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
  apiConfig.dashboards.serviceProvider.percentageOfPaginationUsers = 100
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /service-provider/dashboard', () => {
  it('displays a list of my cases', async () => {
    const referrals = [sentReferralSummariesFactory.build()]
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>
    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    await request(app)
      .get('/service-provider/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
      })
  })

  it('stores dashboard link in cookies', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard',
        })
      })
  })

  it('stores dashboard link in cookies with correct page number', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard?page=2')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard?page=2',
        })
      })
  })
})

describe('GET /service-provider/dashboard/my-cases', () => {
  it('displays a list of my cases', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    await request(app)
      .get('/service-provider/dashboard/my-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation Services - West Midlands')
      })
  })

  it('stores dashboard link in cookies', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/my-cases')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/my-cases',
        })
      })
  })

  it('stores dashboard link in cookies with correct page number', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/my-cases?page=2')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/my-cases?page=2',
        })
      })
  })
})

describe('GET /service-provider/dashboard/all-open-cases', () => {
  it('displays a list of all open cases', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
      sentReferralSummariesFactory.build({
        serviceUser: {
          firstName: 'George',
          lastName: 'River',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/all-open-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('George River')
      })
  })

  it('all open cases tab when there are no open cases to be viewed shows empty table', async () => {
    const referrals: SentReferralSummaries[] = []
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/all-open-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Date received') // Proves tables existence
      })
  })

  it('displays a list of all open cases when no search is present', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
      sentReferralSummariesFactory.build({
        serviceUser: {
          firstName: 'George',
          lastName: 'River',
        },
      }),
    ]

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/all-open-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('George River')
      })
  })

  it('displays a list of all open cases with search text is not empty', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
    ]

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/all-open-cases`)
      .send({ 'open-case-search-text': `Alex%20River` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
      })
  })

  it('displays no records found when the search yields no results', async () => {
    const searchText = 'nonsense'

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/all-open-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).not.toContain('Alex River')
        expect(res.text).not.toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
        expect(res.text).toContain(`There are no results for "${searchText}" in open cases`)
        expect(res.text).toContain(
          `person on probation, make sure you use their first and last name, for example James Baker`
        )
        expect(res.text).toContain(
          `referral number, check it's 8 characters long (2 letters, 4 numbers and then 2 letters)`
        )
      })
  })

  it('displays no records found when the search yields no results - empty search', async () => {
    const searchText = ''

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/all-open-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('You have not entered any search terms')
        expect(res.text).toContain('referral number, for example KW5219ED')
        expect(res.text).toContain('first and last name of the person on probation, for example James Baker')
      })
  })

  it('displays a dashboard page with invalid page number', async () => {
    apiConfig.dashboards.serviceProvider.openCases = 1
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
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/all-open-cases?page=-200')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('Showing <b>1</b> to <b>2</b> of <b>2</b>')
      })
  })

  it('stores dashboard link in cookies', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/all-open-cases')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/all-open-cases',
        })
      })
  })

  it('stores dashboard link in cookies with correct page number', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/all-open-cases?page=2')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/all-open-cases?page=2',
        })
      })
  })
})

describe('GET /service-provider/dashboard/unassigned-cases', () => {
  it('displays a list of unassigned cases', async () => {
    const referrals = [
      sentReferralSummariesFactory.unassigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const prisonList = prisonFactory.build()
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    await request(app)
      .get('/service-provider/dashboard/unassigned-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Unassigned cases')
        expect(res.text).toContain('Location')
        expect(res.text).toContain('Expected release date')
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation Services - West Midlands')
      })
  })

  it('displays a list of all unassigned cases when no search is present', async () => {
    const referrals = [
      sentReferralSummariesFactory.unassigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
      sentReferralSummariesFactory.unassigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'River',
        },
      }),
    ]
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })

    await request(app)
      .get('/service-provider/dashboard/unassigned-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('George River')
      })
  })

  it('displays a list of unassigned cases with search text is not empty', async () => {
    const referrals = [
      sentReferralSummariesFactory.unassigned().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
    ]
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })

    await request(app)
      .post(`/service-provider/dashboard/unassigned-cases`)
      .send({ 'case-search-text': `Alex%20River` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
      })
  })

  it('displays no records found when the search yields no results', async () => {
    const searchText = 'nonsense'

    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })

    await request(app)
      .post(`/service-provider/dashboard/unassigned-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).not.toContain('Alex River')
        expect(res.text).not.toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
        expect(res.text).toContain(`There are no results for "${searchText}" in unassigned cases`)
        expect(res.text).toContain(
          `person on probation, make sure you use their first and last name, for example James Baker`
        )
        expect(res.text).toContain(
          `referral number, check it's 8 characters long (2 letters, 4 numbers and then 2 letters)`
        )
      })
  })

  it('displays no records found when the search yields no results - empty search', async () => {
    const searchText = ''
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })

    await request(app)
      .post(`/service-provider/dashboard/unassigned-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('You have not entered any search terms')
        expect(res.text).toContain('referral number, for example KW5219ED')
        expect(res.text).toContain('first and last name of the person on probation, for example James Baker')
      })
  })

  it('stores dashboard link in cookies', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/unassigned-cases')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/unassigned-cases',
        })
      })
  })

  it('stores dashboard link in cookies with correct page number', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const prisonList = prisonFactory.build()
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/unassigned-cases?page=2')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/unassigned-cases?page=2',
        })
      })
  })
})

describe('GET /service-provider/dashboard/completed-cases', () => {
  it('displays a list of completed cases', async () => {
    const referrals = [
      sentReferralSummariesFactory.concluded().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/completed-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('My cases')
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation Services - West Midlands')
      })
  })

  it('displays a list of all completed cases when no search is present', async () => {
    const referrals = [
      sentReferralSummariesFactory.concluded().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
      sentReferralSummariesFactory.concluded().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'River',
        },
      }),
    ]

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .get('/service-provider/dashboard/completed-cases')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).toContain('George River')
      })
  })

  it('displays a list of completed cases with search text is not empty', async () => {
    const referrals = [
      sentReferralSummariesFactory.concluded().build({
        serviceUser: {
          firstName: 'Alex',
          lastName: 'River',
        },
      }),
    ]

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/completed-cases`)
      .send({ 'case-search-text': `Alex%20River` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
      })
  })

  it('displays no records found when the search yields no results', async () => {
    const searchText = 'nonsense'

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/completed-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('All open cases')
        expect(res.text).not.toContain('Alex River')
        expect(res.text).not.toContain('Accommodation Services - West Midlands')
        expect(res.text).not.toContain('George River')
        expect(res.text).toContain(`There are no results for "${searchText}" in completed cases`)
        expect(res.text).toContain(
          `person on probation, make sure you use their first and last name, for example James Baker`
        )
        expect(res.text).toContain(
          `referral number, check it's 8 characters long (2 letters, 4 numbers and then 2 letters)`
        )
      })
  })

  it('displays no records found when the search yields no results - empty search', async () => {
    const searchText = ''

    interventionsService.getSentReferralsForUserTokenPaged.mockImplementation(() => {
      return Promise.resolve(pageFactory.pageContent([]).build() as Page<SentReferralSummaries>)
    })
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())

    await request(app)
      .post(`/service-provider/dashboard/completed-cases`)
      .send({ 'case-search-text': `${searchText}` })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('You have not entered any search terms')
        expect(res.text).toContain('referral number, for example KW5219ED')
        expect(res.text).toContain('first and last name of the person on probation, for example James Baker')
      })
  })

  it('stores dashboard link in cookies', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/completed-cases')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/completed-cases',
        })
      })
  })

  it('stores dashboard link in cookies with correct page number', async () => {
    const referrals = [
      sentReferralSummariesFactory.assigned().build({
        serviceUser: {
          firstName: 'George',
          lastName: 'Michael',
        },
      }),
    ]
    const page = pageFactory.pageContent(referrals).build() as Page<SentReferralSummaries>

    interventionsService.getSentReferralsForUserTokenPaged.mockResolvedValue(page)

    await request(app)
      .get('/service-provider/dashboard/completed-cases?page=2')
      .expect(res => {
        const cookieVal = getCookieValue(res.get('Set-Cookie'))
        expect(cookieVal).toMatchObject({
          dashboardOriginPage: '/service-provider/dashboard/completed-cases?page=2',
        })
      })
  })
})

describe('GET /service-provider/referrals/:id/details', () => {
  const intervention = interventionFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
  const conviction = caseConvictionFactory.build({
    caseDetail: {
      contactDetails: {
        telephoneNumber: '07123456789',
      },
    },
  })
  const riskSummary: RiskSummary = riskSummaryFactory.build()
  let sentReferral: SentReferral
  let ramDeliusUser: RamDeliusUser
  let supplementaryRiskInformation: SupplementaryRiskInformation
  let responsibleOfficer: DeliusResponsibleOfficer
  let prisonList: Prison[]

  beforeEach(() => {
    sentReferral = sentReferralFactory.build()
    ramDeliusUser = ramDeliusUserFactory.build()

    supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
    responsibleOfficer = deliusResponsibleOfficerFactory.build()
    prisonList = prisonFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    ramDeliusApiService.getUserByUsername.mockResolvedValue(ramDeliusUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getConvictionByCrnAndId.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
  })

  it('displays information about the referral and service user for a community referral', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        personCurrentLocationType: CurrentLocationType.community,
        isReferralReleasingIn12Weeks: null,
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
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
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('072121212125')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
        expect(res.text).toContain('020343434565')
      })
  })

  it('displays information about the referral and service user for a custody referral', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        isReferralReleasingIn12Weeks: null,
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
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
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('London')
        expect(res.text).toContain(moment().add(1, 'days').format('D MMM YYYY'))
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('072121212125')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
        expect(res.text).toContain('020343434565')
      })
  })

  it('displays information about the referral and service user for an unallocated COM where release date is known', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        isReferralReleasingIn12Weeks: true,
        ppProbationOffice: null,
        ppEstablishment: 'aaa',
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
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
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('Main point of contact details (until probation practitioner is allocated)')
        expect(res.text).toContain('Role / job title')
        expect(res.text).toContain('Probabation Practitioner')
        expect(res.text).toContain('Establishment')
        expect(res.text).toContain('London')
        expect(res.text).toContain(moment().add(1, 'days').format('D MMM YYYY'))
        expect(res.text).toContain('Back up contact for the referral')
        expect(res.text).toContain('Referring officer')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
      })
  })

  it('displays information about the referral and service user for an unallocated COM where release date is not known', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        isReferralReleasingIn12Weeks: false,
        ppProbationOffice: 'London',
        ppEstablishment: null,
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
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
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Bob Alice')
        expect(res.text).toContain('Main point of contact details (until probation practitioner is allocated)')
        expect(res.text).toContain('Role / job title')
        expect(res.text).toContain('Probabation Practitioner')
        expect(res.text).toContain('Probation office')
        expect(res.text).toContain('London')
        expect(res.text).toContain('Back up contact for the referral')
        expect(res.text).toContain('Referring officer')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
      })
  })

  it('displays information about the referral and service user for an already existing custody referral', async () => {
    sentReferral = sentReferralFactory.unassigned().build({
      referral: {
        ndeliusPPName: null,
        ppName: null,
        isReferralReleasingIn12Weeks: null,
      },
    })
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
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
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    ramDeliusApiService.getResponsibleOfficer.mockResolvedValue(responsibleOfficer)
    prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
    prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
        expect(res.text).toContain('Peter Practitioner')
        expect(res.text).toContain('bobalice@example.com')
        expect(res.text).toContain('London')
        expect(res.text).toContain(moment().add(1, 'days').format('D MMM YYYY'))
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('98454243243')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain('Alex River&#39;s risk of serious harm (RoSH) levels')
        expect(res.text).toContain('Children')
        expect(res.text).toContain('High')
        expect(res.text).toContain('07890 123456')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      prisonApiService.getSecureChildrenAgencies.mockResolvedValue(secureChildAgency.build())
      prisonRegisterService.getPrisons.mockResolvedValue(prisonFactory.build())
      sentReferral = sentReferralFactory.assigned().build()
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())
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
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()

    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
    })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Session progress')
      })
  })
})

describe('GET /service-provider/referrals/:id/progress', () => {
  it('', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const appointment = actionPlanAppointmentFactory.attended('yes').build({
      sessionNumber: 1,
      appointmentTime: `Thu Jun 18 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      appointmentFeedback: {
        attendanceFeedback: {
          attended: 'yes',
        },
      },
    })

    const appointmentDuplicate3 = actionPlanAppointmentFactory.attended('yes').build({
      sessionNumber: 2,
      appointmentTime: `Thu Jun 19 2022 17:20`,
      durationInMinutes: 1,
      sessionType: 'ONE_TO_ONE',
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      appointmentFeedback: {
        attendanceFeedback: {
          attended: 'yes',
        },
      },
    })
    const approvedSummary = approvedActionPlanSummary.build()
    const approvedSummaries: ApprovedActionPlanSummary[] = [approvedSummary]
    const actionPlanAppointments: ActionPlanAppointment[] = [appointment, appointmentDuplicate3]
    const actionPlan = actionPlanFactory
      .notSubmitted()
      .build({ id: '77923562-755c-48d9-a74c-0c8565aac9a2', numberOfSessions: 2 })
    const referral = { interventionId: intervention.id, endOfServiceReport: false }
    const sentReferral = sentReferralFactory.assigned().build({
      referral,
      assignedTo: hmppsAuthUser,
      actionPlanId: actionPlan.id,
    })
    const supplierAssessment = supplierAssessmentFactory.justCreated.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])
    interventionsService.getActionPlanAppointments.mockResolvedValue([appointment, appointmentDuplicate3])
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedSummaries)
    interventionsService.getActionPlanAppointments.mockResolvedValue(actionPlanAppointments)

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('End of service report')
        expect(res.text).toContain('Not submitted')
      })
  })
})

describe('GET /service-provider/referrals/:id/progress', () => {
  it('displays information about the intervention progress with Action plan appointment not attended', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
      assignedTo: hmppsAuthUser,
      actionPlanId: actionPlan.id,
    })
    const appointment = actionPlanAppointmentFactory
      .attended('no')
      .scheduled()
      .build({
        appointmentTime: `${new Date().toDateString()} ${new Date().getHours()}:${new Date().getMinutes()}`,
        durationInMinutes: 1,
        sessionType: 'ONE_TO_ONE',
        appointmentDeliveryType: 'PHONE_CALL',
        appointmentDeliveryAddress: null,
      })
    const approvedSummary = approvedActionPlanSummary.build()
    const approvedSummaries: ApprovedActionPlanSummary[] = [approvedSummary]
    const actionPlanAppointments: ActionPlanAppointment[] = [appointment]

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedSummaries)
    interventionsService.getActionPlanAppointments.mockResolvedValue(actionPlanAppointments)
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getPrisonerDetails.mockResolvedValue(prisoner.build())

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Session progress')
        expect(res.text).toContain('Reschedule session')
        expect(res.text).not.toContain('Session 1 history')
      })
  })
})

describe('GET /service-provider/referrals/:id/progress', () => {
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
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Session progress')
        expect(res.text).toContain('Reschedule session')
        expect(res.text).toContain(`17 Jun 2022`)
        expect(res.text).toContain(`18 Jun 2022`)
        expect(res.text).toContain(`19 Jun 2022`)
        expect(res.text).toContain(`20 Jun 2022`)
        expect(res.text).toContain('did not attend')
        expect(res.text).toContain('scheduled')
      })
  })
  it('does not show session history drop down when no children available', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'caseWorkerFirstName',
      lastName: 'caseWorkerLastName',
    })
    const deliusServiceUser = deliusServiceUserFactory.build()
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
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedSummaries)
    interventionsService.getActionPlanAppointments.mockResolvedValue(actionPlanAppointments)
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).not.toContain('Session 1 history')
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
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
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
          expect(res.text).toContain('You have not assigned this referral to a caseworker.')
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
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
          expect(res.text).toContain('You have not assigned this referral to a caseworker.')
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
    const interventionForTest = interventionFactory.build({
      contractType: {
        code: 'ACC',
        name: 'Accommodation',
      },
    })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(interventionForTest)

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
      const interventionForTest = interventionFactory.build({
        contractType: {
          code: 'ACC',
          name: 'Accommodation',
        },
      })

      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
      interventionsService.getIntervention.mockResolvedValue(interventionForTest)

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
      const interventionForTest = interventionFactory.build({
        contractType: {
          code: 'ACC',
          name: 'Accommodation',
        },
      })

      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
      interventionsService.getIntervention.mockResolvedValue(interventionForTest)

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
    const interventionForTest = interventionFactory.build({
      contractType: {
        code: 'ACC',
        name: 'Accommodation',
      },
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(interventionForTest)

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

describe('POST /service-provider/action-plan/:actionPlanId/review', () => {
  beforeEach(() => {
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
    const interventionForTest = interventionFactory.build({
      contractType: {
        code: 'ACC',
        name: 'Accommodation',
      },
    })
    const submittedActionPlan = actionPlanFactory.submitted().build()
    interventionsService.submitActionPlan.mockResolvedValue(submittedActionPlan)
    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(interventionForTest)
  })

  it('does not submit action plan if supplier assessment appointment has not been scheduled', async () => {
    const submittedActionPlan = actionPlanFactory.submitted().build()
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
    await request(app).post(`/service-provider/action-plan/${submittedActionPlan.id}/review`).expect(200)
    expect(interventionsService.submitActionPlan).toHaveBeenCalledTimes(0)
  })

  it('does not submit action plan if supplier assessment appointment has been scheduled but not attended', async () => {
    const submittedActionPlan = actionPlanFactory.submitted().build()
    interventionsService.getSupplierAssessment.mockResolvedValue(
      supplierAssessmentFactory.withNonAttendedAppointment.build()
    )
    await request(app).post(`/service-provider/action-plan/${submittedActionPlan.id}/review`).expect(200)
    expect(interventionsService.submitActionPlan).toHaveBeenCalledTimes(0)
  })

  it('submits the action plan and redirects to the confirmation page if supplier assessment appointment has been attended', async () => {
    const submittedActionPlan = actionPlanFactory.submitted().build()
    interventionsService.getSupplierAssessment.mockResolvedValue(
      supplierAssessmentFactory.withAttendedAppointment.build()
    )
    await request(app)
      .post(`/service-provider/action-plan/${submittedActionPlan.id}/review`)
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
    const interventionForTest = interventionFactory.build({
      contractType: {
        code: 'ACC',
        name: 'Accommodation',
      },
    })

    interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getIntervention.mockResolvedValue(interventionForTest)

    await request(app)
      .get(`/service-provider/action-plan/${submittedActionPlan.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Action plan submitted')
      })
  })
})

describe('GET /service-provider/end-of-service-report/:id', () => {
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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

  it('throws an error if trying to view an in-progress end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
      },
    })
    const inProgressEndOfServiceReport = endOfServiceReportFactory.notSubmitted().build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(inProgressEndOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
    const intervention = interventionFactory.build({
      contractType: {
        code: 'ACC',
        name: 'Accommodation',
      },
    })
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
      .expect(200)
      .expect(res => {
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
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] },
            ],
            serviceCategoryIds: [serviceCategory.id],
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
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
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['2', '3', desiredOutcome.id] },
            ],
            serviceCategoryIds: [serviceCategory.id],
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
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
        const desiredOutcome = serviceCategory2.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: ['1', '2', '3'] },
              { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [desiredOutcome.id, '5'] },
            ],
            serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getServiceCategories.mockResolvedValue([serviceCategory1, serviceCategory2])
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
      const intervention = interventionFactory.build()
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
      interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

      await request(app)
        .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
        .type('form')
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select whether Alex River achieved the desired outcome')
        })

      expect(interventionsService.updateDraftEndOfServiceReport).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/further-information', () => {
  it('renders a form page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build()
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
    const intervention = interventionFactory.build()
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUser)

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
    const intervention = interventionFactory.build()
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
    interventionsService.getServiceCategories.mockResolvedValue([serviceCategory])

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('End of service report submitted')
      })
  })
})

describe('GET /service-provider/action-plan/:id', () => {
  it('returns details of the specified action plan', async () => {
    const referral = sentReferralFactory.assigned().build()
    const actionPlan = actionPlanFactory.approved().build({
      submittedAt: '2021-12-12T09:30:00+00:00',
    })
    const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation' })]

    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(deliusServiceUserFactory.build())

    await request(app)
      .get(`/service-provider/action-plan/${actionPlan.id}`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('View action plan')
        expect(res.text).toContain('Approved')
        expect(res.text).toContain('12 December 2021')
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
