import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../../testutils/appSetup'
import InterventionsService from '../../../services/interventionsService'
import apiConfig from '../../../config'
import MockedHmppsAuthService from '../../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../../services/hmppsAuthService'
import DraftsService from '../../../services/draftsService'
import UserDataService from '../../../services/userDataService'
import { createDraftFactory } from '../../../../testutils/factories/draft'
import draftWithdrawalDataFactory from '../../../../testutils/factories/draftWithdrawalData'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import interventionFactory from '../../../../testutils/factories/intervention'
import deliusServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'
import MockRamDeliusApiService from '../../testutils/mocks/mockRamDeliusApiService'
import RamDeliusApiService from '../../../services/ramDeliusApiService'
import { WithdrawalState } from '../../../models/sentReferral'

jest.mock('../../../services/interventionsService')
jest.mock('../../../services/ramDeliusApiService')
jest.mock('../../../services/draftsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

const draftWithdrawalFactory = createDraftFactory(draftWithdrawalDataFactory.build())

const ramDeliusApiService = new MockRamDeliusApiService() as jest.Mocked<RamDeliusApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

const userDataService = {
  store: jest.fn(),
  retrieve: jest.fn(),
} as unknown as jest.Mocked<UserDataService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      ramDeliusApiService,
      hmppsAuthService,
      draftsService,
      userDataService,
    },
    userType: AppSetupUserType.probationPractitioner,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /referrals/:id/withdrawal/start', () => {
  it('creates a draft withdrawal using the drafts service and redirects to the reason page', async () => {
    const draftWithdrawal = draftWithdrawalFactory.build()
    draftsService.createDraft.mockResolvedValue(draftWithdrawal)

    await request(app)
      .get(`/probation-practitioner/referrals/123/withdrawal/start`)
      .expect(302)
      .expect('Location', `/probation-practitioner/referrals/123/withdrawal/${draftWithdrawal.id}/reason`)

    expect(draftsService.createDraft).toHaveBeenCalledWith(
      'withdrawal',
      {
        withdrawalReason: null,
        withdrawalComments: null,
        withdrawalState: null,
      },
      { userId: '123' }
    )
  })
})

describe('GET /probation-practitioner/referrals/:id/withdrawal/:draftWithdrawalId/reason', () => {
  it('renders a page where the PP can add comments and withdraw a referral', async () => {
    const draftWithdrawal = draftWithdrawalFactory.build()
    draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)

    const referral = sentReferralFactory.assigned().build()
    const intervention = interventionFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getReferralWithdrawalReasons.mockResolvedValue([
      { code: 'INE', description: 'Ineligible Referral', grouping: 'problem' },
      { code: 'MIS', description: 'Mistaken or duplicate referral', grouping: 'problem' },
    ])

    await request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/reason`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Referral withdrawal')
        expect(res.text).toContain('You are about to cancel')
        expect(res.text).toContain('Ineligible Referral')
        expect(res.text).toContain('Mistaken or duplicate referral')
      })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .get(`/probation-practitioner/referrals/abc/withdrawal/def/reason`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/withdrawal/:draftWithdrawalId/reason', () => {
  it('updates the draft withdrawal using the drafts service and redirects to the check your answers page', async () => {
    const draftWithdrawal = draftWithdrawalFactory.build({
      data: { withdrawalReason: null, withdrawalComments: null, withdrawalState: null },
    })
    draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)

    const referral = sentReferralFactory.assigned().build()
    interventionsService.getSentReferral.mockResolvedValue(referral)

    await request(app)
      .post(`/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/reason`)
      .type('form')
      .send({ 'withdrawal-reason': 'INE', 'withdrawal-comments-INE': 'Alex has moved out of the area' })
      .expect(302)
      .expect(
        'Location',
        `/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/check-your-answers`
      )

    expect(draftsService.updateDraft).toHaveBeenCalledWith(
      draftWithdrawal.id,
      {
        withdrawalReason: 'INE',
        withdrawalComments: 'Alex has moved out of the area',
        withdrawalState: WithdrawalState.preICA,
      },
      { userId: '123' }
    )
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .post(`/probation-practitioner/referrals/abc/withdrawal/def/reason`)
        .type('form')
        .send({ 'withdrawal-reason': 'INE', 'withdrawal-comments-INE': 'Alex has moved out of the area' })
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
          expect(res.text).toContain('You have not withdrawn this referral.')
        })
    })
  })

  describe('with invalid data', () => {
    it('renders an error message', async () => {
      const draftWithdrawal = draftWithdrawalFactory.build({
        data: { withdrawalReason: null, withdrawalComments: null, withdrawalState: null },
      })
      draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)

      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getReferralWithdrawalReasons.mockResolvedValue([
        { code: 'INE', description: 'Ineligible Referral', grouping: 'problem' },
        { code: 'MIS', description: 'Mistaken or duplicate referral', grouping: 'problem' },
      ])

      await request(app)
        .post(`/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/reason`)
        .type('form')
        .send({ 'withdrawal-comments-INE': 'Alex has moved out of the area' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select a reason for withdrawing the referral')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/withdrawal/:draftWithdrawalId/check-your-answers', () => {
  it('renders a page where the PP can confirm whether or not to withdraw a referral', async () => {
    const draftWithdrawal = draftWithdrawalFactory.build({
      data: { withdrawalReason: null, withdrawalComments: null, withdrawalState: null },
    })
    draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)

    const referral = sentReferralFactory.assigned().build()
    const intervention = interventionFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/check-your-answers`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Are you sure you want to withdraw')
      })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .get(`/probation-practitioner/referrals/abc/withdrawal/def/check-your-answers`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })

  describe('when the draft withdrawal has been soft deleted', () => {
    it('responds with a 410 Gone status and renders an error message', async () => {
      const draftWithdrawal = draftWithdrawalFactory.build({
        softDeleted: true,
      })
      draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)

      const referral = sentReferralFactory.assigned().build()
      const intervention = interventionFactory.build()
      const serviceUser = deliusServiceUserFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      ramDeliusApiService.getCaseDetailsByCrn.mockResolvedValue(serviceUser)
      interventionsService.getIntervention.mockResolvedValue(intervention)

      await request(app)
        .get(`/probation-practitioner/referrals/${referral.id}/withdrawal/${draftWithdrawal.id}/check-your-answers`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})

describe('POST /probation-practitioner/referrals/:id/withdrawal/:draftWithdrawalId/submit', () => {
  it('submits a request to withdraw the referral on the backend and redirects to the confirmation screen', async () => {
    const draftWithdrawal = draftWithdrawalFactory.build({
      data: { withdrawalReason: 'INE', withdrawalComments: 'some comments', withdrawalState: WithdrawalState.preICA },
    })
    draftsService.fetchDraft.mockResolvedValue(draftWithdrawal)
    draftsService.deleteDraft.mockResolvedValue()

    await request(app)
      .post(
        `/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/withdrawal/${draftWithdrawal.id}/submit`
      )
      .expect(302)
      .expect(
        'Location',
        `/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/withdrawal/confirmation`
      )

    expect(interventionsService.withdrawReferral).toHaveBeenCalledWith(
      'token',
      '9747b7fb-51bc-40e2-bbbd-791a9be9284b',
      'INE',
      'some comments',
      WithdrawalState.preICA
    )

    expect(draftsService.deleteDraft).toHaveBeenCalledWith(draftWithdrawal.id, { userId: '123' })
  })

  describe('when no draft exists with that ID', () => {
    it('displays an error', async () => {
      draftsService.fetchDraft.mockResolvedValue(null)

      await request(app)
        .post(`/probation-practitioner/referrals/abc/withdrawal/def/submit`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})
