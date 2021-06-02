import CheckAnswersPresenter from './checkAnswersPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import interventionFactory from '../../../testutils/factories/intervention'
import { ListStyle } from '../../utils/summaryList'

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
  const serviceCategories = serviceCategoryFactory.buildList(3)

  describe('serviceUserDetailsSection', () => {
    const referral = parameterisedDraftReferralFactory.build()
    const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

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
          { key: 'Gender', lines: ['Male'] },
          { key: 'Ethnicity', lines: ['British'] },
          { key: 'Preferred language', lines: ['English'] },
          { key: 'Religion or belief', lines: ['Agnostic'] },
          { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
        ])
      })
    })
  })

  describe('needsAndRequirementsSection', () => {
    describe('title', () => {
      const referral = parameterisedDraftReferralFactory.build()
      const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

      it('returns the section title', () => {
        expect(presenter.needsAndRequirementsSection.title).toEqual('Alex’s needs and requirements')
      })
    })

    describe('summary', () => {
      describe('additional needs information', () => {
        const referral = parameterisedDraftReferralFactory.build({
          additionalNeedsInformation: 'Some additional needs information',
        })
        const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

        it('returns the value from the referral', () => {
          expect(presenter.needsAndRequirementsSection.summary[0]).toEqual({
            key: 'Additional information about Alex’s needs (optional)',
            lines: ['Some additional needs information'],
          })
        })
      })

      describe('accessibility needs', () => {
        const referral = parameterisedDraftReferralFactory.build({
          accessibilityNeeds: 'Some accessibility needs information',
        })
        const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

        it('returns the value from the referral', () => {
          expect(presenter.needsAndRequirementsSection.summary[1]).toEqual({
            key: 'Does Alex have any other mobility, disability or accessibility needs? (optional)',
            lines: ['Some accessibility needs information'],
          })
        })
      })

      describe('needs interpreter', () => {
        it('includes the answer', () => {
          const referral = parameterisedDraftReferralFactory.build({
            needsInterpreter: false,
          })
          const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

          expect(presenter.needsAndRequirementsSection.summary[2]).toEqual({
            key: 'Does Alex need an interpreter?',
            lines: ['No'],
          })
        })

        describe('when an interpreter is needed', () => {
          const referral = parameterisedDraftReferralFactory.build({
            needsInterpreter: true,
            interpreterLanguage: 'Spanish',
          })
          const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

          it('also includes the language', () => {
            expect(presenter.needsAndRequirementsSection.summary[2]).toEqual({
              key: 'Does Alex need an interpreter?',
              lines: ['Yes. Spanish'],
            })
          })
        })
      })

      describe('has additional responsibilities', () => {
        it('includes the answer', () => {
          const referral = parameterisedDraftReferralFactory.build({
            hasAdditionalResponsibilities: false,
          })
          const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

          expect(presenter.needsAndRequirementsSection.summary[3]).toEqual({
            key: 'Does Alex have caring or employment responsibilities?',
            lines: ['No'],
          })
        })

        describe('when they have additional responsibilities', () => {
          const referral = parameterisedDraftReferralFactory.build({
            hasAdditionalResponsibilities: true,
            whenUnavailable: 'Alex can’t attend on Fridays',
          })
          const presenter = new CheckAnswersPresenter(referral, interventionFactory.build({ serviceCategories }))

          it('includes information about when they’re unavailable', () => {
            expect(presenter.needsAndRequirementsSection.summary[3]).toEqual({
              key: 'Does Alex have caring or employment responsibilities?',
              lines: ['Yes. Alex can’t attend on Fridays'],
            })
          })
        })
      })
    })
  })

  describe('referralDetailsSections', () => {
    const accommodationServiceCategory = serviceCategoryFactory.build({
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
      name: 'Education, training and employment',
      complexityLevels: [
        { id: '3', title: 'Low complexity', description: 'Low complexity ETE description' },
        { id: '4', title: 'High complexity', description: 'High complexity ETE description' },
      ],
    })
    const referral = parameterisedDraftReferralFactory.build({
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
    const presenter = new CheckAnswersPresenter(referral, intervention)

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

        const presenter = new CheckAnswersPresenter(referral, intervention)

        expect(presenter.serviceCategoriesSummary).toBeNull()
      })
    })

    describe('for a cohort intervention', () => {
      const intervention = interventionFactory.build({
        serviceCategories: [accommodationServiceCategory, eteServiceCategory, serviceCategoryFactory.build()],
      })

      describe('with a single service category chosen in the referral', () => {
        const referral = parameterisedDraftReferralFactory.build({
          serviceCategoryIds: [accommodationServiceCategory.id],
        })

        it('lists the service categories chosen in the referral', () => {
          const presenter = new CheckAnswersPresenter(referral, intervention)
          expect(presenter.serviceCategoriesSummary).toEqual([
            {
              key: 'Selected service categories',
              lines: ['Accommodation'],
              listStyle: ListStyle.noMarkers,
            },
          ])
        })
      })

      describe('with multiple service categories chosen in the referral', () => {
        const referral = parameterisedDraftReferralFactory.build({
          serviceCategoryIds: [accommodationServiceCategory.id, eteServiceCategory.id],
        })

        it('lists the service categories chosen in the referral', () => {
          const presenter = new CheckAnswersPresenter(referral, intervention)
          expect(presenter.serviceCategoriesSummary).toEqual([
            {
              key: 'Selected service categories',
              lines: ['Accommodation', 'Education, training and employment'],
              listStyle: ListStyle.noMarkers,
            },
          ])
        })
      })
    })
  })
})
