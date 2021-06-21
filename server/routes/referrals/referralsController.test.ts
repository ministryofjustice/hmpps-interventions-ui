import request from 'supertest'
import { Express } from 'express'
import createError from 'http-errors'
import InterventionsService from '../../services/interventionsService'
import ServiceUser from '../../models/serviceUser'
import CommunityApiService from '../../services/communityApiService'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import apiConfig from '../../config'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import interventionFactory from '../../../testutils/factories/intervention'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/assessRisksAndNeedsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>
const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

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
    overrides: { interventionsService, communityApiService, assessRisksAndNeedsService },
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
        expect(res.text).toContain("Enter the service user's case identifier")
      })
  })
})

describe('POST /intervention/:id/refer', () => {
  describe('when searching for a CRN found in Delius and an intervention has been selected', () => {
    beforeEach(() => {
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
    })

    it('creates a referral on the interventions service and redirects to the referral form', async () => {
      const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
      const serviceUserCRN = 'X123456'

      await request(app)
        .post(`/intervention/${interventionId}/refer`)
        .send({ 'service-user-crn': serviceUserCRN })
        .expect(303)
        .expect('Location', '/referrals/1/form')

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
    describe('having leading and trailing whitespace', () => {
      it('trims any leading and trailing whitespace', async () => {
        const interventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'
        const serviceUserCRN = ' X123456 '
        const serviceUserCRNTrimmed = 'X123456'

        await request(app)
          .post(`/intervention/${interventionId}/refer`)
          .send({ 'service-user-crn': serviceUserCRN })
          .expect(303)
          .expect('Location', '/referrals/1/form')

        expect(communityApiService.getServiceUserByCRN).toHaveBeenCalledWith(serviceUserCRNTrimmed)
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
          .expect(303)
          .expect('Location', '/referrals/1/form')

        expect(communityApiService.getServiceUserByCRN).toHaveBeenCalledWith(serviceUserCRNTransformed)
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

      expect(communityApiService.getServiceUserByCRN).toHaveBeenCalledTimes(0)
    })
  })

  describe('when there is an issue with the crn', () => {
    beforeEach(() => {
      communityApiService.getServiceUserByCRN.mockRejectedValue({ status: 404 })
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

      expect(communityApiService.getServiceUserByCRN).toHaveBeenCalledTimes(1)
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
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
  })

  it('renders a service user details page', async () => {
    await request(app)
      .get('/referrals/1/service-user-details')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(`Alex&#39;s information`)
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
    const riskSummary = riskSummaryFactory.build()

    assessRisksAndNeedsService.getRiskSummaryScores.mockResolvedValue(riskSummary)
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
    const riskSummary = riskSummaryFactory.build()

    assessRisksAndNeedsService.getRiskSummaryScores.mockResolvedValue(riskSummary)
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

describe('GET /referrals/:id/completion-deadline', () => {
  beforeEach(() => {
    const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
    const referral = draftReferralFactory.build()

    interventionsService.getDraftReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/completion-deadline')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What date does the Women&#39;s service referral need to be completed by?')
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
      const referral = draftReferralFactory.build({ completionDeadline: '2021-09-15' })

      interventionsService.patchDraftReferral.mockResolvedValue(referral)

      await request(app)
        .post('/referrals/1/completion-deadline')
        .type('form')
        .send({ 'completion-deadline-day': '15', 'completion-deadline-month': '9', 'completion-deadline-year': '2021' })
        .expect(302)
        .expect('Location', '/referrals/1/enforceable-days')

      expect(interventionsService.patchDraftReferral.mock.calls[0]).toEqual([
        'token',
        '1',
        { completionDeadline: '2021-09-15' },
      ])
    })

    it('updates the referral on the backend and returns a 400, rendering the question page with an error message, if the API call fails with a validation error', async () => {
      interventionsService.patchDraftReferral.mockRejectedValue(
        createError(400, 'bad request', {
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
          expect(res.text).toContain('What date does the Women&#39;s service referral need to be completed by?')
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
    interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/complexity-level')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What is the complexity level for the Social inclusion service?')
      })

    expect(interventionsService.getServiceCategory).toHaveBeenCalledWith(
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39'
    )
  })

  it('renders an error when the request for a service category fails', async () => {
    interventionsService.getServiceCategory.mockRejectedValue(new Error('Failed to get service category'))

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
        .expect('Location', '/referrals/1/completion-deadline')

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
        .expect('Location', '/referrals/1/completion-deadline')

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
    communityApiService.getActiveConvictionsByCRN.mockResolvedValue(deliusConvictionFactory.buildList(2))
  })

  it('renders a form page and fetches a conviction from the Community API', async () => {
    await request(app)
      .get('/referrals/1/relevant-sentence')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Select the relevant sentence for the Accommodation referral')
      })

    expect(communityApiService.getActiveConvictionsByCRN).toHaveBeenCalledWith(serviceUserCRN)
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
    communityApiService.getActiveConvictionsByCRN.mockResolvedValue([])

    await request(app)
      .get('/referrals/1/relevant-sentence')
      .expect(500)
      .expect(res => {
        expect(res.text).toContain(`No active convictions found for service user ${serviceUserCRN}`)
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
    interventionsService.getServiceCategory.mockResolvedValue(socialInclusionServiceCategory)
  })

  it('renders a form page', async () => {
    await request(app)
      .get('/referrals/1/service-category/b33c19d1-7414-4014-b543-e543e59c5b39/desired-outcomes')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('What are the desired outcomes for the Social inclusion service?')
      })

    expect(interventionsService.getServiceCategory.mock.calls[0]).toEqual([
      'token',
      'b33c19d1-7414-4014-b543-e543e59c5b39',
    ])
  })

  it('renders an error when the request for a service category fails', async () => {
    interventionsService.getServiceCategory.mockRejectedValue(new Error('Failed to get service category'))

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
        expect(res.text).toContain('How many enforceable days will you use for this service?')
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
      .expect('Location', '/referrals/1/further-information')

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
          expect(res.text).toContain('How many enforceable days will you use for this service?')
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

describe('GET /referrals/:id/check-answers', () => {
  beforeEach(() => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = draftReferralFactory
      .serviceCategorySelected(serviceCategory.id)
      .completionDeadlineSet()
      .build({ serviceUser: { firstName: 'Johnny', religionOrBelief: 'Agnostic' }, relevantSentenceId: 123 })
    const conviction = deliusConvictionFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getDraftReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser.build())
    communityApiService.getConvictionById.mockResolvedValue(conviction)
  })

  it('displays a summary of the draft referral', async () => {
    await request(app)
      .get('/referrals/1/check-answers')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Check your answers')
        expect(res.text).toContain('Johnny’s personal details')
        expect(res.text).toContain('Agnostic')
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
