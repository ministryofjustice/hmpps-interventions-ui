import request from 'supertest'
import { Express } from 'express'
import appWithAllRoutes, { AppSetupUserType } from '../testutils/appSetup'
import InterventionsService from '../../services/interventionsService'
import apiConfig from '../../config'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import MockCommunityApiService from '../testutils/mocks/mockCommunityApiService'
import CommunityApiService from '../../services/communityApiService'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import HmppsAuthService from '../../services/hmppsAuthService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'
import actionPlanAppointmentFactory from '../../../testutils/factories/actionPlanAppointment'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import interventionFactory from '../../../testutils/factories/intervention'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import MockAssessRisksAndNeedsService from '../testutils/mocks/mockAssessRisksAndNeedsService'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../services/hmppsAuthService')
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

describe('GET /service-provider/dashboard', () => {
  it('displays a list of all sent referrals', async () => {
    const accommodationIntervention = interventionFactory.build({ id: '1', contractType: { name: 'accommodation' } })
    const womensServicesIntervention = interventionFactory.build({
      id: '2',
      contractType: { name: "women's services" },
    })

    const sentReferrals = [
      sentReferralFactory.build({
        referral: {
          interventionId: accommodationIntervention.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
        },
      }),
      sentReferralFactory.build({
        referral: {
          interventionId: womensServicesIntervention.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
        },
      }),
    ]

    interventionsService.getSentReferralsForUserToken.mockResolvedValue(sentReferrals)
    interventionsService.getIntervention.mockImplementation(async (token, id) => {
      const result = [accommodationIntervention, womensServicesIntervention].find(category => category.id === id)
      return result!
    })

    await request(app)
      .get('/service-provider/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Jenny Jones')
        expect(res.text).toContain('Women&#39;s services')
      })
  })
})

describe('GET /service-provider/referrals/:id/details', () => {
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
      .get(`/service-provider/referrals/${sentReferral.id}/details`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this referral to?')
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
      const deliusServiceUser = deliusServiceUserFactory.build()
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
      const conviction = deliusConvictionFactory.build()
      const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)
      communityApiService.getConvictionById.mockResolvedValue(conviction)
      assessRisksAndNeedsService.getSupplementaryRiskInformation.mockResolvedValue(supplementaryRiskInformation)

      await request(app)
        .get(`/service-provider/referrals/${sentReferral.id}/details`)
        .expect(200)
        .expect(res => {
          expect(res.text).toContain('This intervention is assigned to')
          expect(res.text).toContain('John Smith')
        })
    })
  })
})

describe('GET /service-provider/referrals/:id/progress', () => {
  it('displays information about the intervention progress', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const deliusServiceUser = deliusServiceUserFactory.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { interventionId: intervention.id },
    })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/referrals/${sentReferral.id}/progress`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Session progress')
      })
  })
})

describe('GET /service-provider/referrals/:id/assignment/check', () => {
  it('displays the name of the selected caseworker', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.build({ referral: { interventionId: intervention.id } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${referral.id}/assignment/check`)
      .query({ email: 'john@harmonyliving.org.uk' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm the Accommodation referral assignment')
        expect(res.text).toContain('John Smith')
        expect(res.text).toContain('john@harmonyliving.org.uk')
      })
  })
  it('redirects to referral details page with an error if the assignee email address is missing from the URL', async () => {
    await request(app)
      .get(`/service-provider/referrals/123456/assignment/check`)
      .expect(302)
      .expect('Location', '/service-provider/referrals/123456/details?error=An%20email%20address%20is%20required')
  })
  it('redirects to referral details page with an error if the assignee email address is not found in hmpps auth', async () => {
    hmppsAuthService.getSPUserByEmailAddress.mockRejectedValue(new Error(''))

    await request(app)
      .get(`/service-provider/referrals/123456/assignment/check?email=tom@tom.com`)
      .expect(302)
      .expect('Location', '/service-provider/referrals/123456/details?error=Email%20address%20not%20found')
  })
})

describe('POST /service-provider/referrals/:id/assignment', () => {
  it('assigns the referral to the selected caseworker', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.build({
      referral: { interventionId: intervention.id, serviceUser: { firstName: 'Alex', lastName: 'River' } },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)
    interventionsService.assignSentReferral.mockResolvedValue(referral)

    await request(app)
      .post(`/service-provider/referrals/${referral.id}/assignment`)
      .type('form')
      .send({ email: 'john@harmonyliving.org.uk' })
      .expect(302)
      .expect('Location', `/service-provider/referrals/${referral.id}/assignment/confirmation`)

    expect(interventionsService.assignSentReferral.mock.calls[0][2]).toEqual({
      username: 'john.smith',
      userId: hmppsAuthUser.userId,
      authSource: 'auth',
    })
  })
  it('fails if the assignee email address is missing', async () => {
    await request(app).post(`/service-provider/referrals/123456/assignment`).type('form').send({}).expect(400)
  })
})

describe('GET /service-provider/referrals/:id/assignment/confirmation', () => {
  it('displays details of the assigned caseworker and the referral', async () => {
    const intervention = interventionFactory.build({ contractType: { name: 'accommodation' } })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        interventionId: intervention.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
      assignedTo: { username: 'john.smith' },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthService.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${referral.id}/assignment/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Alex River')
        expect(res.text).toContain(referral.referenceNumber)
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('John Smith')
      })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/add-activities', () => {
  it('displays a page to add activities to an action plan', async () => {
    const desiredOutcome = { id: '1', description: 'Achieve a thing' }
    const serviceCategories = [
      serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] }),
    ]
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategories[0].id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomes: [
          {
            serviceCategoryId: serviceCategories[0].id,
            desiredOutcomesIds: [desiredOutcome.id],
          },
        ],
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', createdAt: '2021-03-01T10:00:00Z' }],
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add activity 2 to action plan')
        expect(res.text).toContain('Referred outcomes for Alex')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Achieve a thing')
      })
  })
})

describe('POST /service-provider/action-plan/:id/add-activity', () => {
  it('updates the action plan with the specified activity and renders the add activity form again', async () => {
    const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation' })]
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategories[0].id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

    await request(app)
      .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity`)
      .type('form')
      .send({
        description: 'Attend training course',
      })
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)

    expect(interventionsService.updateDraftActionPlan).toHaveBeenCalledWith('token', draftActionPlan.id, {
      newActivity: {
        description: 'Attend training course',
      },
    })
  })

  describe('when the user enters no description', () => {
    it('does not update the action plan on the backend and returns a 400 with an error message', async () => {
      const desiredOutcome = { id: '8eb52caf-b462-4100-a0e9-7022d2551c92', description: 'Achieve a thing' }
      const serviceCategories = [
        serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] }),
      ]
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryIds: [serviceCategories[0].id],
          serviceUser: { firstName: 'Alex', lastName: 'River' },
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategories[0].id,
              desiredOutcomesIds: [desiredOutcome.id],
            },
          ],
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategories[0])

      await request(app)
        .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity`)
        .type('form')
        .send({
          description: '',
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Enter an activity')
        })

      expect(interventionsService.updateDraftActionPlan).not.toHaveBeenCalled()
    })
  })
})

describe('POST /service-provider/action-plan/:id/add-activities', () => {
  const desiredOutcomes = [
    {
      id: '1',
      description: 'Description 1',
    },
    {
      id: '2',
      description: 'Description 2',
    },
    {
      id: '3',
      description: 'Description 3',
    },
  ]
  const serviceCategory = serviceCategoryFactory.build({ desiredOutcomes })
  const referral = sentReferralFactory.build({
    referral: {
      serviceCategoryIds: [serviceCategory.id],
      desiredOutcomes: [
        {
          serviceCategoryId: serviceCategory.id,
          desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
        },
      ],
    },
  })

  describe('when there is at least one activity in the action plan', () => {
    it('redirects to the next page of the action plan journey', async () => {
      const actionPlan = actionPlanFactory.build({
        activities: [
          { id: '1', createdAt: new Date().toISOString(), description: '' },
          { id: '2', createdAt: new Date().toISOString(), description: '' },
        ],
      })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(302)
        .expect('Location', `/service-provider/action-plan/${actionPlan.id}/number-of-sessions`)
    })
  })

  describe('when there is no activity in the action plan', () => {
    it('responds with a 400 and renders an error', async () => {
      const actionPlan = actionPlanFactory.build({ activities: [] })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('You must add at least one activity')
        })
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/number-of-sessions', () => {
  it('displays a page to set the number of sessions on an action plan', async () => {
    const deliusServiceUser = deliusServiceUserFactory.build()
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/number-of-sessions`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Accommodation - create action plan')
        expect(res.text).toContain('Add number of sessions for Alex’s action plan')
      })
  })
})

describe('POST /service-provider/action-plan/:actionPlanId/number-of-sessions', () => {
  describe('when a valid number of sessions is given', () => {
    it('updates the action plan on the interventions service and redirects to the next page of the journey', async () => {
      await request(app)
        .post(`/service-provider/action-plan/1/number-of-sessions`)
        .type('form')
        .send({ 'number-of-sessions': '10' })
        .expect(302)
        .expect('Location', `/service-provider/action-plan/1/review`)

      expect(interventionsService.updateDraftActionPlan).toHaveBeenCalledWith('token', '1', { numberOfSessions: 10 })
    })
  })

  describe('when an invalid number of sessions is given', () => {
    it('does not try to update the action plan on the interventions service, and renders an error message', async () => {
      const deliusServiceUser = deliusServiceUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Alex', lastName: 'River' },
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)
      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/1/number-of-sessions`)
        .type('form')
        .send({ 'number-of-sessions': '0' })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The number of sessions must be 1 or more')
        })

      expect(interventionsService.updateDraftActionPlan).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/review', () => {
  it('renders a summary of the action plan', async () => {
    const desiredOutcome = { id: '1', description: 'Achieve a thing' }
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id] }],
      },
    })
    const draftActionPlan = actionPlanFactory.readyToSubmit(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', createdAt: '2021-03-01T10:00:00Z' }],
      numberOfSessions: 10,
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/review`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm action plan')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Achieve a thing')
        expect(res.text).toContain('Activity 1')
        expect(res.text).toContain('Do a thing')
        expect(res.text).toContain('Suggested number of sessions: 10')
      })
  })
})

describe('POST /service-provider/action-plan/:actionPlanId/submit', () => {
  it('submits the action plan and redirects to the confirmation page', async () => {
    const submittedActionPlan = actionPlanFactory.submitted().build()

    interventionsService.submitActionPlan.mockResolvedValue(submittedActionPlan)

    await request(app)
      .post(`/service-provider/action-plan/${submittedActionPlan.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${submittedActionPlan.id}/confirmation`)

    expect(interventionsService.submitActionPlan).toHaveBeenCalledWith('token', submittedActionPlan.id)
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/confirmation', () => {
  it('renders a page confirming that the action plan has been submitted', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })

    interventionsService.getActionPlan.mockResolvedValue(submittedActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${submittedActionPlan.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Action plan submitted for approval')
      })
  })
})

describe('GET /service-provider/action-plan/:id/sessions/:sessionNumber/edit', () => {
  it('renders a form', async () => {
    const appointment = actionPlanAppointmentFactory.build()

    interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)
    interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
    interventionsService.getActionPlan.mockResolvedValue(actionPlanFactory.build())

    await request(app)
      .get(`/service-provider/action-plan/1/sessions/1/edit`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Add session 1 details')
      })
  })
})

describe('POST /service-provider/action-plan/:id/sessions/:sessionNumber/edit', () => {
  describe('with valid data', () => {
    it('updates the appointment on the interventions service and redirects to the intervention progress page', async () => {
      const actionPlan = actionPlanFactory.build()

      const updatedAppointment = actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
      })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.updateActionPlanAppointment.mockResolvedValue(updatedAppointment)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/sessions/1/edit`)
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
        })
        .expect(302)
        .expect('Location', `/service-provider/referrals/${actionPlan.referralId}/progress`)

      expect(interventionsService.updateActionPlanAppointment).toHaveBeenCalledWith('token', actionPlan.id, 1, {
        appointmentTime: '2021-03-24T09:02:00.000Z',
        durationInMinutes: 75,
      })
    })

    describe('when the interventions service responds with a 409 status code', () => {
      it('renders a specific error message', async () => {
        interventionsService.getActionPlanAppointment.mockResolvedValue(actionPlanAppointmentFactory.build())
        interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())
        interventionsService.getActionPlan.mockResolvedValue(actionPlanFactory.build())

        const error = { status: 409 }
        interventionsService.updateActionPlanAppointment.mockRejectedValue(error)

        await request(app)
          .post(`/service-provider/action-plan/1/sessions/1/edit`)
          .send({
            'date-day': '24',
            'date-month': '3',
            'date-year': '2021',
            'time-hour': '9',
            'time-minute': '02',
            'time-part-of-day': 'am',
            'duration-hours': '1',
            'duration-minutes': '15',
          })
          .expect(400)
          .expect(res => {
            expect(res.text).toContain('The proposed date and time you selected clashes with another appointment.')
          })
      })
    })

    describe('when the interventions service responds with an error that isn’t a 409 status code', () => {
      it('renders an error message', async () => {
        interventionsService.getActionPlan.mockResolvedValue(actionPlanFactory.build())

        const error = new Error('Failed to update appointment')
        interventionsService.updateActionPlanAppointment.mockRejectedValue(error)

        await request(app)
          .post(`/service-provider/action-plan/1/sessions/1/edit`)
          .send({
            'date-day': '24',
            'date-month': '3',
            'date-year': '2021',
            'time-hour': '9',
            'time-minute': '02',
            'time-part-of-day': 'am',
            'duration-hours': '1',
            'duration-minutes': '15',
          })
          .expect(500)
          .expect(res => {
            expect(res.text).toContain('Failed to update appointment')
          })
      })
    })
  })

  describe('with invalid data', () => {
    it('does not try to update the action plan on the interventions service, and renders an error message', async () => {
      const actionPlan = actionPlanFactory.build()
      const appointment = actionPlanAppointmentFactory.build()

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getActionPlanAppointment.mockResolvedValue(appointment)
      interventionsService.getSentReferral.mockResolvedValue(sentReferralFactory.build())

      await request(app)
        .post(`/service-provider/action-plan/1/sessions/1/edit`)
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
        })
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('The session date must be a real date')
        })

      expect(interventionsService.updateActionPlanAppointment).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', () => {
  it('renders a page with which the Service Provider can record the Service User‘s attendance', async () => {
    const deliusServiceUser = deliusServiceUserFactory.build()
    const referral = sentReferralFactory.assigned().build()
    const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id })
    const appointment = actionPlanAppointmentFactory.build({
      appointmentTime: '2021-02-01T13:00:00Z',
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
        expect(res.text).toContain('01 Feb 2021')
        expect(res.text).toContain('13:00')
      })
  })
})

describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/attendance', () => {
  describe('when the Service Provider marks the Service User as having attended the session', () => {
    it('makes a request to the interventions service to record the Service User‘s attendance and redirects to the behaviour page', async () => {
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

      interventionsService.recordAppointmentAttendance.mockResolvedValue(updatedAppointment)

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

  describe('when the Service Provider marks the Service User as not having attended the session', () => {
    it('makes a request to the interventions service to record the Service User‘s attendance and redirects to the check-your-answers page', async () => {
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

      interventionsService.recordAppointmentAttendance.mockResolvedValue(updatedAppointment)

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

describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', () => {
  it('renders a page with which the Service Provider can record the Service User‘s behaviour', async () => {
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

describe('POST /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback/behaviour', () => {
  it('makes a request to the interventions service to record the Service User‘s behaviour and redirects to the check your answers page', async () => {
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

    interventionsService.recordAppointmentBehaviour.mockResolvedValue(updatedAppointment)

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

describe('GET /service-provider/action-plan:actionPlanId/appointment/:sessionNumber/post-session-feedback/check-your-answers', () => {
  it('renders a page with answers the user has so far selected', async () => {
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
        `/service-provider/action-plan/${submittedActionPlan.id}/appointment/${appointment.sessionNumber}/post-session-feedback/check-your-answers`
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

    expect(interventionsService.submitSessionFeedback).toHaveBeenCalledWith('token', actionPlanId, sessionNumber)
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
        .get(`/service-provider/action-plan/${submittedActionPlan.id}/appointment/2/post-session-feedback/confirmation`)
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
          expect(res.text).toContain('You can now deliver the next session scheduled for 31 Mar 2021.')
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

describe('GET /service-provider/action-plan/:actionPlanId/appointment/:sessionNumber/post-session-feedback', () => {
  it('renders a page displaying feedback answers', async () => {
    const referral = sentReferralFactory.assigned().build()
    const submittedActionPlan = actionPlanFactory.submitted().build({ referralId: referral.id, numberOfSessions: 1 })
    const deliusServiceUser = deliusServiceUserFactory.build()

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

describe('POST /service-provider/referrals/:id/end-of-service-report', () => {
  it('creates an end of service report for that referral on the interventions service, and redirects to the first page of the service provider end of service report journey', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    interventionsService.createDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

    await request(app)
      .post(`/service-provider/referrals/19/end-of-service-report`)
      .expect(303)
      .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)

    expect(interventionsService.createDraftEndOfServiceReport).toHaveBeenCalledWith('token', '19')
  })
})

describe('GET /service-provider/end-of-service-report/:id/outcomes/:number', () => {
  it('renders a form', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const desiredOutcome = serviceCategory.desiredOutcomes[0]
    const referral = sentReferralFactory.build({
      referral: {
        desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] }],
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    const endOfServiceReport = endOfServiceReportFactory.build()
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getIntervention.mockResolvedValue(intervention)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Social inclusion: End of service report')
        expect(res.text).toContain('About desired outcome 1')
        expect(res.text).toContain(desiredOutcome.description)
      })
  })

  describe('when the outcome number is greater than the number of desired outcomes in the referral', () => {
    it('returns a 400 status code', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = sentReferralFactory.build({
        referral: { desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['1', '2', '3'] }] },
      })
      const endOfServiceReport = endOfServiceReportFactory.build()

      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)

      await request(app).get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`).expect(400)
    })
  })
})

describe('POST /service-provider/end-of-service-report/:id/outcomes/:number', () => {
  describe('with valid data', () => {
    describe('when the outcome number doesn’t refer to the last of the referral’s desired outcomes', () => {
      it('updates the appointment on the interventions service and redirects to the page for the next outcome', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] },
            ],
            serviceCategoryIds: [serviceCategory.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/2`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
              progressionComments: 'Some progression comments',
            },
          }
        )
      })
    })

    describe('when the outcome refers to the last of the referral’s desired outcomes', () => {
      it('updates the appointment on the interventions service and redirects to the further information form', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
        const desiredOutcome = serviceCategory.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['2', '3', desiredOutcome.id] },
            ],
            serviceCategoryIds: [serviceCategory.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/3`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              progressionComments: 'Some progression comments',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
            },
          }
        )
      })
    })

    describe('when the outcome number is greater than the number of desired outcomes in the referral', () => {
      it('returns a 400 and doesn’t try to update the end of service report', async () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [{ serviceCategoryId: serviceCategory.id, desiredOutcomesIds: ['1', '2', '3'] }],
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(400)

        expect(interventionsService.updateDraftEndOfServiceReport).not.toHaveBeenCalled()
      })
    })

    describe('when the outcome number exists on the second service category', () => {
      it('should find the correct desired outcome and return the correct service category', async () => {
        const serviceCategory1 = serviceCategoryFactory.build()
        const serviceCategory2 = serviceCategoryFactory.build({
          desiredOutcomes: [
            {
              id: '27186755-7b67-497f-ad6f-6c0fde016f89',
              description: 'Service User makes progress in obtaining accommodation',
            },
            {
              id: '73a836a4-0b5d-49a5-a4d7-1564876f3e69',
              description: 'Service User is helped to secure social or supported housing',
            },
          ],
        })
        const intervention = interventionFactory.build({ serviceCategories: [serviceCategory1, serviceCategory2] })
        const desiredOutcome = serviceCategory2.desiredOutcomes[0]
        const referral = sentReferralFactory.build({
          referral: {
            desiredOutcomes: [
              { serviceCategoryId: serviceCategory1.id, desiredOutcomesIds: ['1', '2', '3'] },
              { serviceCategoryId: serviceCategory2.id, desiredOutcomesIds: [desiredOutcome.id, '5'] },
            ],
            serviceCategoryIds: [serviceCategory1.id, serviceCategory2.id],
            interventionId: intervention.id,
          },
        })
        const endOfServiceReport = endOfServiceReportFactory.build()

        interventionsService.getIntervention.mockResolvedValue(intervention)
        interventionsService.getSentReferral.mockResolvedValue(referral)
        interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
        interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

        await request(app)
          .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/4`)
          .type('form')
          .send({
            'achievement-level': 'PARTIALLY_ACHIEVED',
            'progression-comments': 'Some progression comments',
            'additional-task-comments': 'Some additional task comments',
          })
          .expect(302)
          .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/5`)

        expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith(
          'token',
          endOfServiceReport.id,
          {
            outcome: {
              achievementLevel: 'PARTIALLY_ACHIEVED',
              additionalTaskComments: 'Some additional task comments',
              desiredOutcomeId: desiredOutcome.id,
              progressionComments: 'Some progression comments',
            },
          }
        )
      })
    })
  })

  describe('with invalid data', () => {
    it('renders an error page and does not update the appointment on the interventions service', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
      const desiredOutcome = serviceCategory.desiredOutcomes[0]
      const referral = sentReferralFactory.build({
        referral: {
          serviceUser: { firstName: 'Alex' },
          desiredOutcomes: [
            { serviceCategoryId: serviceCategory.id, desiredOutcomesIds: [desiredOutcome.id, '2', '3'] },
          ],
          serviceCategoryIds: [serviceCategory.id],
          interventionId: intervention.id,
        },
      })
      const endOfServiceReport = endOfServiceReportFactory.build()
      const deliusServiceUser = deliusServiceUserFactory.build()

      interventionsService.getIntervention.mockResolvedValue(intervention)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)
      communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

      await request(app)
        .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/outcomes/1`)
        .type('form')
        .send({})
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('Select whether Alex achieved the desired outcome')
        })

      expect(interventionsService.updateDraftEndOfServiceReport).not.toHaveBeenCalled()
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/further-information', () => {
  it('renders a form page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    const deliusServiceUser = deliusServiceUserFactory.build()

    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)
    communityApiService.getServiceUserByCRN.mockResolvedValue(deliusServiceUser)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain(
          'Would you like to give any additional information about this intervention (optional)?'
        )
      })
  })
})

describe('POST /service-provider/end-of-service-report/:id/further-information', () => {
  it('updates the appointment on the interventions service and redirects to the check your answers page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()

    interventionsService.updateDraftEndOfServiceReport.mockResolvedValue(endOfServiceReport)

    await request(app)
      .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/further-information`)
      .type('form')
      .send({ 'further-information': 'Some further information' })
      .expect(302)
      .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/check-answers`)

    expect(interventionsService.updateDraftEndOfServiceReport).toHaveBeenCalledWith('token', endOfServiceReport.id, {
      furtherInformation: 'Some further information',
    })
  })
})

describe('GET /service-provider/end-of-service-report/:id/check-answers', () => {
  it('renders a page with the contents of the end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const referral = sentReferralFactory.build({
      referral: {
        desiredOutcomes: [
          {
            serviceCategoryId: serviceCategory.id,
            desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id],
          },
        ],
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
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
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/check-answers`)
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

describe('POST /service-provider/end-of-service-report/:id/submit', () => {
  it('submits the end of service report on the interventions service, and redirects to the confirmation page', async () => {
    const endOfServiceReport = endOfServiceReportFactory.build()
    interventionsService.submitEndOfServiceReport.mockResolvedValue(endOfServiceReport)

    await request(app)
      .post(`/service-provider/end-of-service-report/${endOfServiceReport.id}/submit`)
      .expect(302)
      .expect('Location', `/service-provider/end-of-service-report/${endOfServiceReport.id}/confirmation`)

    expect(interventionsService.submitEndOfServiceReport).toHaveBeenCalledWith('token', endOfServiceReport.id)
  })
})

describe('GET /service-provider/end-of-service-report/:id/confirmation', () => {
  it('displays a confirmation page for that end of service report', async () => {
    const serviceCategory = serviceCategoryFactory.build()
    const intervention = interventionFactory.build({ serviceCategories: [serviceCategory] })
    const endOfServiceReport = endOfServiceReportFactory.build()
    const referral = sentReferralFactory.build({
      referral: {
        serviceCategoryIds: [serviceCategory.id],
        interventionId: intervention.id,
      },
    })
    interventionsService.getEndOfServiceReport.mockResolvedValue(endOfServiceReport)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getIntervention.mockResolvedValue(intervention)

    await request(app)
      .get(`/service-provider/end-of-service-report/${endOfServiceReport.id}/confirmation`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('End of service report submitted')
      })
  })
})
