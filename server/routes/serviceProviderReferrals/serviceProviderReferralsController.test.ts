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

describe('GET /service-provider/referrals/:id', () => {
  it('displays information about the referral and service user', async () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
    const sentReferral = sentReferralFactory.build({
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
      .get(`/service-provider/referrals/${sentReferral.id}`)
      .expect(200)
      .expect(res => {
        expect(res.text).toContain('Who do you want to assign this accommodation referral to?')
        expect(res.text).toContain('Bernard Beaks')
        expect(res.text).toContain('bernard.beaks@justice.gov.uk')
        expect(res.text).toContain('alex.river@example.com')
        expect(res.text).toContain('07123456789')
        expect(res.text).toContain('Alex River')
      })
  })
})
