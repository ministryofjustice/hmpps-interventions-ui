import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'
import { ListStyle } from '../../utils/summaryList'
import interventionFactory from '../../../testutils/factories/intervention'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import { TagArgs } from '../../utils/govukFrontendTypes'

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
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

  describe('assignmentFormAction', () => {
    it('returns the relative URL for the check assignment page', () => {
      const referral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(referral, intervention, deliusUser, null, null)

      expect(presenter.assignmentFormAction).toEqual(`/service-provider/referrals/${referral.id}/assignment/check`)
    })
  })

  describe('text', () => {
    describe('assignedTo', () => {
      describe('when the referral doesn’t have an assigned caseworker', () => {
        it('returns null', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(referral, intervention, deliusUser, null, null)

          expect(presenter.text.assignedTo).toBeNull()
        })
      })

      describe('when the referral has an assigned caseworker', () => {
        it('returns the name of the assignee', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(referral, intervention, deliusUser, hmppsAuthUser, null)

          expect(presenter.text.assignedTo).toEqual('John Smith')
        })
      })
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, intervention, deliusUser, null, null)

      expect(presenter.probationPractitionerDetails).toEqual([
        { key: 'Name', lines: ['Bernard Beaks'] },
        { key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
      ])
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
          additionalRiskInformation: 'A danger to the elderly',
          maximumEnforceableDays: 10,
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(referralWithAllOptionalFields, intervention, deliusUser, null, null)

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence information', lines: ['Not currently set'] },
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
          additionalRiskInformation: '',
          maximumEnforceableDays: 10,
        },
      })

      it("returns a summary list of intervention details with a message for fields that haven't been set", () => {
        const presenter = new ShowReferralPresenter(referralWithNoOptionalFields, intervention, deliusUser, null, null)

        expect(presenter.interventionDetails).toEqual([
          { key: 'Service type', lines: ['Accommodation'] },
          { key: 'Sentence information', lines: ['Not currently set'] },
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
      const presenter = new ShowReferralPresenter(referral, cohortIntervention, deliusUser, null, null)
      expect(
        presenter.serviceCategorySection(cohortServiceCategories[0], (args: TagArgs): string => {
          return args.text!
        })
      ).toEqual([
        {
          key: 'Complexity level',
          lines: [
            'LOW COMPLEXITY',
            'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
          ],
        },
        {
          key: 'Desired outcomes',
          lines: [
            'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
            'Service User makes progress in obtaining accommodation',
          ],
        },
      ])
    })
  })

  describe('serviceUserPersonalDetails', () => {
    it("returns a summary list of the service user's personal details", () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, intervention, deliusUser, null, null)

      expect(presenter.serviceUserDetails).toEqual([
        { key: 'CRN', lines: ['X123456'] },
        { key: 'Title', lines: ['Mr'] },
        { key: 'First name', lines: ['Jenny'] },
        { key: 'Last name', lines: ['Jones'] },
        { key: 'Date of birth', lines: ['1 January 1980'] },
        { key: 'Gender', lines: ['Male'] },
        { key: 'Ethnicity', lines: ['British'] },
        { key: 'Preferred language', lines: ['English'] },
        { key: 'Religion or belief', lines: ['Agnostic'] },
        { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
      ])
    })
  })

  describe('serviceUserRisks', () => {
    it("returns a summary list of the service user's risk information", () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, intervention, deliusUser, null, null)

      expect(presenter.serviceUserRisks).toEqual([
        {
          key: 'Additional risk information',
          lines: [
            'The Refer and Monitor an Intervention service cannot currently display this risk information. It will be available before Service Providers start using the digital service.',
          ],
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
            additionalRiskInformation: 'A danger to the elderly',
            maximumEnforceableDays: 10,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithAllConditionalFields,
          intervention,
          deliusUser,
          null,
          null
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
            additionalRiskInformation: '',
            maximumEnforceableDays: 10,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithNoConditionalFields,
          intervention,
          deliusUser,
          null,
          null
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
