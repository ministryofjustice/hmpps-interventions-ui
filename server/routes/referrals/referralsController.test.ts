import request from 'supertest'
import { Express } from 'express'
import InterventionsService from '../../services/interventionsService'
import appWithAllRoutes from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import apiConfig from '../../config'

jest.mock('../../services/interventionsService')

const interventionsService = new InterventionsService(apiConfig.apis.hmppsAuth) as jest.Mocked<InterventionsService>

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
  beforeEach(() => {
    interventionsService.getDraftReferralsForUser.mockResolvedValue([])
  })

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
    it('updates the referral on the backend and redirects to the next question if the API call succeeds', async () => {
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
        .expect('Location', '/referrals/1/rar-days')

      expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15' },
      ])
    })

    it('updates the referral on the backend and returns a 400, rendering the question page with an error message, if the API call fails with a validation error', async () => {
      interventionsService.patchDraftReferral.mockRejectedValue({
        validationErrors: [{ field: 'completionDeadline', error: 'DATE_MUST_BE_IN_THE_FUTURE' }],
      })

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('What date does the accommodation service need to be completed by?')
          expect(res.text).toContain('The date by which the service needs to be completed must be in the future')
        })

      expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15' },
      ])
    })

    it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
      interventionsService.patchDraftReferral.mockRejectedValue({
        message: 'Some backend error message',
      })

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Some backend error message')
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

  it('renders an error when the request for a service category fails', async () => {
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

  it('updates the referral on the backend and redirects to the next question', async () => {
    await request(app)
      .post('/referrals/1/complexity-level')
      .type('form')
      .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
      .expect(302)
      .expect('Location', '/referrals/1/completion-deadline')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
    ])
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/complexity-level')
      .type('form')
      .send({ 'complexity-level-id': 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
    ])
  })
})

describe('GET /referrals/:id/further-information', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/further-information')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Do you have further information for the accommodation service provider? (optional)')
      })
  })
})

describe('POST /referrals/:id/further-information', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build()
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
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

describe('GET /referrals/:id/desired-outcomes', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({
      id: 'b33c19d1-7414-4014-b543-e543e59c5b39',
      name: 'social inclusion',
    })
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/desired-outcomes')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What are the desired outcomes for the social inclusion service?')
      })

    expect(interventionsService.getServiceCategory.mock.calls[0]).toEqual([
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39',
    ])
  })

  it('renders an error when the request for a service category fails', async () => {
    interventionsService.getServiceCategory.mockRejectedValue(new Error('Failed to get service category'))

    await request(app)
      .get('/referrals/1/desired-outcomes')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get service category')
      })
  })
})

describe('POST /referrals/:id/desired-outcomes', () => {
  const desiredOutcomes = [
    {
      id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
      description:
        'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
    },
    {
      id: '65924ac6-9724-455b-ad30-906936291421',
      description: 'Service User makes progress in obtaining accommodation',
    },
    {
      id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
      description: 'Service User is helped to secure social or supported housing',
    },
    {
      id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
      description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
    },
  ]

  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ desiredOutcomes, name: 'social inclusion' })
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('updates the referral on the backend and redirects to the next question', async () => {
    await request(app)
      .post('/referrals/1/desired-outcomes')
      .type('form')
      .send({ 'desired-outcomes-ids': [desiredOutcomes[0].id, desiredOutcomes[1].id] })
      .expect(302)
      .expect('Location', '/referrals/1/complexity-level')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id] },
    ])
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/desired-outcomes')
      .type('form')
      .send({ 'desired-outcomes-ids': [desiredOutcomes[0].id, desiredOutcomes[1].id] })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      { desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id] },
    ])
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

  it('updates the referral on the backend and redirects to the referral form', async () => {
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

describe('GET /referrals/:id/risk-information', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/risk-information')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Geoffrey’s risk information')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
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
})

describe('POST /referrals/:id/risk-information', () => {
  beforeEach(() => {
    const referral = draftReferralFactory.serviceUserSelected().build({ serviceUser: { firstName: 'Geoffrey' } })

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

describe('GET /referrals/:id/rar-days', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/rar-days')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Are you using RAR days for the accommodation service?')
      })

    expect(interventionsService.getDraftReferral.mock.calls[0]).toEqual(['token', '1'])
  })

  it('renders an error when the get referral call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get draft referral'))

    await request(app)
      .get('/referrals/1/rar-days')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get draft referral')
      })
  })

  it('renders an error when the service category call fails', async () => {
    interventionsService.getDraftReferral.mockRejectedValue(new Error('Failed to get service category'))

    await request(app)
      .get('/referrals/1/rar-days')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Failed to get service category')
      })
  })
})

describe('POST /referrals/:id/rar-days', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('updates the referral on the backend and redirects to the next question', async () => {
    const updatedReferral = draftReferralFactory.serviceUserSelected().build({
      usingRarDays: true,
      maximumRarDays: 10,
    })

    interventionsService.patchDraftReferral.mockResolvedValue(updatedReferral)

    await request(app)
      .post('/referrals/1/rar-days')
      .type('form')
      .send({
        'using-rar-days': 'yes',
        'maximum-rar-days': '10',
      })
      .expect(302)
      .expect('Location', '/referrals/1/further-information')

    expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
      'token',
      '1',
      {
        usingRarDays: true,
        maximumRarDays: 10,
      },
    ])
  })

  describe('when the user enters invalid data', () => {
    it('does not update the referral on the backend and returns a 400 with an error message', async () => {
      await request(app)
        .post('/referrals/1/rar-days')
        .type('form')
        .send({
          'using-rar-days': 'yes',
          'maximum-rar-days': '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter the maximum number of RAR days for the accommodation service')
        })

      expect(interventionsService.patchDraftReferral).not.toHaveBeenCalled()
    })
  })

  it('updates the referral on the backend and returns a 500 if the API call fails with a non-validation error', async () => {
    interventionsService.patchDraftReferral.mockRejectedValue({
      message: 'Some backend error message',
    })

    await request(app)
      .post('/referrals/1/rar-days')
      .type('form')
      .send({
        'using-rar-days': 'yes',
        'maximum-rar-days': '10',
      })
      .expect(500)
      .expect(res => {
        expect(res.text).toContain('Some backend error message')
      })
  })
})

describe('GET /referrals/:id/check-answers', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = draftReferralFactory
      .serviceCategorySelected(serviceCategory.id)
      .build({ serviceUser: { firstName: 'Johnny' } })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
  })

  it('displays a summary of the draft referral', async () => {
    await request(app)
      .get('/referrals/1/check-answers')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Johnny')
        expect(res.text).toContain('Information for the accommodation referral')
      })
  })

  describe('when an API call returns an error', () => {
    it('returns a 500 and displays an error message', async () => {
      interventionsService.getDraftReferral.mockRejectedValue(new Error('Backend error message'))

      await request(app)
        .get('/referrals/1/check-answers')
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
