import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import appWithAllRoutes from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

jest.mock('../../services/interventionsService')

const interventionsService = new InterventionsService(null) as jest.Mocked<InterventionsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ overrides: { interventionsService } })

  const referral = draftReferralFactory.justCreated().build({ id: '1' })
  interventionsService.createDraftReferral.mockResolvedValue(referral)
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
    const referral = draftReferralFactory.justCreated().build({ id: '1' })
    interventionsService.getDraftReferral.mockResolvedValue(referral)
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

describe('GET /referrals/:id/completion-deadline', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/completion-deadline')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What date does the accommodation service need to be completed by?')
      })
  })
  // TODO how do we (or indeed, do we) test what happens when the request has a completion deadline - i.e. that the
  // day/month/year fields are correctly populated? Do we just do it as a presenter test?
})

describe('POST /referrals/:id/completion-deadline', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  describe('when the user inputs a valid date', () => {
    it('updates the referral on the backend and redirects to the referral form if the API call succeeds', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = draftReferralFactory
        .serviceCategorySelected(serviceCategory.id)
        .build({ completionDeadline: '2021-09-15' })

      interventionsService.patchDraftReferral.mockResolvedValue(referral)

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(302)
        .expect('Location', '/referrals/1/form')

      expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15' },
      ])
    })

    it('updates the referral on the backend and returns a 400 with an error message if the API call fails', async () => {
      interventionsService.patchDraftReferral.mockRejectedValue(new Error('Backend error message'))

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Backend error message')
        })

      expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15' },
      ])
    })
  })

  describe('when the user inputs an invalid date', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
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

describe('GET /referrals/:id/complexity-level', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ id: 'b33c19d1-7414-4014-b543-e543e59c5b39' })
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/complexity-level')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What is the complexity level for the accommodation service?')
      })

    expect(interventionsService.getServiceCategory.mock.calls[0]).toEqual([
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39',
    ])
  })

  it('renders an error when the get complexity levels call fails', async () => {
    interventionsService.getServiceCategory.mockRejectedValue(new Error('Failed to get service category'))

    await request(app)
      .get('/referrals/1/complexity-level')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get service category')
      })
  })
})

describe('POST /referrals/:id/complexity-level', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('updates the referral on the backend and redirects to the referral form', async () => {
    await request(app)
      .post('/referrals/1/complexity-level')
      .type('form')
      .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
      .expect(302)
      .expect('Location', '/referrals/1/form')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
    ])
  })

  it('updates the referral on the backend and returns a 400 with an error message if the API call fails', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue(new Error('Backend error message'))

    await request(app)
      .post('/referrals/1/complexity-level')
      .type('form')
      .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
      .expect(400)
      .expect(res => {
        expect(res.text).toContain('Backend error message')
      })

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
    ])
  })
})
