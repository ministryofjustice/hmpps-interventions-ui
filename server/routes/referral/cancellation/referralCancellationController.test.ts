import request from 'supertest'
import { Express } from 'express'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import interventionFactory from '../../../../testutils/factories/intervention'
import deliusServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'
import draftCancellationDataFactory from '../../../../testutils/factories/draftCancellationData'
import { createDraftFactory } from '../../../../testutils/factories/draft'
import InterventionsService from '../../../services/interventionsService'
import apiConfig from '../../../config'
import MockCommunityApiService from '../../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../../services/communityApiService'
import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../../services/hmppsAuthService'
import MockAssessRisksAndNeedsService from '../../testutils/mocks/mockAssessRisksAndNeedsService'
import AssessRisksAndNeedsService from '../../../services/assessRisksAndNeedsService'
import DraftsService from '../../../services/draftsService'
import appWithAllRoutes, { AppSetupUserType } from '../../testutils/appSetup'

jest.mock('../../../services/interventionsService')
jest.mock('../../../services/communityApiService')
jest.mock('../../../services/assessRisksAndNeedsService')
jest.mock('../../../services/draftsService')

const draftCancellationFactory = createDraftFactory(draftCancellationDataFactory.build())

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      communityApiService,
      hmppsAuthService,
      assessRisksAndNeedsService,
      draftsService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/referrals/:id/cancellation/start', () => {
  it('creates a draft cancellation using the drafts service and redirects to the reason page', async () => {
    const draftCancellation = draftCancellationFactory.build()
    draftsService.createDraft.mockResolvedValue(draftCancellation)

    await request(app)
      .get(`/probation-practitioner/referrals/123/cancellation/start`)
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/123/cancellation/${draftCancellation.id}/reason`)

    expect(draftsService.createDraft).toHaveBeenCalledWith(
      'cancellation',
      {
        cancellationReason: null,
        cancellationComments: null,
      },
      { userId: '123' }
    )
  })
})

describe('GET /probation-practitioner/referrals/:id/cancellation/:draftCancellationId/reason', () => {
  it('renders a page where the PP can add comments and cancel a referral', async () => {
    const draftCancellation = draftCancellationFactory.build()
    draftsService.fetchDraft.mockResolvedValue(draftCancellation)

    const referral = sentReferralFactory.assigned().build()
    const intervention = interventionFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getReferralCancellationReasons.mockResolvedValue([
      { code: 'MIS', description: 'Referral was made by mistake' },
      { code: 'MOV', description: 'Service user has moved out of delivery area' },
    ])

    await request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/reason`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Referral cancellation')
        expect(res.text).toContain('What is the reason for the cancellation of this referral?')
        expect(res.text).toContain('Referral was made by mistake')
        expect(res.text).toContain('Service user has moved out of delivery area')
        expect(res.text).toContain('Additional comments (optional)')
      })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .get(`/probation-practitioner/referrals/abc/cancellation/def/reason`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.'
          )
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/cancellation/:draftCancellationId/reason', () => {
  it('updates the draft cancellation using the drafts service and redirects to the check your answers page', async () => {
    const draftCancellation = draftCancellationFactory.build({
      data: { cancellationReason: null, cancellationComments: null },
    })
    draftsService.fetchDraft.mockResolvedValue(draftCancellation)

    const referral = sentReferralFactory.assigned().build()

    await request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/reason`)
      .type('form')
      .send({ 'cancellation-reason': 'MOV', 'cancellation-comments': 'Alex has moved out of the area' })
      .expect(302)
      .expect(
        'Location',
        `/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/check-your-answers`
      )

    expect(draftsService.updateDraft).toHaveBeenCalledWith(
      draftCancellation.id,
      {
        cancellationReason: 'MOV',
        cancellationComments: 'Alex has moved out of the area',
      },
      { userId: '123' }
    )
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .post(`/probation-practitioner/referrals/abc/cancellation/def/reason`)
        .type('form')
        .send({ 'cancellation-reason': 'MOV', 'cancellation-comments': 'Alex has moved out of the area' })
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.'
          )
        })
    })
  })

  describe('with invalid data', () => {
    it('renders an error message', async () => {
      const draftCancellation = draftCancellationFactory.build({
        data: { cancellationReason: null, cancellationComments: null },
      })
      draftsService.fetchDraft.mockResolvedValue(draftCancellation)

      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getReferralCancellationReasons.mockResolvedValue([
        { code: 'MIS', description: 'Referral was made by mistake' },
        { code: 'MOV', description: 'Service user has moved out of delivery area' },
      ])

      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/reason`)
        .type('form')
        .send({ 'cancellation-comments': 'Alex has moved out of the area' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select a reason for cancelling the referral')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/cancellation/:draftCancellationId/check-your-answers', () => {
  it('renders a page where the PP can confirm whether or not to cancel a referral', async () => {
    const draftCancellation = draftCancellationFactory.build({
      data: { cancellationReason: 'MOV', cancellationComments: 'Alex has moved out of the area' },
    })
    draftsService.fetchDraft.mockResolvedValue(draftCancellation)

    const referral = sentReferralFactory.assigned().build()
    const intervention = interventionFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/check-your-answers`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Referral Cancellation')
        expect(res.text).toContain('Are you sure you want to cancel this referral?')
      })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .get(`/probation-practitioner/referrals/abc/cancellation/def/check-your-answers`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.'
          )
        })
    })
  })

  describe('when the draft cancellation has been soft deleted', () => {
    it('responds with a 410 Gone status and renders an error message', async () => {
      const draftCancellation = draftCancellationFactory.build({
        softDeleted: true,
      })
      draftsService.fetchDraft.mockResolvedValue(draftCancellation)

      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
      interventionsService.getIntervention.mockResolvedValue(intervention)

      await request(app)
        .get(`/probation-practitioner/referrals/${referral.id}/cancellation/${draftCancellation.id}/check-your-answers`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/cancellation/:draftCancellationId/submit', () => {
  it('submits a request to cancel the referral on the backend and redirects to the confirmation screen', async () => {
    const draftCancellation = draftCancellationFactory.build({
      data: { cancellationReason: 'MOV', cancellationComments: 'Alex has moved out of the area' },
    })
    draftsService.fetchDraft.mockResolvedValue(draftCancellation)
    draftsService.deleteDraft.mockResolvedValue()

    await request(app)
      .post(
        `/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/cancellation/${draftCancellation.id}/submit`
      )
      .expect(302)
      .expect(
        'Location',
        `/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/cancellation/confirmation`
      )

    expect(interventionsService.endReferral).toHaveBeenCalledWith(
      'token',
      '9747b7fb-51bc-40e2-bbbd-791a9be9284b',
      'MOV',
      'Alex has moved out of the area'
    )

    expect(draftsService.deleteDraft).toHaveBeenCalledWith(draftCancellation.id, { userId: '123' })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .post(`/probation-practitioner/referrals/abc/cancellation/def/submit`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.'
          )
        })
    })
  })
})
