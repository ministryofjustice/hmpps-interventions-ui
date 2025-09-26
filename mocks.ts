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
import caseConvictionFactory from './testutils/factories/caseConviction'
import caseConvictionsFactory from './testutils/factories/caseConvictions'
import deliusResponsibleOfficerFactory from './testutils/factories/deliusResponsibleOfficer'
import AssessRisksAndNeedsServiceMocks from './mockApis/assessRisksAndNeedsService'
import riskSummaryFactory from './testutils/factories/riskSummary'
import prisonFactory from './testutils/factories/prison'
import secureChildrenAgenciesFactory from './testutils/factories/secureChildAgency'
import prisonerFactory from './testutils/factories/prisoner'
import supplementaryRiskInformationFactory from './testutils/factories/supplementaryRiskInformation'
import PrisonRegisterServiceMocks from './mockApis/prisonRegisterService'
import PrisonerOffenderSearchMocks from './mockApis/prisonerOffenderSearch'
import ReferAndMonitorAndDeliusMocks from './mockApis/referAndMonitorAndDelius'
import deliusUserAccess from './testutils/factories/deliusUserAccess'
import deliusServiceUser from './testutils/factories/deliusServiceUser'
import deliusUser from './testutils/factories/deliusUser'
import PrisonApiServiceMocks from './mockApis/prisonApiService'

const wiremock = new Wiremock('http://localhost:9091/__admin')
const interventionsMocks = new InterventionsServiceMocks(wiremock, '')
const assessRisksAndNeedsApiMocks = new AssessRisksAndNeedsServiceMocks(wiremock, '')
const prisonRegisterServiceMocks = new PrisonRegisterServiceMocks(wiremock, '')
const prisonApiServiceMocks = new PrisonApiServiceMocks(wiremock, '')
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
    ['CRN24', 'X320741'].forEach(crn =>
      assessRisksAndNeedsApiMocks.stubGetRiskSummary(crn, riskSummaryFactory.build())
    ),
    assessRisksAndNeedsApiMocks.stubGetSupplementaryRiskInformation(
      '5f2debc5-4c6a-4972-84ce-0689b8f9ec52',
      supplementaryRiskInformationFactory.build()
    ),
    referAndMonitorAndDeliusMocks.stubGetConvictionsByCrn('CRN24', caseConvictionsFactory.build()),
    referAndMonitorAndDeliusMocks.stubGetConvictionsByCrn('X320741', caseConvictionsFactory.build()),
    ['CRN24', 'X320741'].forEach(crn =>
      referAndMonitorAndDeliusMocks.stubGetConvictionByCrnAndId(crn, '([0-9]+)', caseConvictionFactory.build())
    ),
    ['CRN24', 'X320741'].forEach(crn =>
      referAndMonitorAndDeliusMocks.stubGetResponsibleOfficer(crn, deliusResponsibleOfficerFactory.build())
    ),

    ['CRN23'].forEach(crn =>
      referAndMonitorAndDeliusMocks.stubGetResponsibleOfficer(
        crn,
        deliusResponsibleOfficerFactory.build({
          communityManager: {
            responsibleOfficer: false,
            unallocated: true,
          },
        })
      )
    ),

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
    ['CRN24', 'X320741', 'X123456'].forEach(crn =>
      interventionsMocks.stubGetPrisonerDetails(crn, prisonerFactory.build())
    ),
    [accommodationServiceCategory, socialInclusionServiceCategory].forEach(async serviceCategory => {
      await interventionsMocks.stubGetServiceCategory(serviceCategory.id, serviceCategory)
      await interventionsMocks.stubSetDesiredOutcomesForServiceCategory(draftReferral.id, {
        ...draftReferral,
      })
      await interventionsMocks.stubSetComplexityLevelForServiceCategory(draftReferral.id, {
        ...draftReferral,
      })
    }),
    prisonRegisterServiceMocks.stubGetPrisons(prisonFactory.build()),
    prisonApiServiceMocks.stubGetSecuredChildAgencies(secureChildrenAgenciesFactory.build()),
    prisonerOffenderSearchMocks.stubGetPrisonerById(prisonerFactory.build()),
    referAndMonitorAndDeliusMocks.stubSentReferral(),
    referAndMonitorAndDeliusMocks.stubGetCrnUserAccess(deliusUserAccess.build()),
    ['CRN24', 'X320741', 'CRN23', 'X123456'].forEach(crn =>
      referAndMonitorAndDeliusMocks.stubGetCaseDetailsByCrn(crn, deliusServiceUser.build())
    ),
    referAndMonitorAndDeliusMocks.stubGetUserByUsername('bernard.beaks', deliusUser.build()),
  ])
}
