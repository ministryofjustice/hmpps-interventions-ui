import express, { Express, RequestHandler } from 'express'
import request from 'supertest'
import auditedHandler, { auditEntityFromPath, defaultAuditAction, RouteAuditOptions } from './auditMiddleware'
import AuditService, { AuditAction } from '../services/auditService'
import AuditContext from '../utils/auditContext'

describe('auditEntityFromPath', () => {
  it.each([
    ['/referrals/:id/details', 'REFERRAL_DETAILS'],
    [
      '/referrals/:referralId/service-category/:serviceCategoryId/complexity-level',
      'REFERRAL_SERVICE_CATEGORY_COMPLEXITY_LEVEL',
    ],
    ['/case-note/:caseNoteId', 'CASE_NOTE'],
    ['/', 'HOME'],
  ])('derives an entity name from %s', (path, expected) => {
    expect(auditEntityFromPath(path)).toEqual(expected)
  })
})

describe('defaultAuditAction', () => {
  it.each([
    ['GET', '/referrals/:id/details', 'VIEW'],
    ['POST', '/referrals/:id/further-information', 'EDIT'],
    ['GET', '/referrals/:id/update-maximum-enforceable-days', 'EDIT'],
    ['GET', '/referrals/:referralId/:serviceCategoryId/update-desired-outcomes', 'EDIT'],
    ['POST', '/referrals/:referralId/update-additional-information', 'EDIT'],
    ['GET', '/referrals/:updateId/details', 'VIEW'],
  ] as const)('%s %s defaults to %s', (method, path, expected) => {
    expect(defaultAuditAction(method, path)).toEqual(expected)
  })
})

describe('auditedHandler', () => {
  let auditService: jest.Mocked<AuditService>

  const createApp = (
    method: 'GET' | 'POST',
    path: string,
    handler: RequestHandler,
    options?: RouteAuditOptions,
    username: string | null = 'user1'
  ): Express => {
    const app = express()
    app.set('auditService', auditService)
    app.use(express.urlencoded({ extended: true }))
    app.use((req, res, next) => {
      if (username) {
        req.user = { username } as unknown as Express.User
      }
      next()
    })
    const router = express.Router()
    const wrapped = auditedHandler(method, path, handler, options)
    if (method === 'GET') router.get(path, wrapped)
    else router.post(path, wrapped)
    app.use('/probation-practitioner', router)
    return app
  }

  const events = () => auditService.logInteraction.mock.calls

  beforeEach(() => {
    auditService = { logInteraction: jest.fn() } as unknown as jest.Mocked<AuditService>
  })

  it('sends VIEW attempt and success events naming the CRN of the data retrieved', async () => {
    const app = createApp('GET', '/referrals/:id/details', (req, res) => {
      AuditContext.recordSubjectsFrom({ serviceUser: { crn: 'X123456' } })
      res.send('ok')
    })

    await request(app).get('/probation-practitioner/referrals/abc/details').expect(200)

    expect(events()).toHaveLength(2)
    const [attempt, success] = events()
    expect(attempt.slice(0, 3)).toEqual(['VIEW', 'REFERRAL_DETAILS', 'ATTEMPT'])
    expect(attempt[3]).toMatchObject({
      who: 'user1',
      subjectId: 'NONE',
      subjectType: 'NOT_APPLICABLE',
      details: { route: '/probation-practitioner/referrals/:id/details', entityIds: { id: 'abc' } },
    })
    expect(success.slice(0, 3)).toEqual(['VIEW', 'REFERRAL_DETAILS', 'SUCCESS'])
    expect(success[3]).toMatchObject({ subjectId: 'X123456', subjectType: 'CRN' })
    expect(success[3].correlationId).toEqual(attempt[3].correlationId)
  })

  it('lists the CRNs when more than one person was retrieved', async () => {
    const app = createApp('GET', '/dashboard', (req, res) => {
      AuditContext.recordSubjectsFrom([{ crn: 'X1' }, { crn: 'X2' }])
      res.send('ok')
    })

    await request(app).get('/probation-practitioner/dashboard').expect(200)

    expect(events()[1][3]).toMatchObject({
      subjectId: 'NONE',
      subjectType: 'NOT_APPLICABLE',
      details: { returnedSubjectIds: ['X1', 'X2'] },
    })
  })

  it('sends EDIT events listing the submitted fields for POST requests', async () => {
    const app = createApp('POST', '/referrals/:id/further-information', (req, res) => res.redirect('/next'))

    await request(app)
      .post('/probation-practitioner/referrals/abc/further-information')
      .type('form')
      .send({ _csrf: 'token', 'further-information': 'some text' })
      .expect(302)

    expect(events()[1].slice(0, 3)).toEqual(['EDIT', 'REFERRAL_FURTHER_INFORMATION', 'SUCCESS'])
    expect(events()[1][3].details).toMatchObject({ changes: [{ field: 'further-information' }] })
  })

  it('sends EDIT events for GET routes with "update" in the path', async () => {
    const app = createApp('GET', '/referrals/:id/update-probation-practitioner-name', (req, res) => res.send('ok'))

    await request(app).get('/probation-practitioner/referrals/abc/update-probation-practitioner-name').expect(200)

    expect(events()[1].slice(0, 3)).toEqual(['EDIT', 'REFERRAL_UPDATE_PROBATION_PRACTITIONER_NAME', 'SUCCESS'])
  })

  it('uses the search term as the subject for SEARCH routes', async () => {
    const app = createApp(
      'POST',
      '/dashboard/all-open-cases',
      (req, res) => {
        AuditContext.recordSubjectsFrom({ content: [{ referenceNumber: 'AB1234CD' }, { referenceNumber: 'EF5678GH' }] })
        res.send('ok')
      },
      { action: AuditAction.SEARCH, searchTermField: 'case-search-text' }
    )

    await request(app)
      .post('/probation-practitioner/dashboard/all-open-cases')
      .type('form')
      .send({ 'case-search-text': ' Alex River ' })
      .expect(200)

    expect(events()[1].slice(0, 3)).toEqual(['SEARCH', 'DASHBOARD_ALL_OPEN_CASES', 'SUCCESS'])
    expect(events()[1][3]).toMatchObject({ subjectId: 'Alex River', subjectType: 'SEARCH_TERM' })
    expect(events()[1][3].details).not.toHaveProperty('changes')
    expect(events()[1][3].details).not.toHaveProperty('results')

    expect(events()).toHaveLength(3)
    expect(events()[2].slice(0, 3)).toEqual(['VIEW', 'DASHBOARD_ALL_OPEN_CASES_SEARCH_RESULTS', 'SUCCESS'])
    expect(events()[2][3]).toMatchObject({
      subjectId: 'Alex River',
      subjectType: 'SEARCH_TERM',
      correlationId: events()[0][3].correlationId,
      details: { results: { resultCount: 2, returnedSubjectIds: ['AB1234CD', 'EF5678GH'] } },
    })
  })

  it('does not send a search results event when the search fails', async () => {
    const app = createApp('POST', '/dashboard/all-open-cases', (req, res) => res.status(500).send('error'), {
      action: AuditAction.SEARCH,
      searchTermField: 'case-search-text',
    })

    await request(app)
      .post('/probation-practitioner/dashboard/all-open-cases')
      .type('form')
      .send({ 'case-search-text': 'Alex River' })
      .expect(500)

    expect(events()).toHaveLength(2)
    expect(events()[1].slice(0, 3)).toEqual(['SEARCH', 'DASHBOARD_ALL_OPEN_CASES', 'FAILURE'])
  })

  it('sends a FAILURE event when the response is an error', async () => {
    const app = createApp('POST', '/referrals/:id/further-information', (req, res) => {
      res.status(400).send('invalid')
    })

    await request(app).post('/probation-practitioner/referrals/abc/further-information').expect(400)

    expect(events()[1].slice(0, 3)).toEqual(['EDIT', 'REFERRAL_FURTHER_INFORMATION', 'FAILURE'])
    expect(events()[1][3].details).toMatchObject({ failureReason: 'HTTP 400' })
  })

  it('sends a FAILURE event and rethrows when the handler throws', async () => {
    const app = createApp('GET', '/referrals/:id/details', async () => {
      throw new Error('downstream failure')
    })

    await request(app).get('/probation-practitioner/referrals/abc/details').expect(500)

    expect(events()[1].slice(0, 3)).toEqual(['VIEW', 'REFERRAL_DETAILS', 'FAILURE'])
    expect(events()[1][3].details).toMatchObject({ failureReason: 'downstream failure' })
  })

  it('does not audit unauthenticated requests', async () => {
    const app = createApp('GET', '/referrals/:id/details', (req, res) => res.send('ok'), undefined, null)

    await request(app).get('/probation-practitioner/referrals/abc/details').expect(200)

    expect(events()).toHaveLength(0)
  })
})
