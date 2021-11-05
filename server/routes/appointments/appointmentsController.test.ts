import { Express } from 'express'
import request from 'supertest'
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
          .expect(500)
          .expect(res => {
            expect(res.text).toContain(
              'Too much time has passed since you started booking this appointment. Your answers have not been saved, and you will need to start again.'
            )
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
            `/service-provider/referrals/${referral.id}/supplier-assessment/schedule/${draftBooking.id}/check-answers`
          )

        expect(draftsService.updateDraft).toHaveBeenCalledWith(
          draftBooking.id,
          {
            appointmentTime: '2021-03-24T09:02:00.000Z',
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
          })
      })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/schedule/:draftBookingId/submit', () => {
    it('updates the draft booking, schedules the appointment on the interventions service, deletes the draft booking, and redirects to the confirmation page', async () => {
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
          appointmentTime: '2021-03-24T09:02:00.000Z',
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
            appointmentTime: '2021-03-24T09:02:00.000Z',
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
            appointmentTime: '2021-03-24T09:02:00.000Z',
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
          expect(res.text).toContain('Initial assessment appointment added')
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
          expect(res.text).toContain('Initial assessment appointment added')
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
          sessionFeedback: {
            attendance: {
              attended: 'yes',
              additionalAttendanceInformation: 'He was punctual',
            },
            behaviour: {
              behaviourDescription: 'Acceptable',
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
            expect(res.text).toContain('View feedback')
            expect(res.text).toContain('Did Alex attend the initial assessment appointment?')
            expect(res.text).toContain('Yes, they were on time')
            expect(res.text).toContain('Describe Alex&#39;s behaviour in the assessment appointment')
            expect(res.text).toContain('Acceptable')
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
  describe('GET /service-provider/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/start', () => {
    it('creates a draft session update and redirects to the details page', async () => {
      const booking = draftAppointmentBookingFactory.build()
      draftsService.createDraft.mockResolvedValue(booking)

      await request(app)
        .get(`/service-provider/referral/1/session/1/appointment/1/edit/start`)
        .expect(302)
        .expect('Location', `/service-provider/referral/1/session/1/appointment/1/edit/${booking.id}/details`)

      expect(draftsService.createDraft).toHaveBeenCalledWith('deliverySessionUpdate', null, { userId: '123' })
    })
  })

  describe('GET /service-provider/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/details', () => {
    it('renders a form', async () => {
      const booking = draftAppointmentBookingFactory.build()
      draftsService.fetchDraft.mockResolvedValue(booking)

      const appointment = actionPlanAppointmentFactory.build()
      const referral = sentReferralFactory.build()

      interventionsService.getDeliverySessionAppointment.mockResolvedValue(appointment)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

      await request(app)
        .get(
          `/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/${booking.id}/details`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Add session 1 details')
        })
    })
  })

  describe('POST /service-provider/referral/:referralId/session/:sessionNumber/appointment/:appointmentId/edit/:draftBookingId/details', () => {
    describe('with valid data', () => {
      it('updates the draft booking and redirects to the check-answers page', async () => {
        const draftBooking = draftAppointmentBookingFactory.build()
        draftsService.fetchDraft.mockResolvedValue(draftBooking)

        const appointment = actionPlanAppointmentFactory.build()
        const referral = sentReferralFactory.build()

        interventionsService.getDeliverySessionAppointment.mockResolvedValue(appointment)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .post(
            `/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/${draftBooking.id}/details`
          )
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
            `/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/${draftBooking.id}/check-answers`
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

        const appointment = actionPlanAppointmentFactory.build()
        const referral = sentReferralFactory.build()

        interventionsService.getDeliverySessionAppointment.mockResolvedValue(appointment)
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getIntervention.mockResolvedValue(interventionFactory.build())

        await request(app)
          .post(
            `/service-provider/referral/${referral.id}/session/1/appointment/${appointment.id}/edit/${draftBooking.id}/details`
          )
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

  // Deprecated journey
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
          expect(res.text).toContain('Add feedback')
          expect(res.text).toContain('Appointment details')
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
          sessionFeedback: {
            attendance: {
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
          sessionFeedback: {
            attendance: {
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
    it('renders a page with which the Service Provider can record the Service user‘s behaviour for their initial appointment', async () => {
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
          expect(res.text).toContain('Add behaviour feedback')
          expect(res.text).toContain('Describe Alex&#39;s behaviour in the assessment appointment')
          expect(res.text).toContain(
            'If you described poor behaviour, do you want to notify the probation practitioner?'
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
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain(
            'Attempting to add initial assessment behaviour feedback without a current appointment'
          )
        })
    })
  })

  describe('POST /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/behaviour', () => {
    describe('when the Service Provider records behaviour for the supplier assessment', () => {
      it('makes a request to the interventions service to record the Service user‘s behaviour and redirects to the check-your-answers page', async () => {
        const referral = sentReferralFactory.assigned().build()
        const appointment = initialAssessmentAppointmentFactory.build()
        const updatedAppointment = initialAssessmentAppointmentFactory.build({
          ...appointment,
          sessionFeedback: {
            behaviour: {
              behaviourDescription: 'They were very respectful and polite.',
              notifyProbationPractitioner: false,
            },
          },
        })
        const supplierAssessment = supplierAssessmentFactory.build({
          appointments: [appointment],
          currentAppointmentId: appointment.id,
        })
        interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
        interventionsService.recordSupplierAssessmentAppointmentBehaviour.mockResolvedValue(updatedAppointment)
        await request(app)
          .post(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/behaviour`)
          .type('form')
          .send({
            'behaviour-description': 'They were very respectful and polite.',
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
            'Attempting to add initial assessment behaviour feedback without a current appointment'
          )
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/check-your-answers', () => {
    it('renders a page with which the Service Provider can view the feedback for the initial appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'He was punctual',
          },
          behaviour: {
            behaviourDescription: 'Acceptable',
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
        .get(
          `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/check-your-answers`
        )
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Confirm feedback')
          expect(res.text).toContain('Did Alex attend the initial assessment appointment?')
          expect(res.text).toContain('Yes, they were on time')
          expect(res.text).toContain('Describe Alex&#39;s behaviour in the assessment appointment')
          expect(res.text).toContain('Acceptable')
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
    it('submits the action plan and redirects to the confirmation page', async () => {
      const appointment = initialAssessmentAppointmentFactory.build()
      const referral = sentReferralFactory.assigned().build()
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
          `/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/confirmation`
        )

      expect(interventionsService.submitSupplierAssessmentAppointmentFeedback).toHaveBeenCalledWith(
        'token',
        referral.id
      )
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

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback/confirmation', () => {
    it('renders a page confirming that the supplier assessment feedback has been submitted', async () => {
      const referral = sentReferralFactory.assigned().build()

      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

      await request(app)
        .get(`/service-provider/referrals/${referral.id}/supplier-assessment/post-assessment-feedback/confirmation`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Initial assessment added')
        })
    })
  })

  describe('GET /service-provider/referrals/:id/supplier-assessment/post-assessment-feedback', () => {
    it('renders a page showing the supplier assessment feedback for the current appointment', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const referral = sentReferralFactory.assigned().build()
      const appointment = initialAssessmentAppointmentFactory.build({
        appointmentTime: '2021-02-01T13:00:00Z',
        sessionFeedback: {
          attendance: {
            attended: 'yes',
            additionalAttendanceInformation: 'He was punctual',
          },
          behaviour: {
            behaviourDescription: 'Acceptable',
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
          expect(res.text).toContain('View feedback')
          expect(res.text).toContain('Did Alex attend the initial assessment appointment?')
          expect(res.text).toContain('Yes, they were on time')
          expect(res.text).toContain('Describe Alex&#39;s behaviour in the assessment appointment')
          expect(res.text).toContain('Acceptable')
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
        sessionFeedback: {
          attendance: {
            attended: 'no',
            additionalAttendanceInformation: 'They missed the bus',
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
          expect(res.text).toContain('View feedback')
          expect(res.text).toContain('Did Alex attend the initial assessment appointment?')
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
          expect(res.text).toContain('Add attendance feedback')
          expect(res.text).toContain('Session details')
          expect(res.text).toContain('1 February 2021')
          expect(res.text).toContain('1:00pm to 2:00pm')
        })
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/attendance', () => {
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
          expect(res.text).toContain('Add attendance feedback')
          expect(res.text).toContain('Session details')
          expect(res.text).toContain('1 February 2021')
          expect(res.text).toContain('1:00pm to 2:00pm')
        })
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', () => {
    describe('when the Service Provider marks the Service user as having attended the session', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the behaviour page', async () => {
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          sessionFeedback: {
            attendance: {
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
          sessionFeedback: {
            attendance: {
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
    describe('when the Service Provider marks the Service user as having attended the session', () => {
      it('makes a request to the interventions service to record the Service user‘s attendance and redirects to the behaviour page', async () => {
        const updatedAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: 1,
          sessionFeedback: {
            attendance: {
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
          sessionFeedback: {
            attendance: {
              attended: 'no',
              additionalAttendanceInformation: "I haven't heard from Alex",
            },
          },
        })

        const actionPlan = actionPlanFactory.build()

        const draftAppointment: DraftAppointment = draftAppointmentFactory
          .withAttendanceFeedback('no', "I haven't heard from Alex")
          .build()

        const draftAppointmentResult = draftAppointmentBookingFactory.build({
          data: draftAppointment,
        })
        draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

        interventionsService.recordActionPlanAppointmentAttendance.mockResolvedValue(updatedAppointment)

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
          expect(res.text).toContain('Add behaviour feedback')
        })
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/behaviour', () => {
    it('renders a page with which the Service Provider can record the Service user‘s behaviour', async () => {
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
          expect(res.text).toContain('Add behaviour feedback')
        })
    })
  })

  describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', () => {
    it('makes a request to the interventions service to record the Service user‘s behaviour and redirects to the check your answers page', async () => {
      const updatedAppointment = actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        sessionFeedback: {
          behaviour: {
            behaviourDescription: 'Alex was well-behaved',
            notifyProbationPractitioner: false,
          },
        },
      })

      const actionPlan = actionPlanFactory.build()

      interventionsService.recordActionPlanAppointmentBehavior.mockResolvedValue(updatedAppointment)

      await request(app)
        .post(
          `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/behaviour`
        )
        .type('form')
        .send({
          'behaviour-description': 'Alex was well-behaved',
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
    it('makes a request to the interventions service to record the Service user‘s behaviour and redirects to the check your answers page', async () => {
      const updatedAppointment = actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        sessionFeedback: {
          behaviour: {
            behaviourDescription: 'Alex was well-behaved',
            notifyProbationPractitioner: false,
          },
        },
      })
      const actionPlan = actionPlanFactory.build()
      const draftAppointment: DraftAppointment = draftAppointmentFactory.withBehaviourFeedback().build()

      const draftAppointmentResult = draftAppointmentBookingFactory.build({
        data: draftAppointment,
      })
      draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

      interventionsService.recordActionPlanAppointmentBehavior.mockResolvedValue(updatedAppointment)

      await request(app)
        .post(
          `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/behaviour`
        )
        .type('form')
        .send({
          'behaviour-description': 'Alex was well-behaved',
          'notify-probation-practitioner': 'no',
        })
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlan.id}/appointment/${updatedAppointment.sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/check-your-answers`
        )
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
          expect(res.text).toContain('Confirm feedback')
        })
    })
  })

  describe('GET /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/check-your-answers', () => {
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
          expect(res.text).toContain('Confirm feedback')
        })
    })
  })

  describe('POST /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/submit', () => {
    it('marks the appointment as submitted and redirects to the confirmation page', async () => {
      const actionPlanId = '91e7ceab-74fd-45d8-97c8-ec58844618dd'
      const sessionNumber = 2

      await request(app)
        .post(`/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/submit`)
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/confirmation`
        )

      expect(interventionsService.submitActionPlanSessionFeedback).toHaveBeenCalledWith(
        'token',
        actionPlanId,
        sessionNumber
      )
    })
  })

  describe('POST /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/edit/:draftBookingId/submit', () => {
    it('marks the appointment as submitted and redirects to the confirmation page', async () => {
      const actionPlanId = '91e7ceab-74fd-45d8-97c8-ec58844618dd'
      const sessionNumber = 2

      const draftAppointment: DraftAppointment = draftAppointmentFactory.withSubmittedFeedback().build()

      const draftAppointmentResult = draftAppointmentBookingFactory.build({
        data: draftAppointment,
      })
      draftsService.fetchDraft.mockResolvedValue(draftAppointmentResult)

      await request(app)
        .post(
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/edit/${draftAppointmentResult.id}/submit`
        )
        .expect(302)
        .expect(
          'Location',
          `/service-provider/action-plan/${actionPlanId}/appointment/${sessionNumber}/post-session-feedback/confirmation`
        )

      expect(interventionsService.recordAndSubmitActionPlanAppointmentWithFeedback).toHaveBeenCalledWith(
        'token',
        actionPlanId,
        sessionNumber,
        {
          appointmentTime: draftAppointment!.appointmentTime,
          durationInMinutes: draftAppointment!.durationInMinutes,
          appointmentDeliveryType: draftAppointment!.appointmentDeliveryType,
          sessionType: draftAppointment!.sessionType,
          appointmentDeliveryAddress: draftAppointment!.appointmentDeliveryAddress,
          npsOfficeCode: draftAppointment!.npsOfficeCode,
          appointmentAttendance: { ...draftAppointment!.sessionFeedback!.attendance },
          appointmentBehaviour: { ...draftAppointment!.sessionFeedback!.behaviour },
        }
      )
    })
  })

  describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/confirmation', () => {
    describe('when final appointment attendance has been recorded', () => {
      it('renders a page confirming that the action plan has been submitted', async () => {
        const referral = sentReferralFactory.assigned().build()
        const finalSessionNumber = 2
        const submittedActionPlan = actionPlanFactory
          .submitted()
          .build({ referralId: referral.id, numberOfSessions: finalSessionNumber })

        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)

        const finalAppointment = actionPlanAppointmentFactory.build({ sessionNumber: finalSessionNumber })

        interventionsService.getActionPlanAppointment.mockResolvedValue(finalAppointment)
        interventionsService.getSubsequentActionPlanAppointment.mockResolvedValue(null)

        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/2/post-session-feedback/confirmation`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('Please submit the end of service report within 5 working days.')
          })
      })
    })

    describe('when any non-final session has been recorded and more sessions are scheduled', () => {
      it('renders a page confirming that the action plan has been submitted', async () => {
        const referral = sentReferralFactory.assigned().build()
        const finalSessionNumber = 3
        const submittedActionPlan = actionPlanFactory
          .submitted()
          .build({ referralId: referral.id, numberOfSessions: finalSessionNumber })

        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)

        const penultimateAppointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })

        const nextAppointment = actionPlanAppointmentFactory.build({
          sessionNumber: finalSessionNumber,
          appointmentTime: '2021-03-31T10:50:10.790Z',
        })

        interventionsService.getActionPlanAppointment.mockResolvedValue(penultimateAppointment)
        interventionsService.getSubsequentActionPlanAppointment.mockResolvedValue(nextAppointment)

        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${penultimateAppointment.sessionNumber}/post-session-feedback/confirmation`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('You can now deliver the next session scheduled for 31 March 2021.')
          })
      })
    })

    describe('when any non-final session has been recorded but no more sessions are scheduled', () => {
      it('renders a page confirming that the action plan has been submitted', async () => {
        const referral = sentReferralFactory.assigned().build()
        const finalSessionNumber = 3
        const submittedActionPlan = actionPlanFactory
          .submitted()
          .build({ referralId: referral.id, numberOfSessions: finalSessionNumber })

        interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)

        const penultimateAppointment = actionPlanAppointmentFactory.build({ sessionNumber: 2 })

        interventionsService.getActionPlanAppointment.mockResolvedValue(penultimateAppointment)
        interventionsService.getSubsequentActionPlanAppointment.mockResolvedValue(null)

        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

        await request(app)
          .get(
            `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${penultimateAppointment.sessionNumber}/post-session-feedback/confirmation`
          )
          .expect(200)
          .expect(res => {
            expect(res.text).toContain('The probation practitioner has been sent a copy of the session feedback form.')
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
            appointmentTime: '2021-02-01T13:00:00Z',
            durationInMinutes: 60,
            appointmentDeliveryType: 'PHONE_CALL',
            sessionNumber: 1,
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'They were early to the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was well-behaved',
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
            .get(`/service-provider/action-plan/${submittedActionPlan.id}/appointment/1/post-session-feedback`)
            .expect(200)
            .expect(res => {
              expect(res.text).toContain('View feedback')
              expect(res.text).toContain('They were early to the session')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('Alex was well-behaved')
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
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'They were early to the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was well-behaved',
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
              `/probation-practitioner/referrals/${referral.id}/appointment/${appointmentWithSubmittedFeedback.sessionNumber}/post-session-feedback`
            )
            .expect(200)
            .expect(res => {
              expect(res.text).toContain('View feedback')
              expect(res.text).toContain('caseworkerFirstName caseworkerLastName')
              expect(res.text).toContain('caseworker@email.com')
              expect(res.text).toContain('They were early to the session')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('Alex was well-behaved')
              expect(res.text).toContain('No')
            })
        })
      })

      // This is left to keep links in old emails still working - we'll monitor the endpoint and remove it when usage drops off.
      describe('GET /probation-practitioner/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', () => {
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
            sessionFeedback: {
              attendance: {
                attended: 'yes',
                additionalAttendanceInformation: 'They were early to the session',
              },
              behaviour: {
                behaviourDescription: 'Alex was well-behaved',
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
              `/probation-practitioner/action-plan/${actionPlanId}/appointment/${appointmentWithSubmittedFeedback.sessionNumber}/post-session-feedback`
            )
            .expect(200)
            .expect(res => {
              expect(res.text).toContain('View feedback')
              expect(res.text).toContain('caseworkerFirstName caseworkerLastName')
              expect(res.text).toContain('They were early to the session')
              expect(res.text).toContain('Yes, they were on time')
              expect(res.text).toContain('Alex was well-behaved')
              expect(res.text).toContain('No')
            })
        })
      })
    })
  })
})
