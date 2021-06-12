import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from './routes/testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({ userType: AppSetupUserType.probationPractitioner })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('not found errors', () => {
  it('should render 404 page', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
        expect(res.text).toContain(' If you typed the web address, check it is correct.')
        expect(res.text).toContain('If you pasted the web address, check you copied the entire address.')
      })
  })
})
