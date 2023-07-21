import moment from 'moment-timezone'
import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import { ListStyle } from '../../utils/summaryList'
import interventionFactory from '../../../testutils/factories/intervention'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import { TagArgs } from '../../utils/govukFrontendTypes'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import supplementaryRiskInformationFactory from '../../../testutils/factories/supplementaryRiskInformation'
import expandedDeliusServiceUserFactory from '../../../testutils/factories/expandedDeliusServiceUser'
import riskSummaryFactory from '../../../testutils/factories/riskSummary'
import prisonFactory from '../../../testutils/factories/prison'
import { CurrentLocationType } from '../../models/draftReferral'
import PrisonRegisterService from '../../services/prisonRegisterService'
import deliusResponsibleOfficerFactory from '../../../testutils/factories/deliusResponsibleOfficer'

jest.mock('../../services/prisonRegisterService')

const prisonRegisterService = new PrisonRegisterService() as jest.Mocked<PrisonRegisterService>

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

  const deliusConviction = deliusConvictionFactory.build()

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
  const deliusUser = deliusUserFactory.build({
    firstName: 'Bernard',
    surname: 'Beaks',
    email: 'bernard.beaks@justice.gov.uk',
  })
  const deliusServiceUser = expandedDeliusServiceUserFactory.build()

  const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
  const riskSummary = riskSummaryFactory.build()
  const deliusRoOfficer = deliusResponsibleOfficerFactory.build()

  const prisonList = prisonFactory.prisonList()
  prisonRegisterService.getPrisons.mockResolvedValue(prisonList)

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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
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
          prisonList,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
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
          prisonList,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
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
          prisonList,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
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
          prisonList,
          assignee,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.assignedCaseworkerEmail).toEqual('liam.johnson@justice.gov.uk')
      })
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Phone number', lines: ['98454243243'] },
        { key: 'Probation Office', lines: ['London'] },
        { key: 'Team phone number', lines: ['044-2545453442'] },
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
        prisonList,
        null,
        null,
        'probation-practitioner',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
        { key: 'Probation Office', lines: ['London'] },
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bob Alice'] },
        { key: 'Email address', lines: ['bobalice@example.com'] },
        { key: 'Phone number', lines: ['98454243243'] },
        { key: 'PDU (Probation Delivery Unit)', lines: ['97 Hackney and City'] },
        { key: 'Team phone number', lines: ['044-2545453442'] },
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
        prisonList,
        null,
        null,
        'probation-practitioner',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.probationPractitionerDetailsForCommunity).toEqual([
        { key: 'Name', lines: ['Bob Alice'] },
        { key: 'Email address', lines: ['bobalice@example.com'] },
        { key: 'PDU (Probation Delivery Unit)', lines: ['97 Hackney and City'] },
      ])
    })
  })

  describe(`referral's location`, () => {
    it('returns a summary list for a referral community location', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Location at time of referral', lines: ['Community'] },
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
        },
      }
      const sentReferral = sentReferralFactory.build(referralParamsWithCustodyDetails)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.serviceUserLocationDetails).toEqual([
        { key: 'Location at time of referral', lines: ['Custody'] },
        {
          key: 'Current establishment',
          lines: ['London'],
        },
        {
          key: 'Expected release date',
          lines: [moment().add(2, 'days').format('YYYY-MM-DD')],
        },
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
          prisonList,
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
            },
          })
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
          prisonList,
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
            },
          })
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
          prisonList,
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
            },
          })
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          null
        )

        expect(presenter.deliusResponsibleOfficersDetails).toEqual([])
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

      const burglaryConviction = deliusConvictionFactory.build({
        offences: [
          {
            mainOffence: true,
            detail: {
              mainCategoryDescription: 'Burglary',
              subCategoryDescription: 'Theft act, 1968',
            },
          },
        ],
        sentence: {
          expectedSentenceEndDate: '2025-11-15',
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(
          referralWithAllOptionalFields,
          intervention,
          burglaryConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          {
            key: 'Further information for the provider',
            lines: ['Some information about the service user'],
          },
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

      const burglaryConviction = deliusConvictionFactory.build({
        offences: [
          {
            mainOffence: true,
            detail: {
              mainCategoryDescription: 'Burglary',
              subCategoryDescription: 'Theft act, 1968',
            },
          },
        ],
        sentence: {
          expectedSentenceEndDate: '2025-11-15',
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(
          referralWithNoOptionalFields,
          intervention,
          burglaryConviction,
          supplementaryRiskInformation,
          deliusUser,
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 Nov 2025'] },
          { key: 'Date intervention to be completed by', lines: ['1 Apr 2021'] },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
          },
          {
            key: 'Further information for the provider',
            lines: ['N/A'],
          },
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )
      expect(
        presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
          return args.text!
        })
      ).toEqual([
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
          prisonList,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          true,
          'dashboardOriginPage',
          false
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
          expect.objectContaining({
            key: 'Complexity level',
          }),
          {
            key: 'Desired outcomes',
            lines: expect.any(Array),
            changeLink: '/probation-practitioner/referrals/3/2/update-desired-outcomes',
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
          prisonList,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          true,
          'dashboardOriginPage',
          true
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
          true,
          'dashboardOriginPage',
          false
        )
        expect(
          presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
            return args.text!
          })
        ).toEqual([
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
          prisonList,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
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
          prisonList,
          null,
          null,
          'probation-practitioner',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer,
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.personalDetailSummary).toEqual([
        { key: 'First name', lines: ['Jenny'] },
        { key: 'Last name(s)', lines: ['Jones'] },
        { key: 'Date of birth', lines: ['1 Jan 1980 (43 years old)'] },
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
      )

      expect(presenter.contactDetailsSummary).toEqual([
        {
          key: 'Address',
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
        prisonList,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        deliusRoOfficer
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            key: 'Identify needs',
            lines: ["Alex is currently sleeping on her aunt's sofa"],
          },
          {
            key: 'Other mobility, disability or accessibility needs',
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            changeLink: undefined,
            key: 'Identify needs',
            lines: ['N/A'],
          },
          {
            changeLink: undefined,
            key: 'Other mobility, disability or accessibility needs',
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
          {
            key: `Provide details of when Alex will not be able to attend sessions`,
            lines: ['N/A'],
          },
        ])
      })
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
          prisonList,
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          deliusRoOfficer
        )

        expect(presenter.text).toMatchObject({
          title: 'Jenny Jones: referral details',
        })
      })
    })
  })
})
