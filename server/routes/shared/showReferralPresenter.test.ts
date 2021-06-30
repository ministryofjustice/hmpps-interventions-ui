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
import deliusStaffDetailsFactory from '../../../testutils/factories/deliusStaffDetails'
import { DeliusStaffDetails } from '../../models/delius/deliusStaffDetails'
import deliusTeam from '../../../testutils/factories/deliusTeam'

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
    },
  }
  const deliusUser = deliusUserFactory.build({
    firstName: 'Bernard',
    surname: 'Beaks',
    email: 'bernard.beaks@justice.gov.uk',
  })
  const deliusServiceUser = expandedDeliusServiceUserFactory.build()
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

  const supplementaryRiskInformation = supplementaryRiskInformationFactory.build()
  const riskSummary = riskSummaryFactory.build()
  const defaultStaffDetails = deliusStaffDetailsFactory.build()

  describe('assignmentFormAction', () => {
    it('returns the relative URL for the check assignment page', () => {
      const referral = sentReferralFactory.build(referralParams)

      const presenter = new ShowReferralPresenter(
        referral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        defaultStaffDetails
      )

      expect(presenter.assignmentFormAction).toEqual(`/service-provider/referrals/${referral.id}/assignment/check`)
    })
  })

  describe('text', () => {
    describe('assignedTo', () => {
      describe('when the referral doesn’t have an assigned caseworker', () => {
        it('returns null', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(
            referral,
            intervention,
            deliusConviction,
            supplementaryRiskInformation,
            deliusUser,
            null,
            null,
            'service-provider',
            true,
            deliusServiceUser,
            riskSummary,
            defaultStaffDetails
          )

          expect(presenter.text.assignedTo).toBeNull()
        })
      })

      describe('when the referral has an assigned caseworker', () => {
        it('returns the name of the assignee', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(
            referral,
            intervention,
            deliusConviction,
            supplementaryRiskInformation,
            deliusUser,
            hmppsAuthUser,
            null,
            'service-provider',
            true,
            deliusServiceUser,
            riskSummary,
            defaultStaffDetails
          )

          expect(presenter.text.assignedTo).toEqual('John Smith')
        })
      })
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(
        sentReferral,
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        defaultStaffDetails
      )

      expect(presenter.probationPractitionerDetails).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
      ])
    })
  })

  describe('probationPractitionerTeamDetails', () => {
    function createShowReferralPresenterWithStaffDetails(staffDetails: DeliusStaffDetails) {
      return new ShowReferralPresenter(
        sentReferralFactory.build(referralParams),
        intervention,
        deliusConviction,
        supplementaryRiskInformation,
        deliusUser,
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        staffDetails
      )
    }

    describe('when a single active team exists on staff details', () => {
      it('should display the team details', () => {
        const presenter = createShowReferralPresenterWithStaffDetails(defaultStaffDetails)
        expect(presenter.probationPractitionerTeamDetails).toEqual([
          { key: 'Phone', lines: ['07890 123456'] },
          { key: 'Email address', lines: ['probation-team4692@justice.gov.uk'] },
        ])
      })
      describe('when ended date is null', () => {
        it('should display the team details', () => {
          const staffDetails = deliusStaffDetailsFactory.build({
            teams: [deliusTeam.build({ endDate: null })],
          })
          const presenter = createShowReferralPresenterWithStaffDetails(staffDetails)
          expect(presenter.probationPractitionerTeamDetails).toEqual([
            { key: 'Phone', lines: ['07890 123456'] },
            { key: 'Email address', lines: ['probation-team4692@justice.gov.uk'] },
          ])
        })
      })
    })
    describe('when no teams exist for staff', () => {
      it('should not show any team details', () => {
        const presenterWithEmptyListTeams = createShowReferralPresenterWithStaffDetails(
          deliusStaffDetailsFactory.build({ teams: [] })
        )
        expect(presenterWithEmptyListTeams.probationPractitionerTeamDetails).toEqual([])
        const presenterWithUndefinedTeams = createShowReferralPresenterWithStaffDetails({ username: 'username' })
        expect(presenterWithUndefinedTeams.probationPractitionerTeamDetails).toEqual([])
      })
    })
    describe('when all teams are ended in the past', () => {
      it('should not show any team details', () => {
        const staffDetails = deliusStaffDetailsFactory.build({
          teams: [deliusTeam.build({ endDate: '2021-01-01' })],
        })
        const presenter = createShowReferralPresenterWithStaffDetails(staffDetails)
        expect(presenter.probationPractitionerTeamDetails).toEqual([])
      })
    })
    describe('when a team is ended in the future', () => {
      it('should show the team details', () => {
        const staffDetails = deliusStaffDetailsFactory.build({
          teams: [deliusTeam.build({ endDate: '3021-01-01' })],
        })
        const presenter = createShowReferralPresenterWithStaffDetails(staffDetails)
        expect(presenter.probationPractitionerTeamDetails).toEqual([
          { key: 'Phone', lines: ['07890 123456'] },
          { key: 'Email address', lines: ['probation-team4692@justice.gov.uk'] },
        ])
      })
    })
    describe('when there are multiple active teams', () => {
      it('should show the latest team details', () => {
        const newerTeam = deliusTeam.build({
          telephone: '07890 123456',
          emailAddress: 'probation-team4692@justice.gov.uk',
          startDate: '2021-01-02',
        })
        const olderTeam = deliusTeam.build({
          telephone: 'incorrect number',
          emailAddress: 'incorrect-team@justice.gov.uk',
          startDate: '2021-01-01',
        })
        const teamWithNoStartDate = deliusTeam.build({
          telephone: 'incorrect number - nsd',
          emailAddress: 'incorrect-team@justice.gov.uk',
        })
        const orderedAsc = createShowReferralPresenterWithStaffDetails(
          deliusStaffDetailsFactory.build({
            teams: [teamWithNoStartDate, teamWithNoStartDate, olderTeam, newerTeam],
          })
        )
        const orderedDesc = createShowReferralPresenterWithStaffDetails(
          deliusStaffDetailsFactory.build({
            teams: [newerTeam, olderTeam, teamWithNoStartDate, teamWithNoStartDate],
          })
        )

        expect(orderedAsc.probationPractitionerTeamDetails).toEqual([
          { key: 'Phone', lines: ['07890 123456'] },
          { key: 'Email address', lines: ['probation-team4692@justice.gov.uk'] },
        ])
        expect(orderedDesc.probationPractitionerTeamDetails).toEqual([
          { key: 'Phone', lines: ['07890 123456'] },
          { key: 'Email address', lines: ['probation-team4692@justice.gov.uk'] },
        ])
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
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          defaultStaffDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 November 2025'] },
          { key: 'Date to be completed by', lines: ['1 April 2021'] },
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
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          defaultStaffDetails
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence', lines: ['Burglary'] },
          { key: 'Subcategory', lines: ['Theft act, 1968'] },
          { key: 'End of sentence date', lines: ['15 November 2025'] },
          { key: 'Date to be completed by', lines: ['1 April 2021'] },
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
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        defaultStaffDetails
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
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        defaultStaffDetails
      )

      expect(presenter.serviceUserDetails).toEqual([
        { key: 'CRN', lines: ['X123456'] },
        { key: 'Title', lines: ['Mr'] },
        { key: 'First name', lines: ['Jenny'] },
        { key: 'Last name', lines: ['Jones'] },
        { key: 'Date of birth', lines: ['1 January 1980'] },
        {
          key: 'Address',
          lines: ['Flat 2 Test Walk', 'London', 'City of London', 'Greater London', 'SW16 1AQ'],
          listStyle: ListStyle.noMarkers,
        },
        { key: 'Gender', lines: ['Male'] },
        { key: 'Ethnicity', lines: ['British'] },
        { key: 'Preferred language', lines: ['English'] },
        { key: 'Religion or belief', lines: ['Agnostic'] },
        { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
        { key: 'Email address', lines: ['alex.river@example.com'], listStyle: ListStyle.noMarkers },
        { key: 'Phone number', lines: ['0123456789'], listStyle: ListStyle.noMarkers },
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
        null,
        null,
        'service-provider',
        true,
        deliusServiceUser,
        riskSummary,
        defaultStaffDetails
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
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          defaultStaffDetails
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            key: 'Criminogenic needs',
            lines: ['Thinking and attitudes', 'Accommodation'],
            listStyle: ListStyle.noMarkers,
          },
          {
            key: 'Identify needs',
            lines: ["Alex is currently sleeping on her aunt's sofa"],
          },
          {
            key: 'Other mobility, disability or accessibility needs',
            lines: ['She uses a wheelchair'],
          },
          { key: 'Interpreter required', lines: ['Yes'] },
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
          null,
          null,
          'service-provider',
          true,
          deliusServiceUser,
          riskSummary,
          defaultStaffDetails
        )

        expect(presenter.serviceUserNeeds).toEqual([
          {
            key: 'Criminogenic needs',
            lines: ['Thinking and attitudes', 'Accommodation'],
            listStyle: ListStyle.noMarkers,
          },
          {
            key: 'Identify needs',
            lines: ['N/A'],
          },
          {
            key: 'Other mobility, disability or accessibility needs',
            lines: ['N/A'],
          },
          { key: 'Interpreter required', lines: ['No'] },
          { key: 'Interpreter language', lines: ['N/A'] },
          {
            key: 'Primary language',
            lines: ['English'],
          },
          {
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
})
