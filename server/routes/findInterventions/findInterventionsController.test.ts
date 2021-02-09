import { Express } from 'express'
import request from 'supertest'
import FindInterventionsController from './findInterventionsController'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import interventionFactory from '../../../testutils/factories/intervention'

jest.mock('../../services/interventionsService')
const interventionsService = new InterventionsService(apiConfig.apis.interventionsService) as jest.Mocked<
  InterventionsService
>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    userType: AppSetupUserType.serviceProvider,
    overrides: { interventionsService },
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe(FindInterventionsController, () => {
  describe('GET /find-interventions', () => {
    it('responds with a 200', async () => {
      const interventions = [
        { title: 'Better solutions (anger management)', categoryName: 'thinking and behaviour' },
        { title: 'HELP (domestic violence for males)', categoryName: 'relationships' },
      ].map(params => {
        return interventionFactory.build({ title: params.title, serviceCategory: { name: params.categoryName } })
      })
      interventionsService.getInterventions.mockResolvedValue(interventions)

      await request(app)
        .get('/find-interventions')
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Find interventions')

          expect(res.text).toContain('Better solutions (anger management)')
          expect(res.text).toContain('Thinking and behaviour')

          expect(res.text).toContain('HELP (domestic violence for males)')
          expect(res.text).toContain('Relationships')
        })
    })
  })
})
