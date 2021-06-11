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
import authUtils from '../../utils/authUtils'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/assessRisksAndNeedsService')

const interventionsService = new InterventionsService(
  apiConfig.apis.interventionsService
) as jest.Mocked<InterventionsService>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

const hmppsAuthService = new MockedHmppsAuthService() as jest.Mocked<HmppsAuthService>

const assessRisksAndNeedsService = new MockAssessRisksAndNeedsService() as jest.Mocked<AssessRisksAndNeedsService>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService, hmppsAuthService, assessRisksAndNeedsService },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /probation-practitioner/find', () => {
  interventionsService.getDraftReferralsForUserToken.mockResolvedValue([])

  it('displays a list in-progress referrals', async () => {
    const referral = draftReferralFactory.serviceUserSelected().build()

    interventionsService.getDraftReferralsForUserToken.mockResolvedValue([referral])

    await request(app)
      .get('/probation-practitioner/find')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Refer and monitor an intervention')
        expect(res.text).toContain('Find interventions')
        expect(res.text).toContain('Alex River')
      })
  })
})

describe('GET /probation-practitioner/dashboard', () => {
  it('displays a dashboard page', async () => {
    const intervention = interventionFactory.build({ id: '1', contractType: { name: 'accommodation' } })
    const referrals = [
      sentReferralFactory.assigned().build({
        referral: {
          interventionId: '1',
          serviceUser: {
            firstName: 'Alex',
            lastName: 'River',
          },
        },
      }),
    ]

    authUtils.getProbationPractitionerUserId = jest.fn()
    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferralsForUserToken.mockResolvedValue(referrals)

    await request(app)
      .get('/probation-practitioner/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation')
      })
  })
})

describe('GET /probation-practitioner/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const serviceUser = deliusServiceUserFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
    })

    interventionsService.getIntervention.mockResolvedValue(intervention)
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
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
      const referral = sentReferralFactory.build({
        referral: {
          serviceCategoryIds: [serviceCategory.id],
          desiredOutcomes: [
            { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id] },
          ],
        },
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
      const deliusServiceUser = deliusServiceUserFactory.build()

      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getIntervention.mockResolvedValue(intervention)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

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

    it('throws error if not all service categories were obtainable', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
      const referral = sentReferralFactory.build({
        referral: {
          serviceCategoryIds: [serviceCategory.id, 'someOtherId'],
        },
      })
      const endOfServiceReport = endOfServiceReportFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getIntervention.mockResolvedValue(intervention)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      await request(app)
        .get(`/probation-practitioner/end-of-service-report/${endOfServiceReport.id}`)
        .expect(500)
        .expect(res => {
          expect(res.text).toContain('Expected service categories are missing in intervention')
        })
    })
  })
})

describe('GET /probation-practitioner/referrals/:id/cancellation/reason', () => {
  it('renders a page where the PP can add comments and cancel a referral', async () => {
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
    const intervention = interventionFactory.build()
    const serviceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(referral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
    interventionsService.getIntervention.mockResolvedValue(intervention)

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

describe('POST /probation-practitioner/referrals/:id/cancellation/submit', () => {
  it('submits a request to cancel the referral on the backend and redirects to the confirmation screen', async () => {
    await request(app)
      .post(`/probation-practitioner/referrals/9747b7fb-51bc-40e2-bbbd-791a9be9284b/cancellation/submit`)
      .type('form')
      .send({ 'cancellation-reason': 'MOV', 'cancellation-comments': 'Alex has moved out of the area' })
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
  })
})

describe('GET /probation-practitioner/referrals/:id/details', () => {
  it('displays information about the referral and service user', async () => {
    const intervention = interventionFactory.build()
    const sentReferral = sentReferralFactory.unassigned().build()
    const supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
    const deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })
    const deliusServiceUser = deliusServiceUserFactory.build({
      firstName: 'Alex',
      surname: 'River',
      contactDetails: {
        emailAddresses: ['alex.river@example.com'],
        phoneNumbers: [
          {
            number: '07123456789',
            type: 'MOBILE',
          },
        ],
      },
    })
    const conviction = deliusConvictionFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    communityApiService.getConvictionById.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This intervention is not yet assigned to a caseworker')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      const intervention = interventionFactory.build()
      const sentReferral = sentReferralFactory.assigned().build()
      const deliusUser = deliusUserFactory.build()
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
      const conviction = deliusConvictionFactory.build()

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
      communityApiService.getConvictionById.mockResolvedValue(conviction)
      assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)

      await request(app)
        .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This intervention is assigned to')
          expect(res.text).toContain('John Smith')
        })
    })
  })
})
