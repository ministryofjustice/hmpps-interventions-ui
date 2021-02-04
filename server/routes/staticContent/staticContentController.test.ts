import request from 'supertest'
import { Express } from 'express'
import StaticContentController from './staticContentController'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'

describe(StaticContentController, () => {
  let app: Express

  beforeEach(() => {
    app = appWithAllRoutes({
      userType: AppSetupUserType.probationPractitioner,
    })
  })

  describe('GET /static-pages', () => {
    it('responds with a 200', async () => {
      await request(app).get('/static-pages').expect(200)
    })
  })

  describe.each(StaticContentController.allPaths)('GET %s', path => {
    it('responds with a 200', async () => {
      await request(app).get(path).expect(200)
    })
  })
})
