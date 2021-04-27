import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'

import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')

const interventionsService = new InterventionsService(apiConfig.apis.interventionsService) as jest.Mocked<
  InterventionsService
>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/find', () => {
  interventionsService.getDraftReferralsForUser.mockResolvedValue([])

  it('displays a dashboard page', async () => {
    await request(app)
      .get('/probation-practitioner/find')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Refer and monitor an intervention')
        expect(res.text).toContain('Find interventions')
      })
  })

  it('displays a list in-progress referrals', async () => {
    const referral = draftReferralFactory.serviceUserSelected().build()

    interventionsService.getDraftReferralsForUser.mockResolvedValue([referral])

    await request(app)
      .get('/probation-practitioner/find')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
      })
  })
})

describe('GET /probation-practitioner/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const serviceUser = deliusServiceUserFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { serviceCategoryId: serviceCategory.id },
    })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Intervention sessions')
        expect(res.text).toContain('These show the progress of each intervention session')
      })
  })
})

describe('GET /probation-practitioner/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', () => {
  it('renders a page displaying feedback answers', async () => {
    const actionPlanId = '05f39e99-b5c7-4a9b-a857-bec04a28eb34'
    const referral = sentReferralFactory.assigned().build({ actionPlanId, assignedTo: { username: 'Kay.Swerker' } })
    const submittedActionPlan = actionPlanFactory
      .submitted()
      .build({ id: actionPlanId, referralId: referral.id, numberOfSessions: 1 })
    const serviceUser = deliusServiceUserFactory.build()

    const appointmentWithSubmittedFeedback = actionPlanAppointmentFactory.build({
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

    await request(app)
      .get(
        `/probation-practitioner/action-plan/${actionPlanId}/appointment/${appointmentWithSubmittedFeedback.sessionNumber}/post-session-feedback`
      )
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('View feedback')
        expect(res.text).toContain('Kay.Swerker')
        expect(res.text).toContain('They were early to the session')
        expect(res.text).toContain('Yes, they were on time')
        expect(res.text).toContain('Alex was well-behaved')
        expect(res.text).toContain('No')
      })
  })

  describe('GET /probation-practitioner/end-of-service-report/:id', () => {
    it('renders a page with the contents of the end of service report', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = sentReferralFactory.build({
        referral: { desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id] },
      })
      const endOfServiceReport = endOfServiceReportFactory.build({
        outcomes: [
          {
            desiredOutcome: serviceCategory.desiredOutcomes[0],
            achievementLevel: 'ACHIEVED',
            progressionComments: 'Some progression comments',
            additionalTaskComments: 'Some task comments',
          },
        ],
        furtherInformation: 'Some further information',
      })

      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .get(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('Achieved')
          expect(res.text).toContain(serviceCategory.desiredOutcomes[0].description)
          expect(res.text).toContain('Some progression comments')
          expect(res.text).toContain('Some task comments')
          expect(res.text).toContain('Some further information')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/cancellation/reason', () => {
  it('renders a page where the PP can add comments and cancel a referral', async () => {
    const referral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getReferralCancellationReasons.mockResolvedValue([
      { code: 'MIS', description: 'Referral was made by mistake' },
      { code: 'MOV', description: 'Service user has moved out of delivery area' },
    ])

    await request(app)
      .get(`/probation-practitioner/referrals/${referral.id}/cancellation/reason`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Referral cancellation')
        expect(res.text).toContain('What is the reason for the cancellation of this referral?')
        expect(res.text).toContain('Referral was made by mistake')
        expect(res.text).toContain('Service user has moved out of delivery area')
        expect(res.text).toContain('Additional comments (optional)')
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/cancellation/check-your-answers', () => {
  it('passes through params to a page where the PP can confirm whether or not to cancel a referral', async () => {
    const referral = sentReferralFactory.assigned().build()
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .post(`/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/cancellation/check-your-answers`)
      .type('form')
      .send({ 'cancellation-reason': 'MOV', 'cancellation-comments': 'Alex has moved out of the area' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Referral Cancellation')
        expect(res.text).toContain('Are you sure you want to cancel this referral?')
        expect(res.text).toContain('MOV')
        expect(res.text).toContain('Alex has moved out of the area')
      })
  })
})
