import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'
import deliusServiceUser from '../../../testutils/factories/deliusServiceUser'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe(ShowReferralPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({
    name: 'accommodation',
    complexityLevels: [
      {
        id: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
        title: 'Low complexity',
        description:
          'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
      },
      {
        id: '110f2405-d944-4c15-836c-0c6684e2aa78',
        title: 'Medium complexity',
        description:
          'Service User is at risk of homelessness/is homeless, or will be on release from prison. Service User has had some success in maintaining atenancy but may have additional needs e.g. Learning Difficulties and/or Learning Disabilities or other challenges currently.',
      },
      {
        id: 'c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6',
        title: 'High complexity',
        description:
          'Service User is homeless or in temporary/unstable accommodation, or will be on release from prison. Service User has poor accommodation history, complex needs and limited skills to secure or sustain a tenancy.',
      },
    ],
    desiredOutcomes: [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service User makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service User is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ],
  })

  const referralParams = {
    referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
  }
  const deliusUser = deliusUserFactory.build({
    firstName: 'Bernard',
    surname: 'Beaks',
    email: 'bernard.beaks@justice.gov.uk',
  })
  const serviceUser = deliusServiceUser.build({
    firstName: 'Alex',
    surname: 'River',
    dateOfBirth: '1980-01-01',
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
  const hmppsAuthUser = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })

  describe('assignmentFormAction', () => {
    it('returns the relative URL for the check assignment page', () => {
      const referral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(referral, serviceCategory, deliusUser, serviceUser, null, null)

      expect(presenter.assignmentFormAction).toEqual(`/service-provider/referrals/${referral.id}/assignment/check`)
    })
  })

  describe('text', () => {
    describe('title', () => {
      describe('when the referral doesn’t have an assigned caseworker', () => {
        it('returns a title to be displayed', () => {
          const sentReferral = sentReferralFactory.build(referralParams)
          const presenter = new ShowReferralPresenter(
            sentReferral,
            serviceCategory,
            deliusUser,
            serviceUser,
            null,
            null
          )

          expect(presenter.text.title).toEqual('Who do you want to assign this accommodation referral to?')
        })
      })

      describe('when the referral has an assigned caseworker', () => {
        it('returns a title to be displayed', () => {
          const sentReferral = sentReferralFactory.assigned().build(referralParams)
          const presenter = new ShowReferralPresenter(
            sentReferral,
            serviceCategory,
            deliusUser,
            serviceUser,
            hmppsAuthUser,
            null
          )

          expect(presenter.text.title).toEqual('Accommodation referral for Jenny Jones')
        })
      })
    })

    describe('interventionDetailsSummaryHeading', () => {
      it('returns text to be displayed including service category name', () => {
        const sentReferral = sentReferralFactory.assigned().build(referralParams)
        const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, deliusUser, serviceUser, null, null)

        expect(presenter.text.interventionDetailsSummaryHeading).toEqual('Accommodation intervention details')
      })
    })

    describe('assignedTo', () => {
      describe('when the referral doesn’t have an assigned caseworker', () => {
        it('returns null', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(referral, serviceCategory, deliusUser, serviceUser, null, null)

          expect(presenter.text.assignedTo).toBeNull()
        })
      })

      describe('when the referral has an assigned caseworker', () => {
        it('returns the name of the assignee', () => {
          const referral = sentReferralFactory.unassigned().build()
          const presenter = new ShowReferralPresenter(
            referral,
            serviceCategory,
            deliusUser,
            serviceUser,
            hmppsAuthUser,
            null
          )

          expect(presenter.text.assignedTo).toEqual('John Smith')
        })
      })
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details', () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, deliusUser, serviceUser, null, null)

      expect(presenter.probationPractitionerDetails).toEqual([
        { isList: false, key: 'Name', lines: ['Bernard Beaks'] },
        { isList: false, key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
      ])
    })
  })

  describe('interventionDetails', () => {
    describe('when all possibly optional fields have been set on the referral, including RAR days', () => {
      const referralWithAllOptionalFields = sentReferralFactory.build({
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryId: serviceCategory.id,
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          furtherInformation: 'Some information about the service user',
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
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
          usingRarDays: true,
          maximumRarDays: 10,
        },
      })

      it('returns a summary list of intervention details', () => {
        const presenter = new ShowReferralPresenter(
          referralWithAllOptionalFields,
          serviceCategory,
          deliusUser,
          serviceUser,
          null,
          null
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Sentence information', lines: ['Not currently set'], isList: false },
          {
            key: 'Desired outcomes',
            lines: [
              'Service User makes progress in obtaining accommodation',
              'Service User is helped to secure social or supported housing',
            ],
            isList: true,
          },
          {
            key: 'Complexity level',
            lines: [
              'Low complexity',
              'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            isList: false,
          },
          { key: 'Date to be completed by', lines: ['1 April 2021'], isList: false },
          {
            key: 'Maximum number of enforceable days',
            lines: ['10'],
            isList: false,
          },
          {
            key: 'Further information for the provider',
            lines: ['Some information about the service user'],
            isList: false,
          },
        ])
      })
    })

    describe('when no optional fields have been set on the referral and no RAR days are selected', () => {
      const referralWithNoOptionalFields = sentReferralFactory.build({
        referral: {
          createdAt: '2020-12-07T20:45:21.986389Z',
          completionDeadline: '2021-04-01',
          serviceProvider: {
            name: 'Harmony Living',
          },
          serviceCategoryId: serviceCategory.id,
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          furtherInformation: '',
          desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
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
          usingRarDays: false,
          maximumRarDays: null,
        },
      })

      it("returns a summary list of intervention details with a message for fields that haven't been set", () => {
        const presenter = new ShowReferralPresenter(
          referralWithNoOptionalFields,
          serviceCategory,
          deliusUser,
          serviceUser,
          null,
          null
        )

        expect(presenter.interventionDetails).toEqual([
          { key: 'Sentence information', lines: ['Not currently set'], isList: false },
          {
            key: 'Desired outcomes',
            lines: [
              'Service User makes progress in obtaining accommodation',
              'Service User is helped to secure social or supported housing',
            ],
            isList: true,
          },
          {
            key: 'Complexity level',
            lines: [
              'Low complexity',
              'Service User has some capacity and means to secure and/or maintain suitable accommodation but requires some support and guidance to do so.',
            ],
            isList: false,
          },
          { key: 'Date to be completed by', lines: ['1 April 2021'], isList: false },
          {
            key: 'Maximum number of enforceable days',
            lines: ['N/A'],
            isList: false,
          },
          {
            key: 'Further information for the provider',
            lines: ['N/A'],
            isList: false,
          },
        ])
      })
    })
  })

  describe('serviceUserPersonalDetails', () => {
    it("returns a summary list of the service user's personal details", () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, deliusUser, serviceUser, null, null)

      expect(presenter.serviceUserDetails).toEqual([
        { key: 'CRN', lines: [sentReferral.referral.serviceUser.crn], isList: false },
        { key: 'Title', lines: [sentReferral.referral.serviceUser.title], isList: false },
        { key: 'First name', lines: [sentReferral.referral.serviceUser.firstName], isList: false },
        { key: 'Last name', lines: [sentReferral.referral.serviceUser.lastName], isList: false },
        { key: 'Date of birth', lines: [sentReferral.referral.serviceUser.dateOfBirth], isList: false },
        { key: 'Gender', lines: [sentReferral.referral.serviceUser.gender], isList: false },
        { key: 'Ethnicity', lines: [sentReferral.referral.serviceUser.ethnicity], isList: false },
        { key: 'Preferred language', lines: [sentReferral.referral.serviceUser.preferredLanguage], isList: false },
        { key: 'Religion or belief', lines: [sentReferral.referral.serviceUser.religionOrBelief], isList: false },
        { key: 'Disabilities', lines: sentReferral.referral.serviceUser.disabilities || [], isList: true },
      ])
    })
  })

  describe('serviceUserRisks', () => {
    it("returns a summary list of the service user's risk information", () => {
      const sentReferral = sentReferralFactory.build(referralParams)
      const presenter = new ShowReferralPresenter(sentReferral, serviceCategory, deliusUser, serviceUser, null, null)

      expect(presenter.serviceUserRisks).toEqual([
        { key: 'Risk to known adult', lines: ['Medium'], isList: false },
        { key: 'Risk to public', lines: ['Low'], isList: false },
        { key: 'Risk to children', lines: ['Low'], isList: false },
        { key: 'Risk to staff', lines: ['Low'], isList: false },
        { key: 'Additional risk information', lines: [sentReferral.referral.additionalRiskInformation], isList: false },
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
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
            furtherInformation: 'Some information about the service user',
            desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
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
            usingRarDays: true,
            maximumRarDays: 10,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithAllConditionalFields,
          serviceCategory,
          deliusUser,
          serviceUser,
          null,
          null
        )

        expect(presenter.serviceUserNeeds).toEqual([
          { key: 'Criminogenic needs', lines: ['Thinking and attitudes', 'Accommodation'], isList: true },
          {
            key: 'Identify needs',
            lines: ["Alex is currently sleeping on her aunt's sofa"],
            isList: false,
          },
          {
            key: 'Other mobility, disability or accessibility needs',
            lines: ['She uses a wheelchair'],
            isList: false,
          },
          { key: 'Interpreter required', lines: ['Yes'], isList: false },
          { key: 'Interpreter language', lines: ['Spanish'], isList: false },
          {
            key: 'Primary language',
            lines: ['Catalan'],
            isList: false,
          },
          {
            key: 'Caring or employment responsibilities',
            lines: ['Yes'],
            isList: false,
          },
          {
            key: `Provide details of when Alex will not be able to attend sessions`,
            lines: ['She works Mondays 9am - midday'],
            isList: false,
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
            serviceCategoryId: serviceCategory.id,
            complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
            furtherInformation: '',
            desiredOutcomesIds: ['65924ac6-9724-455b-ad30-906936291421', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'],
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
            usingRarDays: false,
            maximumRarDays: null,
          },
        })

        const presenter = new ShowReferralPresenter(
          referralWithNoConditionalFields,
          serviceCategory,
          deliusUser,
          serviceUser,
          null,
          null
        )

        expect(presenter.serviceUserNeeds).toEqual([
          { key: 'Criminogenic needs', lines: ['Thinking and attitudes', 'Accommodation'], isList: true },
          {
            key: 'Identify needs',
            lines: ['N/A'],
            isList: false,
          },
          {
            key: 'Other mobility, disability or accessibility needs',
            lines: ['N/A'],
            isList: false,
          },
          { key: 'Interpreter required', lines: ['No'], isList: false },
          { key: 'Interpreter language', lines: ['N/A'], isList: false },
          {
            key: 'Primary language',
            lines: ['English'],
            isList: false,
          },
          {
            key: 'Caring or employment responsibilities',
            lines: ['No'],
            isList: false,
          },
          {
            key: `Provide details of when Alex will not be able to attend sessions`,
            lines: ['N/A'],
            isList: false,
          },
        ])
      })
    })
  })
})
