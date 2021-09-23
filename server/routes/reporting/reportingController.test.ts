import request from 'supertest'
import { Express } from 'express'
import CalendarDay from '../../utils/calendarDay'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /service-provider/performance-report', () => {
  it('displays a page to allow the Service Provider to download a report of referral data', async () => {
    await request(app)
      .get('/service-provider/performance-report')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Reporting')
      })
  })
})

describe('POST /service-provider/performance-report', () => {
  it('makes a request to the interventions service to generate referral data and redirects to the confirmation page', async () => {
    interventionsService.generateServiceProviderPerformanceReport.mockResolvedValue()
    await request(app)
      .post('/service-provider/performance-report')
      .type('form')
      .send({
        'from-date-day': '20',
        'from-date-month': '06',
        'from-date-year': '2021',
        'to-date-day': '25',
        'to-date-month': '06',
        'to-date-year': '2021',
      })
      .expect(302)
      .expect('Location', '/service-provider/performance-report/confirmation')

    expect(interventionsService.generateServiceProviderPerformanceReport).toHaveBeenCalledWith('token', {
      fromIncludingDate: CalendarDay.fromComponents(20, 6, 2021),
      toIncludingDate: CalendarDay.fromComponents(25, 6, 2021),
    })
  })
})

describe('GET /service-provider/performance-report/confirmation', () => {
  it('renders a confirmation page', async () => {
    await request(app)
      .get('/service-provider/performance-report/confirmation')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Your request has been submitted')
      })
  })
})
