import { Express } from 'express'
import request from 'supertest'
import createError from 'http-errors'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import { createDraftFactory } from '../../../testutils/factories/draft'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import draftAppointmentFactory from '../../../testutils/factories/draftAppointment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import interventionFactory from '../../../testutils/factories/intervention'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
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
import { DraftAppointment, DraftAppointmentBooking } from '../serviceProviderReferrals/draftAppointment'

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

describe('Scheduling a supplier assessment appointment', () => {
  describe('GET /service-provider/referrals/:id/supplier-assessment/schedule/start', () => {
    it('creates a draft booking using the drafts service, and redirects to the scheduling details form', async () => {
      const draftBooking = draftAppointmentBookingFactory.build()
      draftsService.createDraft.mockResolvedValue(draftBooking)

      await request(app)
        .get(`/service-provider/referrals/1/supplier-assessment/schedule/start`)
        .expect(302)
        .expect('Location', `/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details`)

      expect(draftsService.createDraft).toHaveBeenCalledWith('supplierAssessmentBooking', null, { userId: '123' })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', () => {
    describe('when this is the first time to schedule an supplier assessment', () => {
      it('renders an empty form', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Add appointment details')
            expect(res.text).not.toContain('Previous missed appointment')
          })

        expect(draftsService.fetchDraft).toHaveBeenCalledWith(draftBooking.id, { userId: '123' })
      })
    })

    describe('when there already is a scheduled appointment', () => {
      it('renders an empty form', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(
          supplierAssessmentFactory.withSingleAppointment.build()
        )
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Change appointment details')
            expect(res.text).not.toContain('Previous missed appointment')
          })

        expect(draftsService.fetchDraft).toHaveBeenCalledWith(draftBooking.id, { userId: '123' })
      })
    })

    describe('when the existing current appointment has already been attended', () => {
      it('renders the form and includes current appointment details within previous missed appointment', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(
          supplierAssessmentFactory.withNonAttendedAppointment.build()
        )
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())
        hmppsAuthService.getSPUserByUsername.mockResolvedValue(
          hmppsAuthUserFactory.build({ firstName: 'caseWorkerFirstName', lastName: 'caseWorkerLastName' })
        )

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Add appointment details')
            expect(res.text).toContain('Previous missed appointment')
            expect(res.text).toContain('caseWorkerFirstName caseWorkerLastName')
          })

        expect(draftsService.fetchDraft).toHaveBeenCalledWith(draftBooking.id, { userId: '123' })
      })
    })

    describe('when no draft exists with that ID', () => {
      it('displays an error', async () => {
        draftsService.fetchDraft.mockResolvedValue(null)

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/abc/details`)
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain('You have not saved the appointment details.')
          })
      })
    })

    describe('when clash=true is passed as a param', () => {
      it('displays an message explaining that the chosen date and time cause a clash', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details?clash=true`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('The proposed date and time you selected clashes with another appointment.')
          })
      })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/schedule/:draftBookingId/details', () => {
    describe('with valid data', () => {
      it('updates the draft booking, and redirects to the check-answers page', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        draftsService.updateDraft.mockResolvedValue()

        const referral = sentReferralFactory.build()
        const supplierAssessment = supplierAssessmentFactory.justCreated.build()

        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/schedule/${draftBooking.id}/details`)
          .type('form')
          .send({
            'date-day': '5',
            'date-month': '3',
            'date-year': '2022',
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
            `/service-provider/referrals/${referral.id}/supplier-assessment/schedule/${draftBooking.id}/check-answers`
          )

        expect(draftsService.updateDraft).toHaveBeenCalledWith(
          draftBooking.id,
          {
            appointmentTime: '2022-03-05T09:02:00.000Z',
            durationInMinutes: 75,
            sessionType: 'ONE_TO_ONE',
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
          },
          { userId: '123' }
        )
      })

      describe('with invalid data', () => {
        it('does not update the draft booking, and renders an error message', async () => {
          const draftBooking = draftAppointmentBookingFactory.build()
          draftsService.fetchDraft.mockResolvedValue(draftBooking)

          interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())
          interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
          interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

          await request(app)
            .post(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details`)
            .type('form')
            .send({
              'date-day': '32',
              'date-month': '3',
              'date-year': 'test',
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
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/schedule/:draftBookingId/check-answers', () => {
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

      const referral = sentReferralFactory.build()
      interventionsService.getSentReferral.mockResolvedValue(referral)

      await request(app)
        .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/check-answers`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Confirm appointment details')
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

        const referral = sentReferralFactory.build()
        interventionsService.getSentReferral.mockResolvedValue(referral)

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/check-answers`)
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain('You have not saved the appointment details.')
          })
      })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/schedule/:draftBookingId/submit', () => {
    it('updates the draft booking, schedules the appointment on the interventions service, deletes the draft booking, and redirects to the confirmation page', async () => {
      const draftBooking = draftAppointmentBookingFactory.build({
        data: {
          appointmentTime: '3000-03-24T09:02:00.000Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
          npsOfficeCode: null,
        },
      })
      draftsService.fetchDraft.mockResolvedValue(draftBooking)

      draftsService.updateDraft.mockResolvedValue()
      draftsService.deleteDraft.mockResolvedValue()

      const supplierAssessment = supplierAssessmentFactory.justCreated.build()

      const scheduledAppointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
        appointmentDeliveryType: 'PHONE_CALL',
        appointmentDeliveryAddress: null,
      })

      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
      interventionsService.scheduleSupplierAssessmentAppointment.mockResolvedValue(scheduledAppointment)

      await request(app)
        .post(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/submit`)
        .expect(302)
        .expect('Location', `/service-provider/referrals/1/supplier-assessment/scheduled-confirmation`)

      expect(interventionsService.scheduleSupplierAssessmentAppointment).toHaveBeenCalledWith(
        'token',
        supplierAssessment.id,
        {
          appointmentTime: '3000-03-24T09:02:00.000Z',
          durationInMinutes: 75,
          appointmentDeliveryType: 'PHONE_CALL',
          appointmentDeliveryAddress: null,
          npsOfficeCode: null,
        }
      )

      expect(draftsService.deleteDraft).toHaveBeenCalledWith(draftBooking.id, { userId: '123' })
    })

    describe('when the interventions service responds with a 409 status code', () => {
      it('redirects to the booking form, passing a clash=true parameter, and does not delete the draft booking', async () => {
        const draftBooking = draftAppointmentBookingFactory.build({
          data: {
            appointmentTime: '3000-03-24T09:02:00.000Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
          },
        })
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())

        const error = { status: 409 }
        interventionsService.scheduleSupplierAssessmentAppointment.mockRejectedValue(error)

        await request(app)
          .post(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/submit`)
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/details?clash=true`
          )

        expect(draftsService.deleteDraft).not.toHaveBeenCalled()
      })
    })

    describe('when the interventions service responds with an error that isn’t a 409 status code', () => {
      it('renders an error message, and does not delete the draft booking', async () => {
        const draftBooking = draftAppointmentBookingFactory.build({
          data: {
            appointmentTime: '3000-03-24T09:02:00.000Z',
            durationInMinutes: 75,
            appointmentDeliveryType: 'PHONE_CALL',
            appointmentDeliveryAddress: null,
            npsOfficeCode: null,
          },
        })
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessmentFactory.build())

        const error = new Error('Failed to update appointment')
        interventionsService.scheduleSupplierAssessmentAppointment.mockRejectedValue(error)

        await request(app)
          .post(`/service-provider/referrals/1/supplier-assessment/schedule/${draftBooking.id}/submit`)
          .expect(500)
          .expect(res => {
            expect(res.text).toContain('Failed to update appointment')
          })

        expect(draftsService.deleteDraft).not.toHaveBeenCalled()
      })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/scheduled-confirmation', () => {
    it('displays a confirmation page', async () => {
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

      await request(app)
        .get(`/service-provider/referrals/1/supplier-assessment/scheduled-confirmation`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Supplier assessment appointment added')
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/scheduled-confirmation', () => {
    it('displays a confirmation page', async () => {
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

      await request(app)
        .get(`/service-provider/referrals/1/supplier-assessment/scheduled-confirmation`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Supplier assessment appointment added')
        })
    })
  })
})

describe('viewing supplier assessment feedback', () => {
  describe('as an SP', () => {
    describe('GET /service-provider/referrals/:id/supplier-assessment', () => {
      it('shows a summary of the current supplier assessment appointment', async () => {
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

        const appointments = [
          ...initialAssessmentAppointmentFactory.buildList(2),
          initialAssessmentAppointmentFactory.newlyBooked().build({
            appointmentTime: '2021-03-24T09:02:02Z',
            durationInMinutes: 75,
          }),
        ]
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments,
          currentAppointmentId: appointments[2].id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

        await request(app)
          .get(`/service-provider/referrals/1/supplier-assessment`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('24 March 2021')
            expect(res.text).toContain('9:02am to 10:17am')
          })
      })
    })
  })

  describe('as a PP', () => {
    describe('GET /probation-practitioner/referrals/:id/supplier-assessment/post-assessment-feedback', () => {
      it('renders a page showing the supplier assessment feedback', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
            },
            sessionFeedback: {
              sessionSummary: 'stub session summary',
              sessionResponse: 'stub session response',
              notifyProbationPractitioner: false,
            },
            submitted: false,
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

        await request(app)
          .get(`/probation-practitioner/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`)
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Session feedback')
            expect(res.text).toContain('Did Alex River come to the session?')
            expect(res.text).toContain('Yes, they were on time')
            expect(res.text).toContain('What did you do in the session?')
            expect(res.text).toContain('stub session summary')
            expect(res.text).toContain('How did Alex River respond to the session?')
            expect(res.text).toContain('stub session response')
            expect(res.text).toContain('Did anything concern you about Alex River?')
            expect(res.text).toContain('No')
          })
      })
      it('renders an error if there is the referral is not assigned', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.unassigned().build()
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [],
        })
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

        await request(app)
          .get(`/probation-practitioner/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`)
          .expect(500)
          .expect(res => {
            expect(res.text).toContain('Referral has not yet been assigned to a caseworker')
          })
      })
      it('renders an error if there is no current appointment for the supplier assessment', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [],
        })
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

        await request(app)
          .get(`/probation-practitioner/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`)
          .expect(500)
          .expect(res => {
            expect(res.text).toContain('Attempting to view supplier assessment feedback without a current appointment')
          })
      })
    })
  })
})

describe('Scheduling a delivery session', () => {
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
            'date-year': '2022',
            'date-month': '3',
            'date-day': '24',
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
            appointmentTime: '2022-03-24T09:02:00.000Z',
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
            'date-year': '2022',
            'date-month': '2',
            'date-day': '32',
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
            expect(res.text).toContain('You have not saved the appointment details.')
          })
      })
    })
  })

  describe('POST /service-provider/action-plan/:id/sessions/:sessionNumber/edit/:draftBookingId/submit', () => {
    it('updates the draft booking, schedules the appointment on the interventions service, deletes the draft booking, and redirects to the intervention progress page', async () => {
      const draftBooking = draftAppointmentBookingFactory.build({
        data: {
          appointmentTime: '3000-03-24T09:02:00.000Z',
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
        appointmentTime: '3000-03-24T09:02:02Z',
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
        appointmentTime: '3000-03-24T09:02:00.000Z',
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
            appointmentTime: '3000-03-24T09:02:00.000Z',
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
            appointmentTime: '3000-03-24T09:02:00.000Z',
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
})

describe('Adding supplier assessment feedback', () => {
  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', () => {
    it('renders a page with which the Service Provider can record the Service user‘s attendance for their initial appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        durationInMinutes: 60,
        appointmentDeliveryType: 'PHONE_CALL',
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Record session attendance')
          expect(res.text).toContain('Session details')
          expect(res.text).toContain('1 February 2021')
          expect(res.text).toContain('1:00pm to 2:00pm')
        })
    })
    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to add supplier assessment attendance feedback without a current appointment'
          )
        })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/attendance', () => {
    describe('when the Service Provider marks the Service user as having attended the supplier assessment', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the behaviour page', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build()
        const updatedAppointment = initialAssessmentAppointmentFactory.build({
          ...appointment,
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex made the session on time',
            },
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })

        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.recordSupplierAssessmentAppointmentAttendance.mockResolvedValue(updatedAppointment)

        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`)
          .type('form')
          .send({
            attended: 'yes',
            'additional-attendance-information': 'Alex made the session on time',
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`
          )
      })
    })

    describe('when the Service Provider marks the Service user as not having attended the supplier assessment', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the check-your-answers page', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build()
        const updatedAppointment = initialAssessmentAppointmentFactory.build({
          ...appointment,
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'no',
              additionalAttendanceInformation: "I haven't heard from Alex",
            },
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.recordSupplierAssessmentAppointmentAttendance.mockResolvedValue(updatedAppointment)
        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`)
          .type('form')
          .send({
            attended: 'no',
            'additional-attendance-information': "I haven't heard from Alex",
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
      })
    })

    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/attendance`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to add supplier assessment attendance feedback without a current appointment'
          )
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', () => {
    it('renders a page with which the Service Provider can record the session feedback for their initial appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Add session feedback')
          expect(res.text).toContain('What did you do in the session?')
          expect(res.text).toContain(
            'Add details about what you did, anything that was achieved and what came out of the session.'
          )
          expect(res.text).toContain('How did Alex River respond to the session?')
          expect(res.text).toContain(
            'Add whether Alex River seemed engaged, including any progress or positive changes. This helps the probation practitioner to support them.'
          )
          expect(res.text).toContain('Did anything concern you about Alex River?')
          expect(res.text).toContain(
            'If you select yes, the probation practitioner will get an email about your concerns.'
          )
          expect(res.text).toContain('Add enough detail to help the probation practitioner to know what happened.')
        })
    })

    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to add initial assessment session feedback without a current appointment'
          )
        })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', () => {
    describe('when the Service Provider records behaviour for the supplier assessment', () => {
      it('makes a request to the interventions service to record the Service user‘s session feedback and redirects to the check-your-answers page', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build()
        const deliusServiceUser = deliusServiceUserFactory.build()
        const updatedAppointment = initialAssessmentAppointmentFactory.build({
          ...appointment,
          appointmentFeedback: {
            sessionFeedback: {
              sessionSummary: 'summary',
              sessionResponse: 'response',
            },
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSentReferral.mockResolvedValue(referral)
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.recordSupplierAssessmentAppointmentSessionFeedback.mockResolvedValue(updatedAppointment)
        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
          .type('form')
          .send({
            'session-summary': 'summary',
            'session-response': 'response',
            'notify-probation-practitioner': 'no',
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
          )
      })
    })

    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to add initial assessment session feedback without a current appointment'
          )
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/check-your-answers', () => {
    it('renders a page with which the Service Provider can view the feedback for the initial appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentDeliveryType: 'IN_PERSON_MEETING_PROBATION_OFFICE',
        appointmentTime: '2021-02-01T13:00:00Z',
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
          },
          sessionFeedback: {
            sessionSummary: 'stub session summary',
            sessionResponse: 'stub session response',
            notifyProbationPractitioner: false,
          },
          submitted: false,
        },
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
      hmppsAuthService.getSPUserByUsername.mockResolvedValue(
        hmppsAuthUserFactory.build({
          firstName: 'caseworkerFirstName',
          lastName: 'caseworkerLastName',
          email: 'caseworker@email.com',
        })
      )

      await request(app)
        .get(
          `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Session Details')
          expect(res.text).toContain(
            'The in-person meeting (probation office) was with caseworker caseworkerFirstName caseworkerLastName at 1:00pm on 1 February 2021.'
          )
          expect(res.text).toContain('Confirm session feedback')
          expect(res.text).toContain('Did Alex River come to the session?')
          expect(res.text).toContain('Yes, they were on time')
          expect(res.text).toContain('What did you do in the session?')
          expect(res.text).toContain('stub session summary')
          expect(res.text).toContain('How did Alex River respond to the session?')
          expect(res.text).toContain('stub session response')
          expect(res.text).toContain('Did anything concern you about Alex River?')
          expect(res.text).toContain('No')
        })
    })
    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(
          `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
        )
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to check supplier assessment feedback answers without a current appointment'
          )
        })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/submit', () => {
    describe('when appointment feedback form has been filled for a user who attended with no concerns', () => {
      it('submits the action plan feedback and redirects to the progress page with the request params to show the feedback submitted banner', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
            },
            sessionFeedback: {
              sessionSummary: 'stub session summary',
              sessionResponse: 'stub session response',
              notifyProbationPractitioner: false,
            },
            submitted: false,
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.submitSupplierAssessmentAppointmentFeedback.mockResolvedValue(appointment)

        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/submit`)
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/progress?showFeedbackBanner=true&notifyPP=false&dna=false`
          )

        expect(interventionsService.submitSupplierAssessmentAppointmentFeedback).toHaveBeenCalledWith(
          'token',
          referral.id
        )
      })
    })
    describe('when appointment feedback form has been filled for a user who attended and has concerns', () => {
      it('submits the action plan feedback and redirects to the progress page with notifyPP=true request params to display the text in the feedback banner confirming an email has been sent to pp to notify of concerns', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
            },
            sessionFeedback: {
              sessionSummary: 'stub session summary',
              sessionResponse: 'stub session response',
              notifyProbationPractitioner: true,
            },
            submitted: false,
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.submitSupplierAssessmentAppointmentFeedback.mockResolvedValue(appointment)

        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/submit`)
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/progress?showFeedbackBanner=true&notifyPP=true&dna=false`
          )

        expect(interventionsService.submitSupplierAssessmentAppointmentFeedback).toHaveBeenCalledWith(
          'token',
          referral.id
        )
      })
    })
    describe('when attendance feedback form has been filled for a user who has not attended', () => {
      it('submits the action plan feedback and redirects to the progress page with dna=true request params to display the text in the feedback banner confirming an email has been sent to pp to notify of non attendance', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build({
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'no',
            },
            submitted: false,
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.submitSupplierAssessmentAppointmentFeedback.mockResolvedValue(appointment)

        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/submit`)
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/${referral.id}/progress?showFeedbackBanner=true&notifyPP=null&dna=true`
          )

        expect(interventionsService.submitSupplierAssessmentAppointmentFeedback).toHaveBeenCalledWith(
          'token',
          referral.id
        )
      })
    })
    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const appointment = initialAssessmentAppointmentFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
      interventionsService.submitSupplierAssessmentAppointmentFeedback.mockResolvedValue(appointment)

      await request(app)
        .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/submit`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Attempting to submit supplier assessment feedback without a current appointment')
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback', () => {
    it('renders a page showing the supplier assessment feedback for the current appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'yes',
            additionalAttendanceInformation: 'He was punctual',
          },
          sessionFeedback: {
            sessionSummary: 'stub session summary',
            sessionResponse: 'stub session response',
          },
          submitted: false,
        },
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
        currentAppointmentId: appointment.id,
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Session feedback')
          expect(res.text).toContain('Did Alex River come to the session?')
          expect(res.text).toContain('Yes, they were on time')
          expect(res.text).toContain('What did you do in the session?')
          expect(res.text).toContain('stub session summary')
          expect(res.text).toContain('How did Alex River respond to the session?')
          expect(res.text).toContain('stub session response')
        })
    })
    it('renders an error if there is no current appointment for the supplier assessment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Attempting to view supplier assessment feedback without a current appointment')
        })
    })
  })

  describe('GET /service-provider/referrals/:referralId/supplier-assessment/post-assessment-feedback/:appointmentId', () => {
    it('renders a page showing the supplier assessment feedback for the given appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        appointmentFeedback: {
          attendanceFeedback: {
            attended: 'no',
            attendanceFailureInformation: 'They missed the bus',
          },
          submitted: true,
        },
      })
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [appointment],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(
          `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/${appointment.id}`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Session feedback')
          expect(res.text).toContain('Did Alex River come to the session?')
          expect(res.text).toContain('No')
          expect(res.text).toContain('They missed the bus')
        })
    })

    it('renders an error if an appointment is not found with that ID', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const supplierAssessment = supplierAssessmentFactory.build({
        appointments: [],
      })
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/not-a-real-id`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Could not find the requested appointment')
        })
    })
  })
})

describe('Adding post delivery session feedback', () => {
  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', () => {
    it('renders a page with which the Service Provider can record the Service user‘s attendance', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        durationInMinutes: 60,
        appointmentDeliveryType: 'PHONE_CALL',
      })

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

      await request(app)
        .get(
          `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/attendance`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Record session attendance')
          expect(res.text).toContain('Session details')
          expect(res.text).toContain('1 February 2021')
          expect(res.text).toContain('1:00pm to 2:00pm')
        })
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/attendance', () => {
    describe('When the draft booking is found', () => {
      it('renders a page with which the Service Provider can record the Service user‘s attendance', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
          durationInMinutes: 60,
          appointmentDeliveryType: 'PHONE_CALL',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/attendance`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Record session attendance')
            expect(res.text).toContain('Session details')
            expect(res.text).toContain('1 February 2021')
            expect(res.text).toContain('1:00pm to 2:00pm')
          })
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
          durationInMinutes: 60,
          appointmentDeliveryType: 'PHONE_CALL',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/attendance`
          )
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${referral.id}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', () => {
    describe('when the Service Provider marks the Service user as having attended the session', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the behaviour page', async () => {
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex made the session on time',
            },
          },
        })

        const actionPlan = actionPlanFactory.build()

        interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/attendance`
          )
          .type('form')
          .send({
            attended: 'yes',
            'additional-attendance-information': 'Alex made the session on time',
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/behaviour`
          )
      })
    })

    describe('when the Service Provider marks the Service user as not having attended the session', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the check-your-answers page', async () => {
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'no',
              additionalAttendanceInformation: "I haven't heard from Alex",
            },
          },
        })

        const actionPlan = actionPlanFactory.build()

        interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/attendance`
          )
          .type('form')
          .send({
            attended: 'no',
            'additional-attendance-information': "I haven't heard from Alex",
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/check-your-answers`
          )
      })
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/attendance', () => {
    describe('When the draft booking is found', () => {
      describe('when the Service Provider marks the Service user as having attended the session', () => {
        it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the behaviour page', async () => {
          const updatedAppointment = actionPlanAppointmentFactory.build({
            sessionNumber: 1,
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
                additionalAttendanceInformation: 'Alex made the session on time',
              },
            },
          })

          const actionPlan = actionPlanFactory.build()
          const draftAppointment: DraftAppointment = draftAppointmentFactory.withAttendanceFeedback().build()

          const draftAppointmentResult = draftAppointmentBookingFactory.build({
            data: draftAppointment,
          })
          draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

          interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)
          interventionsService.getActionPlan.mockResolvedValue(actionPlan)

          await request(app)
            .post(
              `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/attendance`
            )
            .type('form')
            .send({
              attended: 'yes',
              'additional-attendance-information': 'Alex made the session on time',
            })
            .expect(302)
            .expect(
              'Location',
              `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
            )
        })
      })

      describe('when the Service Provider marks the Service user as not having attended the session', () => {
        it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the check-your-answers page', async () => {
          const updatedAppointment = actionPlanAppointmentFactory.build({
            sessionNumber: 1,
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'no',
                additionalAttendanceInformation: "I haven't heard from Alex",
              },
            },
          })

          const actionPlan = actionPlanFactory.build()

          const draftAppointment: DraftAppointment = draftAppointmentFactory.withAttendanceFeedback('no').build()

          const draftAppointmentResult = draftAppointmentBookingFactory.build({
            data: draftAppointment,
          })
          draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

          interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)

          interventionsService.getActionPlan.mockResolvedValue(actionPlan)

          await request(app)
            .post(
              `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/attendance`
            )
            .type('form')
            .send({
              attended: 'no',
              'additional-attendance-information': "I haven't heard from Alex",
            })
            .expect(302)
            .expect(
              'Location',
              `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/check-your-answers`
            )
        })
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentFeedback: {
            attendanceFeedback: {
              attended: 'yes',
              additionalAttendanceInformation: 'Alex made the session on time',
            },
          },
        })

        const actionPlan = actionPlanFactory.build()
        const draftAppointment: DraftAppointment = draftAppointmentFactory.withAttendanceFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)

        interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/attendance`
          )
          .type('form')
          .send({
            attended: 'yes',
            'additional-attendance-information': 'Alex made the session on time',
          })
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${actionPlan.referralId}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', () => {
    it('renders a page with which the Service Provider can record the Service user‘s behaviour', async () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
      })

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

      await request(app)
        .get(
          `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/behaviour`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Add session feedback')
        })
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/behaviour', () => {
    describe('When the draft booking is found', () => {
      it('renders a page with which the Service Provider can record the Service user‘s response', async () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withAttendanceFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Add session feedback')
          })
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withAttendanceFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
          )
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${referral.id}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', () => {
    it('makes a request to the interventions service to record the Service user‘s response and redirects to the check your answers page', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const updatedAppointment = actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        appointmentFeedback: {
          sessionFeedback: {
            sessionSummary: 'stub session summary',
            sessionResponse: 'stub session response',
          },
        },
      })

      const actionPlan = actionPlanFactory.build()

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.recordActionPlanAppointmentSessionFeedback.mockResolvedValue(updatedAppointment)

      await request(app)
        .post(
          `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/behaviour`
        )
        .type('form')
        .send({
          'session-summary': 'stub session summary',
          'session-response': 'stub session response',
          'notify-probation-practitioner': 'no',
        })
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/check-your-answers`
        )
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/behaviour', () => {
    describe('When the draft booking is found', () => {
      it('makes a request to the interventions service to record the Service user‘s behaviour and redirects to the check your answers page', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentFeedback: {
            sessionFeedback: {
              sessionSummary: 'summary',
              sessionResponse: 'response',
            },
          },
        })
        const actionPlan = actionPlanFactory.build()
        const draftAppointment: DraftAppointment = draftAppointmentFactory.withBehaviourFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

        interventionsService.recordActionPlanAppointmentSessionFeedback.mockResolvedValue(updatedAppointment)
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
          )
          .type('form')
          .send({
            'session-summary': 'summary',
            'session-response': 'response',
            'notify-probation-practitioner': 'no',
          })
          .expect(302)
          .expect(
            'Location',
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/check-your-answers`
          )
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          appointmentFeedback: {
            sessionFeedback: {
              sessionSummary: 'stub session summary',
              sessionResponse: 'stub session response',
            },
          },
        })
        const actionPlan = actionPlanFactory.build()
        const draftAppointment: DraftAppointment = draftAppointmentFactory.withBehaviourFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)

        interventionsService.recordActionPlanAppointmentSessionFeedback.mockResolvedValue(updatedAppointment)
        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
          )
          .type('form')
          .send({
            'session-summary': 'stub session summary',
            'session-response': 'stub session response',
            'notify-probation-practitioner': 'no',
          })
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${actionPlan.referralId}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('GET /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/check-your-answers', () => {
    it('renders a page with answers the user has so far selected', async () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
      const appointment = actionPlanAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        durationInMinutes: 60,
        appointmentDeliveryType: 'PHONE_CALL',
      })

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

      await request(app)
        .get(
          `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/check-your-answers`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Confirm session feedback')
        })
    })
  })

  describe('GET /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/check-your-answers', () => {
    describe('When the draft booking is found', () => {
      it('renders a page with answers the user has so far selected', async () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
          durationInMinutes: 60,
          appointmentDeliveryType: 'PHONE_CALL',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withBehaviourFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/check-your-answers`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Confirm session feedback')
          })
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const deliusServiceUser = deliusServiceUserFactory.build()
        const referral = sentReferralFactory.assigned().build()
        const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
        const appointment = actionPlanAppointmentFactory.build({
          appointmentTime: '2021-02-01T13:00:00Z',
          durationInMinutes: 60,
          appointmentDeliveryType: 'PHONE_CALL',
        })

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withBehaviourFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)

        communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
        interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/check-your-answers`
          )
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${referral.id}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('POST /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/submit', () => {
    it('marks the appointment as submitted and redirects to the progress page with the request params to show the confirmation banner', async () => {
      const referral = sentReferralFactory.assigned().build()
      const actionPlanId = '91e7ceab-74fd-45d8-97c8-ec58844618dd'
      const submittedActionPlan = actionPlanFactory.submitted().build({ id: actionPlanId, referralId: referral.id })
      const appointment = actionPlanAppointmentFactory.build({
        appointmentFeedback: {
          sessionFeedback: {
            sessionSummary: 'stub session summary',
            sessionResponse: 'stub session response',
            notifyProbationPractitioner: false,
          },
        },
      })
      const sessionNumber = 2

      interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/submit`)
        .expect(302)
        .expect(
          'Location',
          `/service-provider/referrals/${referral.id}/progress?showFeedbackBanner=true&notifyPP=false&dna=false`
        )

      expect(interventionsService.submitActionPlanSessionFeedback).toHaveBeenCalledWith(
        'token',
        actionPlanId,
        sessionNumber
      )
    })
  })

  describe('POST /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/submit', () => {
    describe('When the draft booking is found', () => {
      it('marks the appointment as submitted and redirects to the progress page with the request params to show the confirmation banner', async () => {
        const sessionNumber = 2

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withSubmittedFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)
        const actionPlan = actionPlanFactory.build()
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/submit`
          )
          .expect(302)
          .expect(
            'Location',
            `/service-provider/referrals/81d754aa-d868-4347-9c0f-50690773014e/progress?showFeedbackBanner=true&notifyPP=false&dna=false`
          )

        expect(interventionsService.updateActionPlanAppointment).toHaveBeenCalledWith(
          'token',
          actionPlan.id,
          sessionNumber,
          {
            appointmentTime: draftAppointment!.appointmentTime,
            durationInMinutes: draftAppointment!.durationInMinutes,
            appointmentDeliveryType: draftAppointment!.appointmentDeliveryType,
            sessionType: draftAppointment!.sessionType,
            appointmentDeliveryAddress: draftAppointment!.appointmentDeliveryAddress,
            npsOfficeCode: draftAppointment!.npsOfficeCode,
            attendanceFeedback: { ...draftAppointment!.session!.attendanceFeedback },
            sessionFeedback: { ...draftAppointment!.session!.sessionFeedback },
          }
        )
      })

      it('redirects back to the appointment booking form if a 409 conflict is return from interventions service', async () => {
        const sessionNumber = 2

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withSubmittedFeedback().build()
        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)
        const actionPlan = actionPlanFactory.build()
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)
        interventionsService.updateActionPlanAppointment.mockImplementation(() => {
          throw createError(409)
        })

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/submit`
          )
          .expect(302)
          .expect(
            'Location',
            `/service-provider/action-plan/${actionPlan.id}/sessions/${sessionNumber}/edit/${draftAppointmentResult.id}/details?clash=true`
          )
      })
    })

    describe('When the draft booking is not found', () => {
      it('renders a no longer available page', async () => {
        const sessionNumber = 2

        const draftAppointment: DraftAppointment = draftAppointmentFactory.withSubmittedFeedback().build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(null)
        const actionPlan = actionPlanFactory.build()
        interventionsService.getActionPlan.mockResolvedValue(actionPlan)

        await request(app)
          .post(
            `/service-provider/action-plan/${actionPlan.id}/appointment/${sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/submit`
          )
          .expect(410)
          .expect(res => {
            expect(res.text).toContain('This page is no longer available')
            expect(res.text).toContain(
              `You can <a href="/service-provider/referrals/${actionPlan.referralId}/progress" class="govuk-link">book or change the appointment`
            )
          })
      })
    })
  })

  describe('Viewing post session feedback', () => {
    describe('as an SP', () => {
      describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', () => {
        it('renders a page displaying feedback answers', async () => {
          const actionPlanId = 'bdd50f63-efea-42b8-a1a4-cc3963d41223'
          const referral = sentReferralFactory.assigned().build({ actionPlanId })
          const submittedActionPlan = actionPlanFactory
            .submitted()
            .build({ referralId: referral.id, numberOfSessions: 1, id: actionPlanId })
          const deliusServiceUser = deliusServiceUserFactory.build()

          const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.build({
            id: '1',
            appointmentTime: '2021-02-01T13:00:00Z',
            durationInMinutes: 60,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionNumber: 1,
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
                additionalAttendanceInformation: 'They were early to the session',
              },
              sessionFeedback: {
                sessionSummary: 'stub session summary',
                sessionResponse: 'stub session response',
                notifyProbationPractitioner: false,
              },
              submitted: true,
            },
          })

          communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
          interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
          interventionsService.getSentReferral.mockResolvedValue(referral)
          interventionsService.getActionPlanAppointment.mockResolvedValue(appointmentWithSubmittedFeedback)

          await request(app)
            .get(
              `/service-provider/action-plan/${submittedActionPlan.id}/session/1/appointment/1/post-session-feedback`
            )
            .expect(200)
            .expect(res => {
              expect(res.text).toContain('Session feedback')
              expect(res.text).toContain('Did Alex River come to the session?')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('What did you do in the session?')
              expect(res.text).toContain('stub session summary')
              expect(res.text).toContain('How did Alex River respond to the session?')
              expect(res.text).toContain('stub session response')
              expect(res.text).toContain('Did anything concern you about Alex River?')
              expect(res.text).toContain('No')
            })
        })
      })
    })

    describe('as a PP', () => {
      describe('GET /probation-practitioner/referrals/:referralId/appointment/:sessionNumber/post-session-feedback', () => {
        it('renders a page displaying feedback answers', async () => {
          const actionPlanId = '05f39e99-b5c7-4a9b-a857-bec04a28eb34'
          const referral = sentReferralFactory
            .assigned()
            .build({ actionPlanId, assignedTo: { username: 'Kay.Swerker' } })
          const submittedActionPlan = actionPlanFactory
            .submitted()
            .build({ id: actionPlanId, referralId: referral.id, numberOfSessions: 1 })
          const serviceUser = deliusServiceUserFactory.build()

          const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.build({
            appointmentTime: '2021-02-01T13:00:00Z',
            durationInMinutes: 60,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionNumber: 1,
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
              },
              sessionFeedback: {
                sessionSummary: 'stub session summary',
                sessionResponse: 'stub session response',
                notifyProbationPractitioner: false,
              },
              submitted: true,
            },
          })

          communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
          interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
          interventionsService.getSentReferral.mockResolvedValue(referral)
          interventionsService.getActionPlanAppointment.mockResolvedValue(appointmentWithSubmittedFeedback)
          hmppsAuthService.getSPUserByUsername.mockResolvedValue(
            hmppsAuthUserFactory.build({
              firstName: 'caseworkerFirstName',
              lastName: 'caseworkerLastName',
              email: 'caseworker@email.com',
            })
          )

          await request(app)
            .get(
              `/probation-practitioner/referrals/${referral.id}/session/${appointmentWithSubmittedFeedback.sessionNumber}/appointment/${appointmentWithSubmittedFeedback.id}/post-session-feedback`
            )

            .expect(200)
            .expect(res => {
              expect(res.text).toContain('Session feedback')
              expect(res.text).toContain('caseworkerFirstName caseworkerLastName')
              expect(res.text).toContain('Did Alex River come to the session?')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('What did you do in the session?')
              expect(res.text).toContain('stub session summary')
              expect(res.text).toContain('How did Alex River respond to the session?')
              expect(res.text).toContain('stub session response')
              expect(res.text).toContain('Did anything concern you about Alex River?')
              expect(res.text).toContain('No')
            })
        })
      })

      // This is left to keep links in old emails still working - we'll monitor the endpoint and remove it when usage drops off.
      describe('GET /probation-practitioner/action-plan/:actionPlanId/session/:sessionNumber/appointment/:appointmentId/post-session-feedback', () => {
        it('renders a page displaying feedback answers', async () => {
          const actionPlanId = '05f39e99-b5c7-4a9b-a857-bec04a28eb34'
          const referral = sentReferralFactory
            .assigned()
            .build({ actionPlanId, assignedTo: { username: 'Kay.Swerker' } })
          const submittedActionPlan = actionPlanFactory
            .submitted()
            .build({ id: actionPlanId, referralId: referral.id, numberOfSessions: 1 })
          const serviceUser = deliusServiceUserFactory.build()

          const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.build({
            id: '1',
            appointmentTime: '2021-02-01T13:00:00Z',
            durationInMinutes: 60,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionNumber: 1,
            appointmentFeedback: {
              attendanceFeedback: {
                attended: 'yes',
              },
              sessionFeedback: {
                sessionSummary: 'stub session summary',
                sessionResponse: 'stub session response',
                notifyProbationPractitioner: false,
              },
              submitted: true,
            },
          })

          communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
          interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
          interventionsService.getSentReferral.mockResolvedValue(referral)
          interventionsService.getActionPlanAppointment.mockResolvedValue(appointmentWithSubmittedFeedback)
          hmppsAuthService.getSPUserByUsername.mockResolvedValue(
            hmppsAuthUserFactory.build({
              firstName: 'caseworkerFirstName',
              lastName: 'caseworkerLastName',
              email: 'caseworker@email.com',
            })
          )

          await request(app)
            .get(
              `/probation-practitioner/referrals/${referral.id}/session/${appointmentWithSubmittedFeedback.sessionNumber}/appointment/${appointmentWithSubmittedFeedback.id}/post-session-feedback`
            )
            .expect(200)
            .expect(res => {
              expect(res.text).toContain('Session feedback')
              expect(res.text).toContain('caseworkerFirstName caseworkerLastName')
              expect(res.text).toContain('Did Alex River come to the session?')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('What did you do in the session?')
              expect(res.text).toContain('stub session summary')
              expect(res.text).toContain('How did Alex River respond to the session?')
              expect(res.text).toContain('stub session response')
              expect(res.text).toContain('Did anything concern you about Alex River?')
              expect(res.text).toContain('No')
            })
        })
      })
    })
  })
})
