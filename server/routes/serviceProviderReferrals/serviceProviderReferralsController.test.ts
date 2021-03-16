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
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import HmppsAuthClient from '../../data/hmppsAuthClient'
import MockedHmppsAuthClient from '../../data/testutils/hmppsAuthClientSetup'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

jest.mock('../../services/interventionsService')
jest.mock('../../services/communityApiService')
jest.mock('../../data/hmppsAuthClient')

const interventionsService = new InterventionsService(apiConfig.apis.interventionsService) as jest.Mocked<
  InterventionsService
>
const communityApiService = new MockCommunityApiService() as jest.Mocked<CommunityApiService>

const hmppsAuthClient = new MockedHmppsAuthClient() as jest.Mocked<HmppsAuthClient>

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({
    overrides: { interventionsService, communityApiService, hmppsAuthClient },
    userType: AppSetupUserType.serviceProvider,
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /service-provider/dashboard', () => {
  it('displays a list of all sent referrals', async () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

    const sentReferrals = [
      sentReferralFactory.build({
        referral: {
          serviceCategoryId: accommodationServiceCategory.id,
          serviceUser: { firstName: 'George', lastName: 'Michael' },
        },
      }),
      sentReferralFactory.build({
        referral: {
          serviceCategoryId: socialInclusionServiceCategory.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
        },
      }),
    ]

    interventionsService.getSentReferrals.mockResolvedValue(sentReferrals)
    interventionsService.getServiceCategory.mockImplementation(async (token, id) => {
      const result = [accommodationServiceCategory, socialInclusionServiceCategory].find(category => category.id === id)
      return result!
    })

    await request(app)
      .get('/service-provider/dashboard')
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('George Michael')
        expect(res.text).toContain('Accommodation')
        expect(res.text).toContain('Jenny Jones')
        expect(res.text).toContain('Social inclusion')
      })
  })
})

describe('GET /service-provider/referrals/:id/details', () => {
  it('displays information about the referral and service user', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const sentReferral = sentReferralFactory.unassigned().build({
      referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
    })
    const deliusUser = deliusUserFactory.build({
      firstName: 'Bernard',
      surname: 'Beaks',
      email: 'bernard.beaks@justice.gov.uk',
    })
    const serviceUser = deliusServiceUser.build({
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

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)

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
      })
  })

  describe('when the referral has been assigned to a caseworker', () => {
    it('mentions the assigned caseworker', async () => {
      const serviceCategory = serviceCategoryFactory.build()
      const sentReferral = sentReferralFactory.assigned().build()
      const deliusUser = deliusUserFactory.build()
      const serviceUser = deliusServiceUser.build()
      const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
      interventionsService.getSentReferral.mockResolvedValue(sentReferral)
      communityApiService.getUserByUsername.mockResolvedValue(deliusUser)
      communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)
      hmppsAuthClient.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

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
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const serviceUser = deliusServiceUser.build()
    const sentReferral = sentReferralFactory.assigned().build({
      referral: { serviceCategoryId: serviceCategory.id },
    })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(sentReferral)
    communityApiService.getServiceUserByCRN.mockResolvedValue(serviceUser)

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
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.build({ referral: { serviceCategoryId: serviceCategory.id } })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthClient.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)

    await request(app)
      .get(`/service-provider/referrals/${referral.id}/assignment/check`)
      .query({ email: 'john@harmonyliving.org.uk' })
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Confirm the accommodation referral assignment')
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
    hmppsAuthClient.getSPUserByEmailAddress.mockRejectedValue(new Error(''))

    await request(app)
      .get(`/service-provider/referrals/123456/assignment/check?email=tom@tom.com`)
      .expect(302)
      .expect('Location', '/service-provider/referrals/123456/details?error=Email%20address%20not%20found')
  })
})

describe('POST /service-provider/referrals/:id/assignment', () => {
  it('assigns the referral to the selected caseworker', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.build({
      referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Alex', lastName: 'River' } },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthClient.getSPUserByEmailAddress.mockResolvedValue(hmppsAuthUser)
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
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: serviceCategory.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
      assignedTo: { username: 'john.smith' },
    })
    const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith', username: 'john.smith' })

    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    hmppsAuthClient.getSPUserByUsername.mockResolvedValue(hmppsAuthUser)

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
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: serviceCategory.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomesIds: [desiredOutcome.id],
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', desiredOutcome, createdAt: '2021-03-01T10:00:00Z' }],
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/add-activities`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Accommodation - create action plan')
        expect(res.text).toContain('Add suggested activities to Alex’s action plan')
        expect(res.text).toContain('Achieve a thing')
        expect(res.text).toContain('Do a thing')
      })
  })
})

describe('POST /service-provider/action-plan/:id/add-activity', () => {
  it('updates the action plan with the specified activity and renders the add activity form again', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: serviceCategory.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
      },
    })
    const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity`)
      .type('form')
      .send({
        description: 'Attend training course',
        'desired-outcome-id': '8eb52caf-b462-4100-a0e9-7022d2551c92',
      })
      .expect(302)
      .expect('Location', `/service-provider/action-plan/${draftActionPlan.id}/add-activities`)

    expect(interventionsService.updateDraftActionPlan).toHaveBeenCalledWith('token', draftActionPlan.id, {
      newActivity: {
        description: 'Attend training course',
        desiredOutcomeId: '8eb52caf-b462-4100-a0e9-7022d2551c92',
      },
    })
  })

  describe('when the user enters no description', () => {
    it('does not update the action plan on the backend and returns a 400 with an error message', async () => {
      const desiredOutcome = { id: '8eb52caf-b462-4100-a0e9-7022d2551c92', description: 'Achieve a thing' }
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] })
      const referral = sentReferralFactory.assigned().build({
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceUser: { firstName: 'Alex', lastName: 'River' },
          desiredOutcomesIds: [desiredOutcome.id],
        },
      })
      const draftActionPlan = actionPlanFactory.justCreated(referral.id).build()

      interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${draftActionPlan.id}/add-activity`)
        .type('form')
        .send({
          description: '',
          'desired-outcome-id': '8eb52caf-b462-4100-a0e9-7022d2551c92',
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
      serviceCategoryId: serviceCategory.id,
      desiredOutcomesIds: [desiredOutcomes[0].id, desiredOutcomes[1].id],
    },
  })

  describe('when there is an activity in the action plan for every desired outcome of the referral', () => {
    it('redirects to the next page of the action plan journey', async () => {
      const actionPlan = actionPlanFactory.build({
        activities: [
          { id: '1', desiredOutcome: desiredOutcomes[0], createdAt: new Date().toISOString(), description: '' },
          { id: '2', desiredOutcome: desiredOutcomes[1], createdAt: new Date().toISOString(), description: '' },
        ],
      })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(302)
        .expect('Location', `/service-provider/action-plan/${actionPlan.id}/review`)
    })
  })

  describe('when there is a desired outcome in the referral for which there is no activity in the action plan', () => {
    it('responds with a 400 and renders an error', async () => {
      const actionPlan = actionPlanFactory.build({ activities: [] })

      interventionsService.getActionPlan.mockResolvedValue(actionPlan)
      interventionsService.getSentReferral.mockResolvedValue(referral)
      interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

      await request(app)
        .post(`/service-provider/action-plan/${actionPlan.id}/add-activities`)
        .expect(400)
        .expect(res => {
          expect(res.text).toContain('You must add at least one activity for the desired outcome “Description 1”')
          expect(res.text).toContain('You must add at least one activity for the desired outcome “Description 2”')
        })
    })
  })
})

describe('GET /service-provider/action-plan/:actionPlanId/review', () => {
  it('renders a summary of the action plan', async () => {
    const desiredOutcome = { id: '1', description: 'Achieve a thing' }
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes: [desiredOutcome] })
    const referral = sentReferralFactory.assigned().build({
      referral: {
        serviceCategoryId: serviceCategory.id,
        serviceUser: { firstName: 'Alex', lastName: 'River' },
        desiredOutcomesIds: [desiredOutcome.id],
      },
    })
    const draftActionPlan = actionPlanFactory.readyToSubmit(referral.id).build({
      activities: [{ id: '1', description: 'Do a thing', desiredOutcome, createdAt: '2021-03-01T10:00:00Z' }],
      numberOfSessions: 10,
    })

    interventionsService.getActionPlan.mockResolvedValue(draftActionPlan)
    interventionsService.getSentReferral.mockResolvedValue(referral)
    interventionsService.getServiceCategory.mockResolvedValue(serviceCategory)

    await request(app)
      .get(`/service-provider/action-plan/${draftActionPlan.id}/review`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Review Alex’s action plan')
        expect(res.text).toContain('Achieve a thing')
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
        serviceCategoryId: serviceCategory.id,
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
