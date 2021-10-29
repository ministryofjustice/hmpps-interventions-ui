import { Express } from 'express'
import request from 'supertest'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import { createDraftFactory } from '../../../testutils/factories/draft'
import interventionFactory from '../../../testutils/factories/intervention'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import apiConfig from '../../config'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import CommunityApiService from '../../services/communityApiService'
import DraftsService from '../../services/draftsService'
import HmppsAuthService from '../../services/hmppsAuthService'
import InterventionsService from '../../services/interventionsService'
import ReferenceDataService from '../../services/referenceDataService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import MockReferenceDataService from '../testutils/mocks/mockReferenceDataService'
import { DraftAppointmentBooking } from './appointmentsController'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>

const referenceDataService = new MockReferenceDataService() as jest.Mocked<ReferenceDataService>

const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

const draftsService = {
  createDraft: jest.fn(),
  fetchDraft: jest.fn(),
  updateDraft: jest.fn(),
  deleteDraft: jest.fn(),
} as unknown as jest.Mocked<DraftsService>

const draftAppointmentBookingFactory = createDraftFactory<DraftAppointmentBooking>(null)

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: {
      interventionsService,
      communityApiService,
      hmppsAuthService,
      assessRisksAndNeedsService,
      draftsService,
      referenceDataService,
    },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /service-provider/action-plan/:id/sessions/:sessionNumber/edit/start', () => {
  it('creates a draft session update and redirects to the details page', async () => {
    const booking = draftAppointmentBookingFactory.build()
    draftsService.createDraft.mockResolvedValue(booking)

    await request(app)
      .get(`/service-provider/action-plan/1/sessions/1/edit/start`)
      .expect(302)
      .expect('Location', `/service-provider/action-plan/1/sessions/1/edit/${booking.id}/details`)

    expect(draftsService.createDraft).toHaveBeenCalledWith('actionPlanSessionUpdate', null, { userId: '123' })
  })
})

describe('GET /service-provider/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/details', () => {
  it('renders a form', async () => {
    const booking = draftAppointmentBookingFactory.build()
    draftsService.fetchDraft.mockResolvedValue(booking)

    const appointment = actionPlanAppointmentFactory.build()

    interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)
    interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
    interventionsService.getActionPlan.mockResolvedValue(actionPlanFactory.build())
    interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

    await request(app)
      .get(`/service-provider/action-plan/1/sessions/1/edit/${booking.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add session 1 details')
      })
  })
})

describe('POST /service-provider/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/details', () => {
  describe('with valid data', () => {
    it('updates the draft booking and redirects to the check-answers page', async () => {
      const draftBooking = draftAppointmentBookingFactory.build()
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      const actionPlan = actionPlanFactory.build()

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/details`)
        .type('form')
        .send({
          'date-day': '24',
          'date-month': '3',
          'date-year': '2021',
          'time-hour': '9',
          'time-minute': '02',
          'time-part-of-day': 'am',
          'duration-hours': '1',
          'duration-minutes': '15',
          'session-type': 'ONE_TO_ONE',
          'meeting-method': 'PHONE_CALL',
        })
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/check-answers`
        )

      expect(draftsService.updateDraft).toHaveBeenCalledWith(
        draftBooking.id,
        {
          appointmentDeliveryAddress: null,
          appointmentTime: '2021-03-24T09:02:00.000Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
          npsOfficeCode: null,
          sessionType: 'ONE_TO_ONE',
        },
        { userId: '123' }
      )
    })
  })

  describe('with invalid data', () => {
    it('does not update the draft booking, and renders an error message', async () => {
      const draftBooking = draftAppointmentBookingFactory.build()
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      const actionPlan = actionPlanFactory.build()
      const appointment = actionPlanAppointmentFactory.build()

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/details`)
        .type('form')
        .send({
          'date-day': '32',
          'date-month': '3',
          'date-year': '2021',
          'time-hour': '9',
          'time-minute': '02',
          'time-part-of-day': 'am',
          'duration-hours': '1',
          'duration-minutes': '15',
          'session-type': 'ONE_TO_ONE',
          'meeting-method': 'PHONE_CALL',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The session date must be a real date')
        })

      expect(draftsService.updateDraft).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/check-answers', () => {
  it('renders a page that replays the user’s answers from the draft booking', async () => {
    const draftBooking = draftAppointmentBookingFactory.build({
      data: {
        appointmentTime: '2021-03-24T09:02:00.000Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'PHONE_CALL',
        appointmentDeliveryAddress: null,
        npsOfficeCode: null,
      },
    })
    draftsService.fetchDraft.mockResolvedValue(draftBooking)

    const actionPlan = actionPlanFactory.build()
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)

    const referral = sentReferralFactory.build()
    interventionsService.getSentReferral.mockResolvedValue(referral)

    await request(app)
      .get(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/check-answers`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm session 1 details')
        expect(res.text).toContain('24 March 2021')
        expect(res.text).toContain('9:02am to 10:17am')
        expect(res.text).toContain('Phone call')
      })
  })

  describe('when the draft booking has been soft deleted', () => {
    it('responds with a 410 Gone status and renders an error message', async () => {
      const draftBooking = draftAppointmentBookingFactory.build({
        softDeleted: true,
      })
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      const actionPlan = actionPlanFactory.build()
      interventionsService.getActionPlan.mockResolvedValue(actionPlan)

      const referral = sentReferralFactory.build()
      interventionsService.getSentReferral.mockResolvedValue(referral)

      await request(app)
        .get(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/check-answers`)
        .expect(410)
        .expect(res => {
          expect(res.text).toContain('This page is no longer available')
        })
    })
  })
})

describe('POST /service-provider/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/submit', () => {
  it('updates the draft booking, schedules the appointment on the interventions service, deletes the draft booking, and redirects to the intervention progress page', async () => {
    const draftBooking = draftAppointmentBookingFactory.build({
      data: {
        appointmentTime: '2021-03-24T09:02:00.000Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'PHONE_CALL',
        appointmentDeliveryAddress: null,
        npsOfficeCode: null,
      },
    })
    draftsService.fetchDraft.mockResolvedValue(draftBooking)

    draftsService.updateDraft.mockResolvedValue()
    draftsService.deleteDraft.mockResolvedValue()

    const actionPlan = actionPlanFactory.build()
    interventionsService.getActionPlan.mockResolvedValue(actionPlan)

    const updatedAppointment = actionPlanAppointmentFactory.build({
      sessionNumber: 1,
      appointmentTime: '2021-03-24T09:02:02Z',
      durationInMinutes: 75,
      appointmentDeliveryType: 'PHONE_CALL',
      sessionType: 'ONE_TO_ONE',
    })
    interventionsService.updateActionPlanAppointment.mockResolvedValue(updatedAppointment)

    await request(app)
      .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/referrals/${actionPlan.referralId}/progress`)

    expect(interventionsService.updateActionPlanAppointment).toHaveBeenCalledWith('token', actionPlan.id, 1, {
      appointmentTime: '2021-03-24T09:02:00.000Z',
      durationInMinutes: 75,
      appointmentDeliveryType: 'PHONE_CALL',
      appointmentDeliveryAddress: null,
      npsOfficeCode: null,
    })

    expect(draftsService.deleteDraft).toHaveBeenCalledWith(draftBooking.id, { userId: '123' })
  })

  describe('when the interventions service responds with a 409 status code', () => {
    it('redirects to the booking form, passing a clash=true parameter, and does not delete the draft booking', async () => {
      const draftBooking = draftAppointmentBookingFactory.build({
        data: {
          appointmentTime: '2021-03-24T09:02:00.000Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
          npsOfficeCode: null,
        },
      })
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      const actionPlan = actionPlanFactory.build()
      interventionsService.getActionPlan.mockResolvedValue(actionPlan)

      const error = { status: 409 }
      interventionsService.updateActionPlanAppointment.mockRejectedValue(error)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/submit`)
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/details?clash=true`
        )

      expect(draftsService.deleteDraft).not.toHaveBeenCalled()
    })
  })

  describe('when the interventions service responds with an error that isn’t a 409 status code', () => {
    it('renders an error message, and does not delete the draft booking', async () => {
      const draftBooking = draftAppointmentBookingFactory.build({
        data: {
          appointmentTime: '2021-03-24T09:02:00.000Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
          npsOfficeCode: null,
        },
      })
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      const actionPlan = actionPlanFactory.build()
      interventionsService.getActionPlan.mockResolvedValue(actionPlan)

      const error = new Error('Failed to update appointment')
      interventionsService.updateActionPlanAppointment.mockRejectedValue(error)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit/${draftBooking.id}/submit`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Failed to update appointment')
        })

      expect(draftsService.deleteDraft).not.toHaveBeenCalled()
    })
  })
})
