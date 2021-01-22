import request from 'supertest'
import appWithAllRoutes, { AppSetupUserType } from './testutils/appSetup'

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  describe('when logged in as a probation practitioner', () => {
    it('redirects to the referral start page', () => {
      const app = appWithAllRoutes({ userType: AppSetupUserType.probationPractitioner })
      return request(app).get('/').expect(302).expect('Location', '/referrals/start')
    })
  })

  describe('when logged in as a service provider', () => {
    it('redirects to the service provider dashboard', () => {
      const app = appWithAllRoutes({ userType: AppSetupUserType.serviceProvider })
      return request(app).get('/').expect(302).expect('Location', '/service-provider/dashboard')
    })
  })
})
