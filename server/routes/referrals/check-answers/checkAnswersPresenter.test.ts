import CheckAnswersPresenter from './checkAnswersPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../../testutils/factories/intervention'
import deliusConvictionFactory from '../../../../testutils/factories/deliusConviction'
import deliusOffenceFactory from '../../../../testutils/factories/deliusOffence'
import deliusSentenceFactory from '../../../../testutils/factories/deliusSentence'
import { ListStyle } from '../../../utils/summaryList'
import expandedDeliusServiceUserFactory from '../../../../testutils/factories/expandedDeliusServiceUser'

describe(CheckAnswersPresenter, () => {
  const parameterisedDraftReferralFactory = draftReferralFactory.params({
    serviceUser: {
      crn: 'X862134',
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
  })
  const deliusServiceUser = expandedDeliusServiceUserFactory.build({
    contactDetails: {
      emailAddresses: ['alex.river@example.com'],
      phoneNumbers: [
        {
          number: '0123456789',
          type: 'MOBILE',
        },
      ],
      addresses: [
        {
          addressNumber: 'Flat 10',
          buildingName: null,
          streetName: 'Test Walk',
          postcode: 'SW16 1AQ',
          town: 'London',
          district: 'City of London',
          county: 'Greater London',
          from: '2021-01-01',
          to: null,
          noFixedAbode: false,
        },
      ],
    },
  })
  const serviceCategories = serviceCategoryFactory.buildList(3)
  const conviction = deliusConvictionFactory.build()

  describe('serviceUserDetailsSection', () => {
    const referral = parameterisedDraftReferralFactory.build()
    const presenter = new CheckAnswersPresenter(
      referral,
      interventionFactory.build({ serviceCategories }),
      conviction,
      deliusServiceUser
    )

    describe('title', () => {
      it('returns the section title', () => {
        expect(presenter.serviceUserDetailsSection.title).toEqual('Alex’s personal details')
      })
    })

    describe('summary', () => {
      it('returns the service user’s details', () => {
        expect(presenter.serviceUserDetailsSection.summary).toEqual([
          { key: 'CRN', lines: ['X862134'] },
          { key: 'Title', lines: ['Mr'] },
          { key: 'First name', lines: ['Alex'] },
          { key: 'Last name', lines: ['River'] },
          { key: 'Date of birth', lines: ['1 January 1980'] },
          {
            key: 'Address',
            lines: ['Flat 10 Test Walk', 'London', 'City of London', 'Greater London', 'SW16 1AQ'],
            listStyle: ListStyle.noMarkers,
          },
          { key: 'Gender', lines: ['Male'] },
          { key: 'Ethnicity', lines: ['British'] },
          { key: 'Preferred language', lines: ['English'] },
          { key: 'Religion or belief', lines: ['Agnostic'] },
          { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
          {
            key: 'Email address',
            lines: ['alex.river@example.com'],
            listStyle: ListStyle.noMarkers,
          },
          {
            key: 'Phone number',
            lines: ['0123456789'],
            listStyle: ListStyle.noMarkers,
          },
        ])
      })
    })
  })

  describe('riskSection', () => {
    const referral = parameterisedDraftReferralFactory.build({
      id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
      additionalRiskInformation: 'Past assault of strangers',
    })
    const presenter = new CheckAnswersPresenter(
      referral,
      interventionFactory.build({ serviceCategories }),
      conviction,
      deliusServiceUser
    )

    describe('title', () => {
      it('returns the risk information section title', () => {
        expect(presenter.riskSection.title).toEqual('Alex’s risk information')
      })
    })

    describe('summary', () => {
      it('additional risk information', () => {
        expect(presenter.riskSection.summary[0]).toEqual({
          key: 'Additional risk information',
          lines: ['Past assault of strangers'],
          changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/risk-information',
        })
      })
    })
  })

  describe('needsAndRequirementsSection', () => {
    describe('title', () => {
      const referral = parameterisedDraftReferralFactory.build()
      const presenter = new CheckAnswersPresenter(
        referral,
        interventionFactory.build({ serviceCategories }),
        conviction,
        deliusServiceUser
      )

      it('returns the section title', () => {
        expect(presenter.needsAndRequirementsSection.title).toEqual('Alex’s needs and requirements')
      })
    })

    describe('summary', () => {
      describe('additional needs information', () => {
        const referral = parameterisedDraftReferralFactory.build({
          id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
          additionalNeedsInformation: 'Some additional needs information',
        })
        const presenter = new CheckAnswersPresenter(
          referral,
          interventionFactory.build({ serviceCategories }),
          conviction,
          deliusServiceUser
        )

        it('returns the value from the referral', () => {
          expect(presenter.needsAndRequirementsSection.summary[0]).toEqual({
            key: 'Additional information about Alex’s needs (optional)',
            lines: ['Some additional needs information'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
          })
        })
      })

      describe('accessibility needs', () => {
        const referral = parameterisedDraftReferralFactory.build({
          id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
          accessibilityNeeds: 'Some accessibility needs information',
        })
        const presenter = new CheckAnswersPresenter(
          referral,
          interventionFactory.build({ serviceCategories }),
          conviction,
          deliusServiceUser
        )

        it('returns the value from the referral', () => {
          expect(presenter.needsAndRequirementsSection.summary[1]).toEqual({
            key: 'Does Alex have any other mobility, disability or accessibility needs? (optional)',
            lines: ['Some accessibility needs information'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
          })
        })
      })

      describe('needs interpreter', () => {
        it('includes the answer', () => {
          const referral = parameterisedDraftReferralFactory.build({
            id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
            needsInterpreter: false,
          })
          const presenter = new CheckAnswersPresenter(
            referral,
            interventionFactory.build({ serviceCategories }),
            conviction,
            deliusServiceUser
          )

          expect(presenter.needsAndRequirementsSection.summary[2]).toEqual({
            key: 'Does Alex need an interpreter?',
            lines: ['No'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
          })
        })

        describe('when an interpreter is needed', () => {
          const referral = parameterisedDraftReferralFactory.build({
            id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
            needsInterpreter: true,
            interpreterLanguage: 'Spanish',
          })
          const presenter = new CheckAnswersPresenter(
            referral,
            interventionFactory.build({ serviceCategories }),
            conviction,
            deliusServiceUser
          )

          it('also includes the language', () => {
            expect(presenter.needsAndRequirementsSection.summary[2]).toEqual({
              key: 'Does Alex need an interpreter?',
              lines: ['Yes. Spanish'],
              changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
            })
          })
        })
      })

      describe('has additional responsibilities', () => {
        it('includes the answer', () => {
          const referral = parameterisedDraftReferralFactory.build({
            id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
            hasAdditionalResponsibilities: false,
          })
          const presenter = new CheckAnswersPresenter(
            referral,
            interventionFactory.build({ serviceCategories }),
            conviction,
            deliusServiceUser
          )

          expect(presenter.needsAndRequirementsSection.summary[3]).toEqual({
            key: 'Does Alex have caring or employment responsibilities?',
            lines: ['No'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
          })
        })

        describe('when they have additional responsibilities', () => {
          const referral = parameterisedDraftReferralFactory.build({
            id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
            hasAdditionalResponsibilities: true,
            whenUnavailable: 'Alex can’t attend on Fridays',
          })
          const presenter = new CheckAnswersPresenter(
            referral,
            interventionFactory.build({ serviceCategories }),
            conviction,
            deliusServiceUser
          )

          it('includes information about when they’re unavailable', () => {
            expect(presenter.needsAndRequirementsSection.summary[3]).toEqual({
              key: 'Does Alex have caring or employment responsibilities?',
              lines: ['Yes. Alex can’t attend on Fridays'],
              changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/needs-and-requirements',
            })
          })
        })
      })
    })
  })

  describe('referralDetailsSections', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({
      id: '428ee70f-3001-4399-95a6-ad25eaaede16',
      name: 'Accommodation',
      complexityLevels: [
        { id: '1', title: 'Low complexity', description: 'Low complexity accommodation description' },
        { id: '2', title: 'High complexity', description: 'High complexity accommodation description' },
      ],
      desiredOutcomes: [
        {
          id: '1',
          description: 'Accommodation desired outcome example 1',
        },
        {
          id: '2',
          description: 'Accommodation desired outcome example 2',
        },
        {
          id: '3',
          description: 'Accommodation desired outcome example 3',
        },
      ],
    })
    const eteServiceCategory = serviceCategoryFactory.build({
      id: 'ca374ac3-84eb-4b91-bea7-9005398f426f',
      name: 'Education, training and employment',
      complexityLevels: [
        { id: '3', title: 'Low complexity', description: 'Low complexity ETE description' },
        { id: '4', title: 'High complexity', description: 'High complexity ETE description' },
      ],
    })
    const referral = parameterisedDraftReferralFactory.build({
      id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
      serviceCategoryIds: [accommodationServiceCategory.id, eteServiceCategory.id],
      complexityLevels: [
        { serviceCategoryId: accommodationServiceCategory.id, complexityLevelId: '1' },
        { serviceCategoryId: eteServiceCategory.id, complexityLevelId: '4' },
      ],
      desiredOutcomes: [
        { serviceCategoryId: accommodationServiceCategory.id, desiredOutcomesIds: ['1', '3'] },
        { serviceCategoryId: eteServiceCategory.id, desiredOutcomesIds: ['2'] },
      ],
    })
    const intervention = interventionFactory.build({
      serviceCategories: [accommodationServiceCategory, eteServiceCategory, serviceCategoryFactory.build()],
    })
    const presenter = new CheckAnswersPresenter(referral, intervention, conviction, deliusServiceUser)

    it('contains a section for each service category in the referral', () => {
      expect(presenter.referralDetailsSections).toMatchObject([
        { title: 'Accommodation referral details' },
        { title: 'Education, training and employment referral details' },
      ])
    })

    describe('a section', () => {
      const section = presenter.referralDetailsSections[0]

      describe('complexity level', () => {
        it('includes the chosen complexity level’s title and description', () => {
          const item = section.summary[0]

          expect(item).toEqual({
            key: 'Complexity level',
            lines: ['Low complexity', '', 'Low complexity accommodation description'],
            changeLink:
              '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/complexity-level',
          })
        })
      })

      describe('desired outcomes', () => {
        it('includes the chosen desired outcomes’ descriptions', () => {
          const item = section.summary[1]

          expect(item).toEqual({
            key: 'Desired outcomes',
            lines: ['Accommodation desired outcome example 1', 'Accommodation desired outcome example 3'],
            listStyle: ListStyle.bulleted,
            changeLink:
              '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/service-category/428ee70f-3001-4399-95a6-ad25eaaede16/desired-outcomes',
          })
        })
      })
    })
  })

  describe('serviceCategoriesSummary', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({
      name: 'Accommodation',
    })
    const eteServiceCategory = serviceCategoryFactory.build({
      name: 'Education, training and employment',
    })

    describe('for a single-service intervention', () => {
      const intervention = interventionFactory.build({
        serviceCategories: [accommodationServiceCategory],
      })

      it('returns null', () => {
        const referral = parameterisedDraftReferralFactory.build({
          serviceCategoryIds: [accommodationServiceCategory.id],
        })

        const presenter = new CheckAnswersPresenter(referral, intervention, conviction, deliusServiceUser)

        expect(presenter.serviceCategoriesSummary).toBeNull()
      })
    })

    describe('for a cohort intervention', () => {
      const intervention = interventionFactory.build({
        serviceCategories: [accommodationServiceCategory, eteServiceCategory, serviceCategoryFactory.build()],
      })

      describe('with a single service category chosen in the referral', () => {
        const referral = parameterisedDraftReferralFactory.build({
          id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
          serviceCategoryIds: [accommodationServiceCategory.id],
        })

        it('lists the service categories chosen in the referral', () => {
          const presenter = new CheckAnswersPresenter(referral, intervention, conviction, deliusServiceUser)
          expect(presenter.serviceCategoriesSummary).toEqual([
            {
              key: 'Selected service categories',
              lines: ['Accommodation'],
              listStyle: ListStyle.noMarkers,
              changeLink: `/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/service-categories`,
            },
          ])
        })
      })

      describe('with multiple service categories chosen in the referral', () => {
        const referral = parameterisedDraftReferralFactory.build({
          id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
          serviceCategoryIds: [accommodationServiceCategory.id, eteServiceCategory.id],
        })

        it('lists the service categories chosen in the referral', () => {
          const presenter = new CheckAnswersPresenter(referral, intervention, conviction, deliusServiceUser)
          expect(presenter.serviceCategoriesSummary).toEqual([
            {
              key: 'Selected service categories',
              lines: ['Accommodation', 'Education, training and employment'],
              listStyle: ListStyle.noMarkers,
              changeLink: `/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/service-categories`,
            },
          ])
        })
      })
    })
  })

  describe('sentenceInformationSummary', () => {
    const referral = parameterisedDraftReferralFactory.build({ id: '03e9e6cd-a45f-4dfc-adad-06301349042e' })
    const intervention = interventionFactory.build()
    const assaultConviction = deliusConvictionFactory.build({
      offences: [
        deliusOffenceFactory.build({
          mainOffence: true,
          detail: {
            mainCategoryDescription: 'Common and other types of assault',
          },
        }),
      ],
      sentence: deliusSentenceFactory.build({
        expectedSentenceEndDate: '2025-09-15',
      }),
    })

    it('returns information about the conviction', () => {
      const presenter = new CheckAnswersPresenter(referral, intervention, assaultConviction, deliusServiceUser)

      expect(presenter.sentenceInformationSummary).toEqual([
        {
          key: 'Sentence',
          lines: ['Common and other types of assault'],
          changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/relevant-sentence',
        },
        {
          key: 'Subcategory',
          lines: ['Common assault and battery'],
          changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/relevant-sentence',
        },
        {
          key: 'End of sentence date',
          lines: ['15 September 2025'],
          changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/relevant-sentence',
        },
      ])
    })
  })

  describe('completionDeadlineSection', () => {
    const intervention = interventionFactory.build({ contractType: { name: 'Women’s services' } })
    const referral = parameterisedDraftReferralFactory.build({
      id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
      completionDeadline: '2021-10-24',
    })
    const presenter = new CheckAnswersPresenter(referral, intervention, conviction, deliusServiceUser)

    describe('title', () => {
      it('includes the contract type name', () => {
        expect(presenter.completionDeadlineSection.title).toEqual('Women’s services completion date')
      })
    })

    describe('summary', () => {
      it('returns information about the completion deadline', () => {
        expect(presenter.completionDeadlineSection.summary).toEqual([
          {
            key: 'Date',
            lines: ['24 October 2021'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/completion-deadline',
          },
        ])
      })
    })
  })

  describe('enforceableDaysSummary', () => {
    const referral = parameterisedDraftReferralFactory.build({
      id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
      maximumEnforceableDays: 15,
    })

    it('states the maximum number of enforceable days to use', () => {
      const presenter = new CheckAnswersPresenter(
        referral,
        interventionFactory.build({ serviceCategories }),
        conviction,
        deliusServiceUser
      )

      expect(presenter.enforceableDaysSummary).toEqual([
        {
          key: 'Maximum number of enforceable days',
          lines: ['15'],
          changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/enforceable-days',
        },
      ])
    })
  })

  describe('furtherInformationSummary', () => {
    describe('when the referral’s further information is not empty', () => {
      const referral = parameterisedDraftReferralFactory.build({
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        furtherInformation: 'Some further information',
      })

      it('contains the referral’s further information', () => {
        const presenter = new CheckAnswersPresenter(
          referral,
          interventionFactory.build({ serviceCategories }),
          conviction,
          deliusServiceUser
        )

        expect(presenter.furtherInformationSummary).toEqual([
          {
            key: 'Further information for the provider',
            lines: ['Some further information'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/further-information',
          },
        ])
      })
    })

    describe('when the referral’s further information is empty', () => {
      const referral = parameterisedDraftReferralFactory.build({
        id: '03e9e6cd-a45f-4dfc-adad-06301349042e',
        furtherInformation: '',
      })

      it('states that there is no further information', () => {
        const presenter = new CheckAnswersPresenter(
          referral,
          interventionFactory.build({ serviceCategories }),
          conviction,
          deliusServiceUser
        )

        expect(presenter.furtherInformationSummary).toEqual([
          {
            key: 'Further information for the provider',
            lines: ['None'],
            changeLink: '/referrals/03e9e6cd-a45f-4dfc-adad-06301349042e/further-information',
          },
        ])
      })
    })
  })
})
