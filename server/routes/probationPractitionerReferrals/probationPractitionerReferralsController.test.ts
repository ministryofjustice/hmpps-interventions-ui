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
import SentReferral from '../../models/sentReferral'
import DeliusUser from '../../models/delius/deliusUser'
import { ExpandedDeliusServiceUser } from '../../models/delius/deliusServiceUser'
import { SupplementaryRiskInformation } from '../../models/assessRisksAndNeeds/supplementaryRiskInformation'
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import supplierAssessmentFactory from '../../../testutils/factories/supplierAssessment'
import initialAssessmentAppointmentFactory from '../../../testutils/factories/initialAssessmentAppointment'
import deliusOffenderManagerFactory from '../../../testutils/factories/deliusOffenderManager'
import { DeliusOffenderManager } from '../../models/delius/deliusOffenderManager'
import DraftsService from '../../services/draftsService'
import { createDraftFactory } from '../../../testutils/factories/draft'
import draftCancellationDataFactory from '../../../testutils/factories/draftCancellationData'
import approvedActionPlanSummaryFactory from '../../../testutils/factories/approvedActionPlanSummary'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/assessRisksAndNeedsService')
jest.mock('../../services/draftsService')

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
    const intervention = interventionFactory.build({ id: '1', title: 'Accommodation Services - West Midlands' })
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

describe('GET /probation-practitioner/referrals/:referralId/appointment/:sessionNumber/post-session-feedback', () => {
  it('renders a page displaying feedback answers', async () => {
    const actionPlanId = '05f39e99-b5c7-4a9b-a857-bec04a28eb34'
    const referral = sentReferralFactory.assigned().build({ actionPlanId, assignedTo: { username: 'Kay.Swerker' } })
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

    await request(app)
      .get(
        `/probation-practitioner/referrals/${referral.id}/appointment/${appointmentWithSubmittedFeedback.sessionNumber}/post-session-feedback`
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

describe('GET /probation-practitioner/referrals/:id/supplier-assessment/post-assessment-feedback', () => {
  it('renders a page showing the initial assessment feedback', async () => {
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
  it('renders an error if there is no current appointment for the initial assessment', async () => {
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
        expect(res.text).toContain('Attempting to view initial assessment feedback without a current appointment')
      })
  })
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

describe('GET /probation-practitioner/referrals/:id/details', () => {
  const intervention = interventionFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
  const conviction = deliusConvictionFactory.build()
  const riskSummary: RiskSummary = riskSummaryFactory.build()
  let sentReferral: SentReferral
  let deliusUser: DeliusUser
  let expandedDeliusServiceUser: ExpandedDeliusServiceUser
  let supplementaryRiskInformation: SupplementaryRiskInformation
  let responsibleOfficer: DeliusOffenderManager

  beforeEach(() => {
    sentReferral = sentReferralFactory.build()
    deliusUser = deliusUserFactory.build()
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
    responsibleOfficer = deliusOffenderManagerFactory.responsibleOfficer().build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(expandedDeliusServiceUser)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
    communityApiService.getConvictionById.mockResolvedValue(conviction)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    assessRisksAndNeedsService.getRiskSummary.mockResolvedValue(riskSummary)
    communityApiService.getResponsibleOfficerForServiceUser.mockResolvedValue(responsibleOfficer)
  })

  it('displays information about the referral and service user', async () => {
    sentReferral = sentReferralFactory.unassigned().build()
    supplementaryRiskInformation = supplementaryRiskInformationFactory.build({
      riskSummaryComments: 'Alex is low risk to others.',
    })
    deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })
    expandedDeliusServiceUser = expandedDeliusServiceUserFactory.build({
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
    responsibleOfficer = deliusOffenderManagerFactory
      .responsibleOfficer()
      .build({ staff: { forenames: 'Peter', surname: 'Practitioner' } })

    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getExpandedServiceUserByCRN.mockResolvedValue(expandedDeliusServiceUser)
    assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)
    communityApiService.getResponsibleOfficerForServiceUser.mockResolvedValue(responsibleOfficer)

    await request(app)
      .get(`/probation-practitioner/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('This intervention is not yet assigned to a caseworker')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('Peter Practitioner')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain('Alex is low risk to others.')
        expect(res.text).toContain("service user's Risk of Serious Harm (ROSH) levels")
        expect(res.text).toContain('Children')
        expect(res.text).toContain('HIGH')
        expect(res.text).toContain('07890 123456')
        expect(res.text).toContain('probation-team4692@justice.gov.uk')
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      sentReferral = sentReferralFactory.assigned().build()
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
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
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    const approvedActionPlanSummaries = approvedActionPlanSummaryFactory.buildList(2)
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue(approvedActionPlanSummaries)
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
    const serviceCategory = serviceCategoryFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()
    const actionPlan = actionPlanFactory.submitted().build({ referralId: sentReferral.id })
    sentReferral.actionPlanId = actionPlan.id

    interventionsService.getActionPlan.mockResolvedValue(actionPlan)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    interventionsService.getApprovedActionPlanSummaries.mockResolvedValue([])

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

describe('GET /probation-practitioner/referrals/:id/supplier-assessment', () => {
  it('shows a summary of the current supplier assessment appointment', async () => {
    const hmppsAuthUser = hmppsAuthUserFactory.build({
      firstName: 'Liam',
      lastName: 'Johnson',
      username: 'liam.johnson',
    })
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

    const referral = sentReferralFactory.build({ assignedTo: { username: hmppsAuthUser.username } })
    interventionsService.getSentReferral.mockResolvedValue(referral)

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
      .get(`/probation-practitioner/referrals/1/supplier-assessment`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Liam Johnson')
        expect(res.text).toContain('24 March 2021')
        expect(res.text).toContain('9:02am to 10:17am')
      })
  })
})
