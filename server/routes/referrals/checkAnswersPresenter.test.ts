import CheckAnswersPresenter from './checkAnswersPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
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
  const serviceCategory = serviceCategoryFactory.build()

  describe('serviceUserDetailsSection', () => {
    const referral = parameterisedDraftReferralFactory.build()
    const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
      const presenter = new CheckAnswersPresenter(referral, serviceCategory)

      it('returns the section title', () => {
        expect(presenter.needsAndRequirementsSection.title).toEqual('Alex’s needs and requirements')
      })
    })

    describe('summary', () => {
      describe('additional needs information', () => {
        const referral = parameterisedDraftReferralFactory.build({
          additionalNeedsInformation: 'Some additional needs information',
        })
        const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
        const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
          const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
          const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
          const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
          const presenter = new CheckAnswersPresenter(referral, serviceCategory)

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
})
