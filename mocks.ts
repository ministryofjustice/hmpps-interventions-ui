import Wiremock from './mockApis/wiremock'
import InterventionsServiceMocks from './mockApis/interventionsService'
/*
import sentReferralFactory from './testutils/factories/sentReferral'
import deliusUserFactory from './testutils/factories/deliusUser'
import actionPlanFactory from './testutils/factories/actionPlan'
*/
import interventionFactory from './testutils/factories/intervention'
import actionPlanAppointmentFactory from './testutils/factories/actionPlanAppointment'
import draftReferralFactory from './testutils/factories/draftReferral'
import serviceCategoryFactory from './testutils/factories/serviceCategory'
import CommunityApiMocks from './mockApis/communityApi'
import deliusConvictionFactory from './testutils/factories/deliusConviction'
import deliusResponsibleOfficerFactory from './testutils/factories/deliusResponsibleOfficer'
import AssessRisksAndNeedsServiceMocks from './mockApis/assessRisksAndNeedsService'
import riskSummaryFactory from './testutils/factories/riskSummary'
import prisonFactory from './testutils/factories/prison'
import prisonerFactory from './testutils/factories/prisoner'
import supplementaryRiskInformationFactory from './testutils/factories/supplementaryRiskInformation'
import deliusServiceUser from './testutils/factories/deliusServiceUser'
import PrisonRegisterServiceMocks from './mockApis/prisonRegisterService'
import PrisonerOffenderSearchMocks from './mockApis/prisonerOffenderSearch'
import ReferAndMonitorAndDeliusMocks from './mockApis/referAndMonitorAndDelius'
import deliusUserAccess from './testutils/factories/deliusUserAccess'

const wiremock = new Wiremock('http://localhost:9092/__admin')
const interventionsMocks = new InterventionsServiceMocks(wiremock, '')
const communityApiMocks = new CommunityApiMocks(wiremock, '')
const assessRisksAndNeedsApiMocks = new AssessRisksAndNeedsServiceMocks(wiremock, '')
const prisonRegisterServiceMocks = new PrisonRegisterServiceMocks(wiremock, '')
const prisonerOffenderSearchMocks = new PrisonerOffenderSearchMocks(wiremock, '')
const referAndMonitorAndDeliusMocks = new ReferAndMonitorAndDeliusMocks(wiremock, '')

export default async function setUpMocks(): Promise<void> {
  await wiremock.resetStubs()

  const accommodationServiceCategory = serviceCategoryFactory.build({
    name: 'accommodation',
    id: '5fd9e664-0a73-4476-9f05-a330f556f34a',
  })
  const socialInclusionServiceCategory = serviceCategoryFactory.build({
    name: 'social inclusion',
    id: '62e042a7-c44f-4d82-a679-4f435167e44a',
  })
  const intervention = interventionFactory.build({
    serviceCategories: [accommodationServiceCategory, socialInclusionServiceCategory],
  })

  const draftReferral = draftReferralFactory
    .serviceCategorySelected(accommodationServiceCategory.id)
    .serviceCategoriesSelected([accommodationServiceCategory.id, socialInclusionServiceCategory.id])
    .filledFormUpToNeedsAndRequirements()
    .build({
      id: '98a42c61-c30f-4beb-8062-04033c376e2d',
      serviceUser: {
        crn: 'CRN11',
        title: 'Mr',
        firstName: 'Ken',
        lastName: 'River',
        dateOfBirth: '1980-01-01',
        gender: 'Male',
        ethnicity: 'British',
        preferredLanguage: 'English',
        religionOrBelief: 'Agnostic',
        disabilities: ['Autism spectrum condition', 'sciatica'],
      },
    })
  await Promise.all([
    assessRisksAndNeedsApiMocks.stubGetRiskSummary('CRN24', riskSummaryFactory.build()),
    assessRisksAndNeedsApiMocks.stubGetSupplementaryRiskInformation(
      '5f2debc5-4c6a-4972-84ce-0689b8f9ec52',
      supplementaryRiskInformationFactory.build()
    ),
    communityApiMocks.stubGetActiveConvictionsByCRN('CRN24', [deliusConvictionFactory.build()]),
    communityApiMocks.stubGetServiceUserByCRN('CRN24', deliusServiceUser.build({ otherIds: { crn: 'CRN24' } })),
    communityApiMocks.stubGetConvictionById('CRN24', '([0-9]+)', deliusConvictionFactory.build()),
    referAndMonitorAndDeliusMocks.stubGetResponsibleOfficer('X320741', deliusResponsibleOfficerFactory.build()),
    interventionsMocks.stubGetActionPlanAppointment(
      '1',
      1,
      actionPlanAppointmentFactory.build({
        sessionNumber: 1,
        appointmentTime: '2021-03-24T09:02:02Z',
        durationInMinutes: 75,
      })
    ),
    interventionsMocks.stubGetIntervention(draftReferral.interventionId, intervention),
    interventionsMocks.stubGetDraftReferral(draftReferral.id, draftReferral),
    [accommodationServiceCategory, socialInclusionServiceCategory].forEach(async serviceCategory => {
      await interventionsMocks.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      await interventionsMocks.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, {
        ...draftReferral,
      })
      await interventionsMocks.stubSetComplexityLevelForServiceCategory(draftReferral.id, {
        ...draftReferral,
      })
    }),
    prisonRegisterServiceMocks.stubGetPrisons(prisonFactory.prisonList()),
    prisonerOffenderSearchMocks.stubGetPrisonerById(prisonerFactory.build()),
    referAndMonitorAndDeliusMocks.stubSentReferral(),
    referAndMonitorAndDeliusMocks.stubGetCrnUserAccess(deliusUserAccess.build()),
  ])
}
