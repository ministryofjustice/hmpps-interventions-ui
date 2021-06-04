import { Express } from 'express'
import request from 'supertest'
import FindInterventionsController from './findInterventionsController'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import interventionFactory from '../../../testutils/factories/intervention'
import pccRegionFactory from '../../../testutils/factories/pccRegion'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

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
        return interventionFactory.build({
          title: params.title,
          serviceCategories: [serviceCategoryFactory.build({ name: params.categoryName })],
        })
      })
      interventionsService.getInterventions.mockResolvedValue(interventions)

      interventionsService.getPccRegions.mockResolvedValue([])

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

    it('accepts filter params and makes a filtered request to the API', async () => {
      interventionsService.getInterventions.mockResolvedValue([])
      const pccRegions = [pccRegionFactory.build({ name: 'Cheshire' }), pccRegionFactory.build({ name: 'Cumbria' })]
      interventionsService.getPccRegions.mockResolvedValue(pccRegions)

      await request(app)
        .get(
          `/find-interventions?pcc-region-ids[]=${pccRegions[0].id}&pcc-region-ids[]=${pccRegions[1].id}&age[]=18-to-25-only&gender[]=male`
        )
        .expect(200)

      expect(interventionsService.getInterventions.mock.calls[0][1]).toEqual({
        allowsMale: true,
        maximumAge: 25,
        pccRegionIds: ['1', '2'],
      })
    })
  })

  describe('GET /find-interventions/intervention/:id', () => {
    it('responds with a 200', async () => {
      const intervention = interventionFactory.build({
        title: 'Better solutions (anger management)',
        serviceCategories: [serviceCategoryFactory.build({ name: 'thinking and behaviour' })],
      })

      interventionsService.getIntervention.mockResolvedValue(intervention)

      await request(app)
        .get(`/find-interventions/intervention/${intervention.id}`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Better solutions (anger management)')
          expect(res.text).toContain('Thinking and behaviour')
        })
    })
  })
})
