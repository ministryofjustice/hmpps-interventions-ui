import moment from 'moment-timezone'
import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import { ListStyle } from '../../utils/summaryList'
import interventionFactory from '../../../testutils/factories/intervention'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import { TagArgs } from '../../utils/govukFrontendTypes'
import caseConvictionFactory from '../../../testutils/factories/caseConviction'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import endOfServiceReportFactory from '../../../testutils/factories/endOfServiceReport'
import prisonFactory from '../../../testutils/factories/prison'
import securedChildAgency from '../../../testutils/factories/secureChildAgency'
import { CurrentLocationType } from '../../models/draftReferral'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonApiService from '../../services/prisonApiService'
import deliusResponsibleOfficerFactory from '../../../testutils/factories/deliusResponsibleOfficer'
import { RamDeliusUser } from '../../models/delius/deliusUser'
import PrisonAndSecuredChildAgency from '../../models/prisonAndSecureChildAgency'
import prisoner from '../../../testutils/factories/prisoner'

jest.mock('../../services/prisonRegisterService')
jest.mock('../../services/prisonApiService')

const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>
const prisonApiService = new PrisonApiService() as jest.Mocked<PrisonApiService>

describe(ShowReferralPresenter, () => {
  const intervention = interventionFactory.build()
  const serviceCategory = intervention.serviceCategories[0]

  const cohortServiceCategories = [
    serviceCategoryFactory.build({ name: 'Lifestyle and associates' }),
    serviceCategoryFactory.build({ name: 'Emotional wellbeing' }),
  ]
  const cohortIntervention = interventionFactory.build({
    contractType: { code: 'PWB', name: 'Personal wellbeing' },
    serviceCategories: cohortServiceCategories,
  })

  const caseConviction = caseConvictionFactory.build()
  const deliusConviction = caseConviction.conviction
  const deliusServiceUser = caseConviction.caseDetail

  const referralParams = {
    referral: {
      serviceCategoryId: serviceCategory.id,
      serviceCategoryIds: [serviceCategory.id],
      serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      personCurrentLocationType: CurrentLocationType.community,
      ppName: 'Bernard Beaks',
      ppEmailAddress: 'bernard.beaks@justice.gov.uk',
    },
  }
  const deliusUser: RamDeliusUser = {
    username: 'BERNARD.BEAKS',
    name: {
      forename: 'Bernard',
      surname: 'Beaks',
    },
    email: 'bernard.beaks@justice.gov.uk',
  }

  const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
  const riskSummary = riskSummaryFactory.build()
  const deliusRoOfficer = deliusResponsibleOfficerFactory.build()

  const prisonList = prisonFactory.build()
  const prisonAndSecuredChildAgencyList = securedChildAgency.build()
  prisonRegisterService.getPrisons.mockResolvedValue(prisonList)
  prisonApiService.getSecureChildrenAgencies.mockResolvedValue(prisonAndSecuredChildAgencyList)

  const prisonsAndSecuredChildAgencies: PrisonAndSecuredChildAgency[] = []

  prisonList.forEach(prison =>
    prisonsAndSecuredChildAgencies.push({ id: prison.prisonId, description: prison.prisonName })
  )
  prisonAndSecuredChildAgencyList.forEach(sca =>
    prisonsAndSecuredChildAgencies.push({ id: sca.agencyId, description: sca.description })
  )
  const prisonerDetails = prisoner.build()

  describe('canShowFullSupplementaryRiskInformation', () => {
    // TODO: describe what we expect to show instead
    it("don't show full risk information if redacted risk not available", () => {
      const referral = sentReferralFactory.build(referralParams)

      const presenter = new ShowReferralPresenter(
        referral,
        intervention,
        deliusConviction,
        supplementaryRiskInformationFactory.build({ redactedRisk: undefined }),
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )
      expect(presenter.canShowFullSupplementaryRiskInformation).toBeFalsy()
    })

    it('show full risk information if redacted risk is available and service provider', () => {
      const referral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        referral,
        intervention,
        deliusConviction,
        supplementaryRiskInformationFactory.build(),
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )
      expect(presenter.canShowFullSupplementaryRiskInformation).toBeTruthy()
    })
  })

  describe('assignmentFormAction', () => {
    it('returns the relative URL for the start assignment page', () => {
      const referral = sentReferralFactory.build(referralParams)

      const presenter = new ShowReferralPresenter(
        referral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.assignmentFormAction).toEqual(`/service-provider/referrals/${referral.id}/assignment/start`)
    })
  })

  describe('assignedCaseworkerFullName', () => {
    describe('when the referral has no assignee', () => {
      it('returns null', () => {
        const assignee = null
        const referral = sentReferralFactory.unassigned().build()

        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.assignedCaseworkerFullName).toEqual(null)
      })
    })

    describe('when the referral has an assignee', () => {
      it('returns the assignee’s name', () => {
        const assignee = hmppsAuthUserFactory.build({ firstName: 'Liam', lastName: 'Johnson' })
        const referral = sentReferralFactory.assigned().build()

        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.assignedCaseworkerFullName).toEqual('Liam Johnson')
      })
    })
  })

  describe('assignedCaseworkerEmail', () => {
    describe('when the referral has no assignee', () => {
      it('returns null', () => {
        const assignee = null
        const referral = sentReferralFactory.unassigned().build()

        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.assignedCaseworkerFullName).toEqual(null)
      })
    })

    describe('when the referral has an assignee', () => {
      it('returns the assignee’s name', () => {
        const assignee = hmppsAuthUserFactory.build({ email: 'liam.johnson@justice.gov.uk' })
        const referral = sentReferralFactory.assigned().build()

        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.assignedCaseworkerEmail).toEqual('liam.johnson@justice.gov.uk')
      })
    })
  })

  describe('identity details', () => {
    it('returns a identity details for the custody referral', () => {
      const yearsElapsed = moment().diff('1980-01-01', 'years')
      const custodyReferralParams = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          ppName: 'Bernard Beaks',
          ppEmailAddress: 'bernard.beaks@justice.gov.uk',
        },
      }
      const sentReferral = sentReferralFactory.build(custodyReferralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.identityDetails).toEqual([
        {
          key: 'First name',
          lines: ['Jenny'],
        },
        {
          key: 'Last name(s)',
          lines: ['Jones'],
        },
        {
          key: 'Date of birth',
          lines: [`1 Jan 1980 (${yearsElapsed} years old)`],
        },
        {
          key: 'CRN',
          lines: ['X123456'],
        },
        {
          key: 'Referral number',
          lines: [sentReferral.referenceNumber],
        },
        {
          key: 'Prison number',
          lines: ['A6838DA'],
        },
      ])
    })
    it('returns a identity details for the community referral', () => {
      const yearsElapsed = moment().diff('1980-01-01', 'years')
      const communityReferralParams = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.community,
          ppName: 'Bernard Beaks',
          ppEmailAddress: 'bernard.beaks@justice.gov.uk',
        },
      }
      const sentReferral = sentReferralFactory.build(communityReferralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.identityDetails).toEqual([
        {
          key: 'First name',
          lines: ['Jenny'],
        },
        {
          key: 'Last name(s)',
          lines: ['Jones'],
        },
        {
          key: 'Date of birth',
          lines: [`1 Jan 1980 (${yearsElapsed} years old)`],
        },
        {
          key: 'CRN',
          lines: ['X123456'],
        },
        {
          key: 'Referral number',
          lines: [sentReferral.referenceNumber],
        },
      ])
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details for service provider', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Phone number', lines: ['072121212125'] },
        { key: 'Probation Office', lines: ['London'] },
        { key: 'Team phone number', lines: ['020343434565'] },
      ])
    })
    it('returns a summary list of probation practitioner details for probation practitioner', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'probation-practitioner',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Phone number', lines: ['072121212125'] },
        { key: 'Probation Office', lines: ['London'] },
        { key: 'Team phone number', lines: ['020343434565'] },
      ])
    })
    it('returns a summary list of probation practitioner details from ndelius for service provider', () => {
      const updatedReferralParams = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.community,
          ppName: null,
          ppEmailAddress: null,
          ndeliusPPName: null,
          ndeliusPPEmailAddress: null,
          ndeliusPDU: null,
          ppProbationOffice: null,
          ppPdu: null,
        },
      }
      const sentReferral = sentReferralFactory.build(updatedReferralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bob Alice'] },
        { key: 'Email address', lines: ['bobalice@example.com'] },
        { key: 'Phone number', lines: ['98454243243'] },
        { key: 'PDU (Probation Delivery Unit)', lines: ['97 Hackney and City'] },
        { key: 'Team phone number', lines: ['020343434343'] },
      ])
    })
    it('returns a summary list of probation practitioner details from ndelius for probation practitioner', () => {
      const updatedReferralParams = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.community,
          ppName: null,
          ppEmailAddress: null,
          ndeliusPPName: null,
          ndeliusPPEmailAddress: null,
          ndeliusPDU: null,
          ppProbationOffice: null,
          ppPdu: null,
        },
      }
      const sentReferral = sentReferralFactory.build(updatedReferralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'probation-practitioner',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bob Alice'] },
        { key: 'Email address', lines: ['bobalice@example.com'] },
        { key: 'PDU (Probation Delivery Unit)', lines: ['97 Hackney and City'] },
      ])
    })
  })

  describe('Main point of contact details for unallocated COM', () => {
    it('returns a summary list of main point of contact details with establishment details', () => {
      const referralParamsForSummary = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          ppName: 'Bernard Beaks',
          ppEmailAddress: 'bernard.beaks@justice.gov.uk',
          roleOrJobTitle: 'PP',
          ppEstablishment: 'aaa',
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsForSummary)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.mainPointOfContactDetailsSummary).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Role / job title', lines: ['PP'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Phone number', lines: ['072121212125'] },
        { key: 'Establishment', lines: ['London'] },
      ])
    })
    it('returns a summary list of main point of contact details with probation office details', () => {
      const referralParamsForSummary = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          ppName: 'Bernard Beaks',
          ppEmailAddress: 'bernard.beaks@justice.gov.uk',
          ppPhoneNumber: '1234554321',
          roleOrJobTitle: 'PP',
          ppProbationOffice: 'Leeds',
          ppEstablishment: '',
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsForSummary)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.mainPointOfContactDetailsSummary).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Role / job title', lines: ['PP'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Phone number', lines: ['1234554321'] },
        { key: 'Probation office', lines: ['Leeds'] },
      ])
    })
  })
  describe(`referral's location`, () => {
    it('returns a summary list for a referral community location', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const prisonerDetail = prisoner.build({
        confirmedReleaseDate: '2024-05-01',
      })
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetail
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Location at time of referral', lines: ['Community'] },
        { key: 'Release date', lines: ['1 May 2024 (Wed)'] },
        { key: 'Probation office', lines: ['London'] },
      ])
    })

    it('returns a summary list when an unallocated COM does not know the release date', () => {
      const referralParamsForSummary = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          ppName: 'Bernard Beaks',
          ppEmailAddress: 'bernard.beaks@justice.gov.uk',
          roleOrJobTitle: 'PP',
          isReferralReleasingIn12Weeks: false,
          expectedReleaseDate: null,
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsForSummary)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        { key: 'Expected release date', lines: ['---'] },
        { key: 'Expected probation office', lines: ['London'] },
      ])
    })

    it('returns a summary list for a referral custody location', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          isReferralReleasingIn12Weeks: null,
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )
      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: [moment.tz('Europe/London').add(2, 'days').format('D MMM YYYY [(]ddd[)]')],
        },
        { key: 'Expected probation office', lines: ['London'] },
      ])
    })
    it('returns a summary list when the release date is not known', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: null,
          isReferralReleasingIn12Weeks: null,
          expectedReleaseDateMissingReason: 'not in ndelius',
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )
      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: ['Not known'],
        },
        {
          key: 'Reason why expected release date is not known',
          lines: ['not in ndelius'],
        },
        { key: 'Expected probation office', lines: ['London'] },
      ])
    })
    it('returns a summary list for an unallocated COM with expected probation office', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          isReferralReleasingIn12Weeks: true,
          expectedProbationOffice: 'Sheffield',
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: [moment().add(2, 'days').format('D MMM YYYY [(]ddd[)]')],
        },
        { key: 'Expected probation office', lines: ['Sheffield'] },
      ])
    })
    it('returns a summary list for an unallocated COM who knows the release date', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          isReferralReleasingIn12Weeks: true,
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: [moment().add(2, 'days').format('D MMM YYYY [(]ddd[)]')],
        },
        { key: 'Expected probation office', lines: ['London'] },
      ])
    })

    it('returns a summary list for an unallocated COM who does not know the probation office', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          expectedProbationOffice: null,
          expectedProbationOfficeUnKnownReason: 'Some reason',
          isReferralReleasingIn12Weeks: true,
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: [moment().add(2, 'days').format('D MMM YYYY [(]ddd[)]')],
        },
        {
          key: 'Expected probation office',
          lines: ['Not known'],
        },
        { key: 'Reason why expected probation office is not known', lines: ['Some reason'] },
      ])
    })

    it('returns a summary list for an unallocated COM with unknown release date and probation office', () => {
      const referralParamsWithCustodyDetails = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceCategoryIds: [serviceCategory.id],
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          personCurrentLocationType: CurrentLocationType.custody,
          expectedReleaseDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          isReferralReleasingIn12Weeks: false,
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Prison establishment', lines: ['London'] },
        {
          key: 'Expected release date',
          lines: [moment().add(2, 'days').format('D MMM YYYY [(]ddd[)]')],
        },
        { key: 'Expected probation office', lines: ['London'] },
      ])
    })
  })

  describe('responsibleOfficerDetails', () => {
    describe('when all fields are present', () => {
      it('returns a summary list of the responsible officer details for a service provider', () => {
        const sentReferral = sentReferralFactory.build(referralParams)
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusResponsibleOfficerFactory.build({
            communityManager: {
              code: 'abc',
              name: {
                forename: 'Peter',
                surname: 'Practitioner',
              },
              username: 'bobalice',
              email: 'p.practitioner@example.com',
              telephoneNumber: '01234567890',
              responsibleOfficer: true,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: 'team@nps.gov.uk',
                telephoneNumber: '01141234567',
              },
              unallocated: false,
            },
          }),
          prisonerDetails
        )

        expect(presenter.deliusResponsibleOfficersDetails).toEqual([
          { key: 'Name', lines: ['Peter Practitioner'] },
          { key: 'Phone', lines: ['01234567890'] },
          { key: 'Email address', lines: ['p.practitioner@example.com'] },
          { key: 'Team phone', lines: ['01141234567'] },
          { key: 'Team email address', lines: ['team@nps.gov.uk'] },
        ])
      })
      it('returns a summary list of the responsible officer details for a probation practitioner', () => {
        const sentReferral = sentReferralFactory.build(referralParams)
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusResponsibleOfficerFactory.build({
            communityManager: {
              code: 'abc',
              name: {
                forename: 'Peter',
                surname: 'Practitioner',
              },
              username: 'bobalice',
              email: 'p.practitioner@example.com',
              telephoneNumber: '01234567890',
              responsibleOfficer: false,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: 'team@nps.gov.uk',
                telephoneNumber: '01141234567',
              },
              unallocated: true,
            },
            prisonManager: {
              code: 'abc',
              name: {
                forename: 'Peter',
                surname: 'Custody',
              },
              username: 'bobrichard',
              email: 'p.practitioner@example.com',
              telephoneNumber: '01234567892',
              responsibleOfficer: true,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: 'custody-team@nps.gov.uk',
                telephoneNumber: '01141234568',
              },
              unallocated: false,
            },
          }),
          prisonerDetails
        )

        expect(presenter.deliusResponsibleOfficersDetails).toEqual([
          { key: 'Name', lines: ['Peter Practitioner'] },
          { key: 'Phone', lines: ['01234567890'] },
          { key: 'Email address', lines: ['p.practitioner@example.com'] },
          { key: 'Team phone', lines: ['01141234567'] },
          { key: 'Team email address', lines: ['team@nps.gov.uk'] },
        ])
      })
    })

    describe('when optional fields are missing', () => {
      it('returns a summary list of the responsible officer details with "not found" or empty values', () => {
        const sentReferral = sentReferralFactory.build(referralParams)
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusResponsibleOfficerFactory.build({
            communityManager: {
              code: 'abc',
              name: {
                forename: 'Peter',
                surname: undefined,
              },
              username: 'bobalice',
              email: null,
              telephoneNumber: null,
              responsibleOfficer: true,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: null,
                telephoneNumber: null,
              },
              unallocated: false,
            },
          }),
          prisonerDetails
        )

        expect(presenter.deliusResponsibleOfficersDetails).toEqual([
          { key: 'Name', lines: ['Peter'] },
          { key: 'Phone', lines: ['Not found'] },
          {
            key: 'Email address',
            lines: ['Not found - email notifications for this referral will be sent to the referring officer'],
          },
          { key: 'Team phone', lines: ['Not found'] },
          { key: 'Team email address', lines: ['Not found'] },
        ])
      })
    })

    describe('when no Responsible Officers are passed in', () => {
      it('returns an empty response', () => {
        const sentReferral = sentReferralFactory.build(referralParams)
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          null,
          prisonerDetails
        )

        expect(presenter.deliusResponsibleOfficersDetails).toEqual([])
      })
    })
  })

  describe('get back up contact details', () => {
    describe('when the referring office and responsible officer are different', () => {
      it('returns the back up contact details', () => {
        const sentReferral = sentReferralFactory.build({
          referral: {
            ppName: 'Bob Alice',
          },
        })
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusResponsibleOfficerFactory.build({
            communityManager: {
              code: 'abc',
              name: {
                forename: 'Peter',
                surname: 'Practitioner',
              },
              username: 'bobalice',
              email: 'p.practitioner@example.com',
              telephoneNumber: '01234567890',
              responsibleOfficer: true,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: 'team@nps.gov.uk',
                telephoneNumber: '01141234567',
              },
              unallocated: false,
            },
          }),
          prisonerDetails
        )

        expect(presenter.backupContactDetails).toEqual([
          { key: 'Referring officer name', lines: ['Bernard Beaks'] },
          { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        ])
      })
    })

    describe('when the referring office and responsible officer are same', () => {
      it('returns the back up contact details', () => {
        const sentReferral = sentReferralFactory.build({
          referral: {
            ppName: 'Bernard Beaks',
          },
        })
        const presenter = new ShowReferralPresenter(
          sentReferral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusResponsibleOfficerFactory.build({
            communityManager: {
              code: 'abc',
              name: {
                forename: 'Bernard',
                surname: 'Beaks',
              },
              username: 'bobalice',
              email: 'p.practitioner@example.com',
              telephoneNumber: '01234567890',
              responsibleOfficer: true,
              pdu: {
                code: '97',
                description: 'Hackney and City',
              },
              team: {
                code: 'RM',
                description: 'R and M team',
                email: 'team@nps.gov.uk',
                telephoneNumber: '01141234567',
              },
              unallocated: false,
            },
          }),
          prisonerDetails
        )

        expect(presenter.backupContactDetails).toEqual([])
      })
    })
  })

  describe('interventionDetails', () => {
    describe('when all possibly optional fields have been set on the referral', () => {
      const referralWithAllOptionalFields = sentReferralFactory.build({
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryIds: [serviceCategory.id],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
          ],
          furtherInformation: 'Some information about the service user',
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
            },
          ],
          additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'She works Mondays 9am - midday',
          serviceUser: {
            crn: 'X123456',
            title: 'Mr',
            firstName: 'Alex',
            lastName: 'River',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            ethnicity: 'British',
            preferredLanguage: 'English',
            religionOrBelief: 'Agnostic',
            disabilities: ['Autism spectrum condition', 'sciatica'],
          },
          maximumEnforceableDays: 10,
        },
      })

      const burglaryConviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            category: 'Burglary',
            subCategory: 'Theft act, 1968',
          },
          sentence: {
            expectedEndDate: '2025-11-15',
          },
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(
          referralWithAllOptionalFields,
          intervention,
          burglaryConviction.conviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          burglaryConviction.caseDetail,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Intervention type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          { key: 'Date intervention received', lines: ['1 Jan 2022'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
        ])
      })
    })

    describe('when no optional fields have been set on the referral', () => {
      const referralWithNoOptionalFields = sentReferralFactory.build({
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryIds: [serviceCategory.id],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
          ],
          furtherInformation: '',
          reasonForReferral: '',
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
            },
          ],
          additionalNeedsInformation: '',
          accessibilityNeeds: '',
          needsInterpreter: false,
          interpreterLanguage: null,
          hasAdditionalResponsibilities: false,
          whenUnavailable: null,
          serviceUser: {
            crn: 'X123456',
            title: 'Mr',
            firstName: 'Alex',
            lastName: 'River',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            ethnicity: 'British',
            preferredLanguage: 'English',
            religionOrBelief: 'Agnostic',
            disabilities: ['Autism spectrum condition', 'sciatica'],
          },
          maximumEnforceableDays: 10,
        },
      })

      const burglaryConviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            category: 'Burglary',
            subCategory: 'Theft act, 1968',
          },
          sentence: {
            expectedEndDate: '2025-11-15',
          },
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(
          referralWithNoOptionalFields,
          intervention,
          burglaryConviction.conviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          burglaryConviction.caseDetail,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Intervention type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          { key: 'Date intervention received', lines: ['1 Jan 2022'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
        ])
      })
    })

    describe('when a referral is cancelled', () => {
      const referralWithAllOptionalFields = sentReferralFactory.build({
        concludedAt: '2024-02-07T20:45:21.986389Z',
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryIds: [serviceCategory.id],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
          ],
          furtherInformation: 'Some information about the service user',
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
            },
          ],
          additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'She works Mondays 9am - midday',
          serviceUser: {
            crn: 'X123456',
            title: 'Mr',
            firstName: 'Alex',
            lastName: 'River',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            ethnicity: 'British',
            preferredLanguage: 'English',
            religionOrBelief: 'Agnostic',
            disabilities: ['Autism spectrum condition', 'sciatica'],
          },
          maximumEnforceableDays: 10,
        },
      })

      const burglaryConviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            category: 'Burglary',
            subCategory: 'Theft act, 1968',
          },
          sentence: {
            expectedEndDate: '2025-11-15',
          },
        },
      })

      it('returns a summary list of intervention details with cancelled date', () => {
        const presenter = new ShowReferralPresenter(
          referralWithAllOptionalFields,
          intervention,
          burglaryConviction.conviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          burglaryConviction.caseDetail,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Intervention type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          { key: 'Date intervention received', lines: ['1 Jan 2022'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
          { key: 'Date intervention withdrawn', lines: ['7 Feb 2024'] },
        ])
      })
    })
    describe('when a referral is completed', () => {
      const referralWithAllOptionalFields = sentReferralFactory.build({
        concludedAt: '2024-02-07T20:45:21.986389Z',
        endOfServiceReport: endOfServiceReportFactory.build(),
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryIds: [serviceCategory.id],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
          ],
          furtherInformation: 'Some information about the service user',
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
            },
          ],
          additionalNeedsInformation: 'Alex is currently sleeping on her aunt’s sofa',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'She works Mondays 9am - midday',
          serviceUser: {
            crn: 'X123456',
            title: 'Mr',
            firstName: 'Alex',
            lastName: 'River',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            ethnicity: 'British',
            preferredLanguage: 'English',
            religionOrBelief: 'Agnostic',
            disabilities: ['Autism spectrum condition', 'sciatica'],
          },
          maximumEnforceableDays: 10,
        },
      })

      const burglaryConviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            category: 'Burglary',
            subCategory: 'Theft act, 1968',
          },
          sentence: {
            expectedEndDate: '2025-11-15',
          },
        },
      })

      it('returns a summary list of intervention details with cancelled date', () => {
        const presenter = new ShowReferralPresenter(
          referralWithAllOptionalFields,
          intervention,
          burglaryConviction.conviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          burglaryConviction.caseDetail,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Intervention type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          { key: 'Date intervention received', lines: ['1 Jan 2022'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
          { key: 'Date intervention completed', lines: ['7 Feb 2024'] },
        ])
      })
    })
  })

  describe('serviceCategorySection', () => {
    const referral = sentReferralFactory.build({
      referral: {
        createdAt: '2020-12-07T20:45:21.986389Z',
        completionDeadline: '2021-04-01',
        serviceProvider: {
          name: 'Harmony Living',
        },
        serviceCategoryIds: cohortServiceCategories.map(it => it.id),
        complexityLevels: cohortServiceCategories.map(it => {
          return { serviceCategoryId: it.id, complexityLevelId: it.complexityLevels[0].id }
        }),
        desiredOutcomes: cohortServiceCategories.map(it => {
          return {
            serviceCategoryId: it.id,
            desiredOutcomesIds: it.desiredOutcomes.slice(0, 2).map(outcome => outcome.id),
          }
        }),
      },
    })

    it('returns a section for each selected service category on the referral', () => {
      const presenter = new ShowReferralPresenter(
        referral,
        cohortIntervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )
      expect(
        presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
          return args.text!
        })
      ).toEqual([
        {
          key: 'Reason for the referral and further information',
          lines: ['For crs'],
          changeLink: undefined,
        },
        {
          key: 'Complexity level',
          lines: [
            'LOW COMPLEXITY',
            'Service user has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
          ],
        },
        {
          key: 'Desired outcomes',
          lines: [
            'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
            'Service user makes progress in obtaining accommodation',
          ],
        },
      ])
    })

    describe('amend desired outcomes', () => {
      it('should show amend link if no approved action plans are found for probabation practitioner', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          cohortIntervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          true,
          'dashboardOriginPage',
          false
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information for the service provider',
            lines: ['For crs'],
            changeLink: `/referrals/${referral.id}/reason-for-referral?amendRefDetails=true`,
          },
          expect.objectContaining({
            key: 'Complexity level',
          }),
          {
            key: 'Desired outcomes',
            lines: expect.any(Array),
            changeLink: `/probation-practitioner/referrals/${referral.id}/2/update-desired-outcomes`,
          },
        ])
      })

      it('should not show amend link if approved action plans are found for probabation practitioner', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          cohortIntervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          true,
          'dashboardOriginPage',
          true
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information for the service provider',
            lines: ['For crs'],
            changeLink: `/referrals/${referral.id}/reason-for-referral?amendRefDetails=true`,
          },
          expect.objectContaining({
            key: 'Complexity level',
          }),
          {
            key: 'Desired outcomes',
            lines: expect.any(Array),
            changeLink: undefined,
          },
        ])
      })

      it('should not show amend link for service provider', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          cohortIntervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          true,
          'dashboardOriginPage',
          false
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information',
            lines: ['For crs'],
          },
          expect.objectContaining({
            key: 'Complexity level',
          }),
          {
            key: 'Desired outcomes',
            lines: expect.any(Array),
            changeLink: undefined,
          },
        ])
      })
    })

    describe('amend complexity level', () => {
      it('amend link is shown if action plan is not approved and user is a probation practitioner', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          false,
          undefined,
          false
        )

        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information for the service provider',
            lines: ['For crs'],
            changeLink: `/referrals/${referral.id}/reason-for-referral?amendRefDetails=true`,
          },
          {
            key: 'Complexity level',
            lines: [
              'LOW COMPLEXITY',
              'Service user has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            changeLink: `/probation-practitioner/referrals/${referral.id}/service-category/${cohortServiceCategories[0].id}/update-complexity-level`,
          },
          expect.objectContaining({
            key: 'Desired outcomes',
          }),
        ])
      })

      it('amend link is not shown if action plan is approved', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          false,
          undefined,
          true
        )

        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information for the service provider',
            lines: ['For crs'],
            changeLink: `/referrals/${referral.id}/reason-for-referral?amendRefDetails=true`,
          },
          {
            key: 'Complexity level',
            lines: [
              'LOW COMPLEXITY',
              'Service user has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            changeLink: undefined,
          },
          {
            key: 'Desired outcomes',
            lines: [
              'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
              'Service user makes progress in obtaining accommodation',
            ],
          },
        ])
      })

      it('amend link is not if the user is a service provider', () => {
        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails,
          false,
          undefined,
          false
        )

        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          {
            key: 'Reason for the referral and further information',
            lines: ['For crs'],
          },
          {
            key: 'Complexity level',
            lines: [
              'LOW COMPLEXITY',
              'Service user has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            changeLink: undefined,
          },
          {
            key: 'Desired outcomes',
            lines: [
              'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
              'Service user makes progress in obtaining accommodation',
            ],
          },
        ])
      })
    })
  })

  describe('serviceUserPersonalDetails', () => {
    it("returns a summary list of the service user's personal details", () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.personalDetailSummary).toEqual([
        { key: 'Gender', lines: ['Male'] },
        { key: 'Ethnicity', lines: ['British'] },
        { key: 'Preferred language', lines: ['English'] },
        { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
        { key: 'Religion or belief', lines: ['Agnostic'] },
      ])
    })
  })

  describe('addressAndContactDetails', () => {
    it('returns a summary list of the address and contact details', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.contactDetailsSummary).toEqual([
        {
          key: 'Last known address',
          lines: ['Flat 2 Test Walk', 'London', 'City of London', 'Greater London', 'SW16 1AQ'],
          listStyle: ListStyle.noMarkers,
        },
        { key: 'Phone number', lines: ['0123456789'], listStyle: ListStyle.noMarkers },
        { key: 'Email address', lines: ['alex.river@example.com'], listStyle: ListStyle.noMarkers },
      ])
    })
  })

  describe('serviceUserRisks', () => {
    it("returns a summary list of the service user's risk information", () => {
      const lowRiskInformation = supplementaryRiskInformationFactory.build({
        riskSummaryComments: 'Alex is low risk.',
      })
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        lowRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserRisks).toEqual([
        {
          key: 'Additional risk information',
          lines: ['Alex is low risk.'],
        },
      ])
    })
  })

  describe('serviceUserNeeds', () => {
    describe('when all conditional text answers are present', () => {
      it("returns a summary list of the service user's needs with those fields filled in", () => {
        const referralWithAllConditionalFields = sentReferralFactory.build({
          referral: {
            createdAt: '2020-12-07T20:45:21.986389Z',
            completionDeadline: '2021-04-01',
            serviceProvider: {
              name: 'Harmony Living',
            },
            serviceCategoryIds: [serviceCategory.id],
            complexityLevels: [
              { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
            ],
            furtherInformation: 'Some information about the service user',
            desiredOutcomes: [
              {
                serviceCategoryId: serviceCategory.id,
                desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
              },
            ],
            additionalNeedsInformation: "Alex is currently sleeping on her aunt's sofa",
            accessibilityNeeds: 'She uses a wheelchair',
            needsInterpreter: true,
            interpreterLanguage: 'Spanish',
            hasAdditionalResponsibilities: true,
            whenUnavailable: 'She works Mondays 9am - midday',
            serviceUser: {
              crn: 'X123456',
              title: 'Ms',
              firstName: 'Alex',
              lastName: 'River',
              dateOfBirth: '1980-01-01',
              gender: 'Male',
              ethnicity: 'Spanish',
              preferredLanguage: 'Catalan',
              religionOrBelief: 'Agnostic',
              disabilities: ['Autism spectrum condition', 'sciatica'],
            },
            maximumEnforceableDays: 10,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithAllConditionalFields,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            key: 'Identify needs',
            lines: ["Alex is currently sleeping on her aunt's sofa"],
          },
          {
            key: 'Mobility, disability or accessibility needs',
            lines: ['She uses a wheelchair'],
          },
          {
            key: 'Interpreter required',
            lines: ['Yes'],
          },
          { key: 'Interpreter language', lines: ['Spanish'] },
          {
            key: 'Primary language',
            lines: ['Catalan'],
          },
          {
            key: 'Caring or employment responsibilities',
            lines: ['Yes'],
          },
          {
            key: `Provide details of when Alex will not be able to attend sessions`,
            lines: ['She works Mondays 9am - midday'],
          },
        ])
      })
    })

    describe('when no conditional/optional text answers are present', () => {
      it("returns a summary list of the service user's needs with N/A for those fields", () => {
        const referralWithNoConditionalFields = sentReferralFactory.build({
          referral: {
            createdAt: '2020-12-07T20:45:21.986389Z',
            completionDeadline: '2021-04-01',
            serviceProvider: {
              name: 'Harmony Living',
            },
            serviceCategoryIds: [serviceCategory.id],
            complexityLevels: [
              { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
            ],
            furtherInformation: '',
            desiredOutcomes: [
              {
                serviceCategoryId: serviceCategory.id,
                desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
              },
            ],
            additionalNeedsInformation: '',
            accessibilityNeeds: '',
            needsInterpreter: false,
            interpreterLanguage: null,
            hasAdditionalResponsibilities: false,
            whenUnavailable: null,
            serviceUser: {
              crn: 'X123456',
              title: 'Mr',
              firstName: 'Alex',
              lastName: 'River',
              dateOfBirth: '1980-01-01',
              gender: 'Male',
              ethnicity: 'British',
              preferredLanguage: 'English',
              religionOrBelief: 'Agnostic',
              disabilities: ['Autism spectrum condition', 'sciatica'],
            },
            maximumEnforceableDays: 10,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithNoConditionalFields,
          intervention,
          deliusConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            changeLink: undefined,
            key: 'Identify needs',
            lines: ['N/A'],
          },
          {
            changeLink: undefined,
            key: 'Mobility, disability or accessibility needs',
            lines: ['N/A'],
          },
          {
            changeLink: undefined,
            key: 'Interpreter required',
            lines: ['No'],
          },
          { changeLink: undefined, key: 'Interpreter language', lines: ['N/A'] },
          {
            key: 'Primary language',
            lines: ['English'],
          },
          {
            changeLink: undefined,
            key: 'Caring or employment responsibilities',
            lines: ['No'],
          },
        ])
      })
    })
  })

  describe('when no conditional/optional text answers are present and caring responsibilities', () => {
    it("returns a summary list of the service user's needs with N/A for those fields, availability is present", () => {
      const referralWithNoConditionalFields = sentReferralFactory.build({
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryIds: [serviceCategory.id],
          complexityLevels: [
            { serviceCategoryId: serviceCategory.id, complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2' },
          ],
          furtherInformation: '',
          desiredOutcomes: [
            {
              serviceCategoryId: serviceCategory.id,
              desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
            },
          ],
          additionalNeedsInformation: '',
          accessibilityNeeds: '',
          needsInterpreter: false,
          interpreterLanguage: null,
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'Monday mornings',
          serviceUser: {
            crn: 'X123456',
            title: 'Mr',
            firstName: 'Alex',
            lastName: 'River',
            dateOfBirth: '1980-01-01',
            gender: 'Male',
            ethnicity: 'British',
            preferredLanguage: 'English',
            religionOrBelief: 'Agnostic',
            disabilities: ['Autism spectrum condition', 'sciatica'],
          },
          maximumEnforceableDays: 10,
        },
      })

      const presenter = new ShowReferralPresenter(
        referralWithNoConditionalFields,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonsAndSecuredChildAgencies,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer,
        prisonerDetails
      )

      expect(presenter.serviceUserNeeds).toEqual([
        {
          changeLink: undefined,
          key: 'Identify needs',
          lines: ['N/A'],
        },
        {
          changeLink: undefined,
          key: 'Mobility, disability or accessibility needs',
          lines: ['N/A'],
        },
        {
          changeLink: undefined,
          key: 'Interpreter required',
          lines: ['No'],
        },
        { changeLink: undefined, key: 'Interpreter language', lines: ['N/A'] },
        {
          key: 'Primary language',
          lines: ['English'],
        },
        {
          changeLink: undefined,
          key: 'Caring or employment responsibilities',
          lines: ['Yes'],
        },
        {
          changeLink: undefined,
          key: 'Provide details of when Alex will not be able to attend sessions',
          lines: ['Monday mornings'],
        },
      ])
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('returns a title to be displayed', () => {
        const referral = sentReferralFactory.build(referralParams)

        const presenter = new ShowReferralPresenter(
          referral,
          intervention,
          deliusConviction,
          supplementaryRiskInformationFactory.build({ redactedRisk: undefined }),
          deliusUser,
          prisonsAndSecuredChildAgencies,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          prisonerDetails
        )

        expect(presenter.text).toMatchObject({
          title: 'Jenny Jones: referral details',
        })
      })
    })
  })
})
