import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'

let app: Express

describe('GET /intervention/:id/refer', () => {
  describe('as a probation practitioner', () => {
    beforeEach(() => {
      app = appWithAllRoutes({
        userType: AppSetupUserType.probationPractitioner,
      })
    })
    it('it provides instruction on how to report a problem', () => {
      return request(app)
        .get('/report-a-problem')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('To report a problem with this digital service, please email')
          expect(res.text).toContain('refer-and-monitor-feedback@digital.justice.gov.uk')
        })
    })
  })

  describe('as a serivce provider', () => {
    beforeEach(() => {
      app = appWithAllRoutes({
        userType: AppSetupUserType.serviceProvider,
      })
    })
    it('it provides instruction on how to report a problem', () => {
      return request(app)
        .get('/report-a-problem')
        .expect('Content-Type', /html/)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain(
            'To report a problem with this digital service, please contact your helpdesk who will contact the digital service team if necessary.'
          )
          expect(res.text).toContain('If your organisation does not have an IT helpdesk, please email')
          expect(res.text).toContain('refer-and-monitor-feedback@digital.justice.gov.uk')
        })
    })
  })
})
