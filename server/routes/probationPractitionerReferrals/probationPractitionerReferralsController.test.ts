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
import interventionFactory from '../../../testutils/factories/intervention'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import HmppsAuthService from '../../services/hmppsAuthService'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'

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
    const intervention = interventionFactory.build({ id: '1', title: 'accommodation services - west midlands' })
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

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferralsForUserToken.mockResolvedValue(referrals)

    await request(app)
      .get('/probation-practitioner/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Accommodation Services - West Midlands')
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
    const supplierAssessment = supplierAssessmentFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getSupplierAssessment.mockResolvedValue(supplierAssessment)
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
    const expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
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
        addresses: [
          {
            addressNumber: 'Flat 10',
            buildingName: null,
            streetName: 'Test Walk',
            postcode: 'SW16 1AQ',
            town: 'London',
            district: 'City of London',
            county: 'Greater London',
            from: '2021-01-01',
            to: null,
            noFixedAbode: false,
          },
        ],
      },
    })
    const conviction = deliusConvictionFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(expandedDeliusServiceUser)
    communityApiService.getConvictionById.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummaryFactory.build())

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
        expect(res.text).toContain("service user's Risk of Serious Harm (ROSH) levels")
        expect(res.text).toContain('Children')
        expect(res.text).toContain('HIGH')
        expect(res.text).toContain('The following information is not seen by the service provider.')
        expect(res.text).toContain('can happen at the drop of a hat')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      const intervention = interventionFactory.build()
      const sentReferral = sentReferralFactory.assigned().build()
      const deliusUser = deliusUserFactory.build()
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
      const deliusServiceUser = expandedDeliusServiceUserFactory.build()
      const riskSummary = riskSummaryFactory.build()
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
      const conviction = deliusConvictionFactory.build()

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
      communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
      communityApiService.getConvictionById.mockResolvedValue(conviction)
      assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
      assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)

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

describe('GET /probation-practitioner/referrals/:id/action-plan', () => {
  it('displays information about the action plan and service user', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/action-plan`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('Action plan status')
        expect(res.text).toContain('Awaiting approval')
        expect(res.text).toContain('Do you want to approve this action plan?')
      })
  })
})

describe('POST /probation-practitioner/referrals/:id/action-plan/approve', () => {
  it('calls interventions service to approve action plan', async () => {
    const sentReferral = sentReferralFactory.assigned().build({ actionPlanId: '724bf133-65cb-43d4-bff9-ca692ad1d381' })
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)

    await request(app)
      .post(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approve`)
      .type('form')
      .send({ 'confirm-approval': 'confirmed' })
      .expect(302)
    expect(interventionsService.approveActionPlan.mock.calls.length).toBe(1)
    expect(interventionsService.approveActionPlan.mock.calls[0][1]).toBe('724bf133-65cb-43d4-bff9-ca692ad1d381')
  })
  it("redirects back to action-plan if approval hasn't been confirmed", async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .post(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approve`)
      .type('form')
      .send({})
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('There is a problem')
        expect(res.text).toContain('Select the checkbox to confirm before you approve the action plan')
      })
    expect(interventionsService.approveActionPlan.mock.calls.length).toBe(0)
  })
})

describe('GET /probation-practitioner/referrals/:id/action-plan/approved', () => {
  it('displays a panel and link back to the intervention progress page', async () => {
    const sentReferral = sentReferralFactory.assigned().build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/action-plan/approved`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('X123456') // su details banner
        expect(res.text).toContain('Action plan approved')
        expect(res.text).toContain('Return to intervention progress')
        expect(res.text).toContain(`/probation-practitioner/referrals/${sentReferral.id}/progress`)
      })
  })
})
