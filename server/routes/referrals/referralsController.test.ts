import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import appWithAllRoutes from '../testutils/appSetup'

jest.mock('../../services/interventionsService')

const interventionsService = new InterventionsService(null) as jest.Mocked<InterventionsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ overrides: { interventionsService } })

  interventionsService.createDraftReferral.mockResolvedValue({
    id: '1',
    completionDeadline: null,
    serviceCategory: null,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referrals/start', () => {
  it('renders a start page', () => {
    return request(app)
      .get('/referrals/start')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('You can make a new referral here')
      })
  })
})

describe('POST /referrals', () => {
  it('creates a referral on the interventions service and redirects to the referral form', async () => {
    await request(app).post('/referrals').expect(303).expect('Location', '/referrals/1/form')

    expect(interventionsService.createDraftReferral).toHaveBeenCalledTimes(1)
  })

  describe('when the interventions service returns an error', () => {
    beforeEach(() => {
      interventionsService.createDraftReferral.mockRejectedValue(new Error('Failed to create intervention'))
    })

    it('displays an error page', async () => {
      await request(app)
        .post('/referrals')
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Failed to create intervention')
        })

      expect(interventionsService.createDraftReferral).toHaveBeenCalledTimes(1)
    })
  })
})

describe('GET /referrals/:id/form', () => {
  beforeEach(() => {
    interventionsService.getDraftReferral.mockResolvedValue({
      id: '1',
      completionDeadline: null,
      serviceCategory: null,
    })
  })

  it('fetches the referral from the interventions service and renders a page with information about the referral', async () => {
    await request(app)
      .get('/referrals/1/form')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Viewing referral with ID 1')
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
})
