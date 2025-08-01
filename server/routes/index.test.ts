import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from './testutils/appSetup'

jest.mock('crypto', () => ({
  randomBytes: () => 'mocked',
}))

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  describe('when logged in as a probation practitioner', () => {
    it('redirects to the referral start page', () => {
      const app = appWithAllRoutes({ userType: AppSetupUserType.probationPractitioner })
      return request(app).get('/').expect(302).expect('Location', '/crs-homepage')
    })
  })

  describe('when logged in as a service provider', () => {
    it('redirects to the service provider dashboard', () => {
      const app = appWithAllRoutes({ userType: AppSetupUserType.serviceProvider })
      return request(app).get('/').expect(302).expect('Location', '/service-provider/dashboard')
    })
  })
})

describe('check response headers are set correctly', () => {
  let app: Express
  beforeEach(() => {
    app = appWithAllRoutes({ userType: AppSetupUserType.probationPractitioner })
  })

  it('should have expected headers', async () => {
    const response = await request(app).get('/')
    expect(response.header).toMatchObject({
      connection: 'close',
      'content-length': '35',
      'content-security-policy': expect.any(String),
      'content-type': 'text/plain; charset=utf-8',
      date: expect.any(String),
      location: '/crs-homepage',
      'referrer-policy': 'no-referrer',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      vary: 'Accept',
      'x-content-type-options': 'nosniff',
      'x-dns-prefetch-control': 'off',
      'x-download-options': 'noopen',
      'x-frame-options': 'SAMEORIGIN',
      'x-permitted-cross-domain-policies': 'none',
      'x-xss-protection': '0',
    })
  })

  it('should set content-security-policy correctly', async () => {
    const { header } = await request(app).get('/')
    const contentSecurityPolicy = header['content-security-policy'].split(';')
    expect(contentSecurityPolicy).toMatchInlineSnapshot(`
      Array [
        "default-src 'self'",
        "script-src 'self' code.jquery.com 'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU=' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com/ 'nonce-mocked'",
        "style-src 'self' code.jquery.com",
        "font-src 'self'",
        "img-src 'self' https://www.google-analytics.com",
        "connect-src 'self' https://www.google-analytics.com *.google-analytics.com *.analytics.google.com *.applicationinsights.azure.com",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "object-src 'none'",
        "script-src-attr 'none'",
        "upgrade-insecure-requests",
      ]
    `)
  })
})
