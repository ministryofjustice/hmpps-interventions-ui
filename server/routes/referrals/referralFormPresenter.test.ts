import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import referralFormSectionFactory from '../../../testutils/factories/referralFormSection'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe('ReferralFormPresenter', () => {
  describe('sections', () => {
    describe('review service user information section', () => {
      describe('when no required values have been set', () => {
        it('should contain a "Not started" label and "server-user-details" url visible', () => {
          const referral = draftReferralFactory.build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information').build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion', ReferralFormStatus.CannotStartYet)
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "Service user details" has been set', () => {
        it('should contain a "Not started" label and "risk-information" url visible', () => {
          const referral = draftReferralFactory.serviceUserSelected().build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information').build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion', ReferralFormStatus.CannotStartYet)
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "risk information" has been set', () => {
        it('should contain a "Not started" label and "needs-and-requirements" url visible', () => {
          const referral = draftReferralFactory.serviceUserSelected().riskInformation().build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion', ReferralFormStatus.CannotStartYet)
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and service category details section can be started', () => {
          const referral = draftReferralFactory.serviceUserSelected().riskInformation().needsAndRequirements().build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion', ReferralFormStatus.NotStarted, 'relevant-sentence')
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
    describe('service category referral details section', () => {
      describe('when "relevant sentence" has been set', () => {
        it('should contain a "Not Started" label and "relevant-sentence" url visible', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "desired outcomes" has been set', () => {
        it('should contain a "Not Started" label and "complexity-level" url visible', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .desiredOutcomes()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`,
                `service-category/${serviceCategory.id}/complexity-level`
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "complexity level" has been set', () => {
        it('should contain a "Not Started" label and "completion-deadline" url visible', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .desiredOutcomes()
            .complexityLevel()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`,
                `service-category/${serviceCategory.id}/complexity-level`,
                'completion-deadline'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "date completed by" has been set', () => {
        it('should contain a "Not Started" label and "rar-days" url visible', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .desiredOutcomes()
            .complexityLevel()
            .completionDate()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`,
                `service-category/${serviceCategory.id}/complexity-level`,
                'completion-deadline',
                'rar-days'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "rar days" has been set', () => {
        it('should contain a "Not Started" label and "further-information" url visible', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .desiredOutcomes()
            .complexityLevel()
            .completionDate()
            .rarDays()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`,
                `service-category/${serviceCategory.id}/complexity-level`,
                'completion-deadline',
                'rar-days',
                'further-information'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and allow user to submit answers', () => {
          const serviceCategory = serviceCategoryFactory.build()

          const referral = draftReferralFactory
            .serviceUserSelected()
            .riskInformation()
            .needsAndRequirements()
            .serviceCategoriesSelected([serviceCategory.id])
            .relevantSentence()
            .desiredOutcomes()
            .complexityLevel()
            .completionDate()
            .rarDays()
            .furtherInformation()
            .build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails(
                'social inclusion',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                `service-category/${serviceCategory.id}/desired-outcomes`,
                `service-category/${serviceCategory.id}/complexity-level`,
                'completion-deadline',
                'rar-days',
                'further-information'
              )
              .build(),
            referralFormSectionFactory
              .checkAnswers(ReferralFormStatus.NotStarted)
              .build({ tasks: [{ title: 'Check your answers', url: 'check-answers' }] }),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "serviceCategoryIds" have not been set on the referral', () => {
        // TODO IC-1686: add more detail when adding links for cohort services to referral form
        it('should display an empty link for selecting desired outcomes and complexity level', () => {
          const referral = draftReferralFactory.serviceUserSelected().riskInformation().needsAndRequirements().build()

          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion', ReferralFormStatus.NotStarted, 'relevant-sentence', null, null)
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
  })
})
