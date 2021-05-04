import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import referralFormSectionFactory from '../../../testutils/factories/referralFormSection'

describe('ReferralFormPresenter', () => {
  describe('sections', () => {
    describe('review service user information section', () => {
      describe('when no required values have been set', () => {
        it('should contain a "Not started" label', () => {
          const referral = draftReferralFactory.build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser().status(ReferralFormStatus.NotStarted).build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion')
              .status(ReferralFormStatus.CannotStartYet)
              .build(),
            referralFormSectionFactory.responsibleOfficerDetails().status(ReferralFormStatus.CannotStartYet).build(),
            referralFormSectionFactory.checkAnswers().status(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and interventions details section can be started', () => {
          const referral = draftReferralFactory.serviceUserDetailsSet().build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser().status(ReferralFormStatus.Completed).build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion')
              .status(ReferralFormStatus.NotStarted)
              .build(),
            referralFormSectionFactory.responsibleOfficerDetails().status(ReferralFormStatus.CannotStartYet).build(),
            referralFormSectionFactory.checkAnswers().status(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
    describe('intervention details section', () => {
      describe('when no desired Outcomes have been set', () => {
        it('should contain a "Not Started" label', () => {
          const referral = draftReferralFactory
            .serviceUserDetailsSet()
            .interventionDetailsSet()
            .build({ desiredOutcomesIds: [] })
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser().status(ReferralFormStatus.Completed).build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion')
              .status(ReferralFormStatus.NotStarted)
              .build(),
            referralFormSectionFactory.responsibleOfficerDetails().status(ReferralFormStatus.CannotStartYet).build(),
            referralFormSectionFactory.checkAnswers().status(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and allow user to submit answers', () => {
          const referral = draftReferralFactory.serviceUserDetailsSet().interventionDetailsSet().build()
          const presenter = new ReferralFormPresenter(referral, 'social inclusion')
          const expected = [
            referralFormSectionFactory.reviewServiceUser().status(ReferralFormStatus.Completed).build(),
            referralFormSectionFactory
              .interventionDetails('social inclusion')
              .status(ReferralFormStatus.Completed)
              .build(),
            referralFormSectionFactory.responsibleOfficerDetails().status(ReferralFormStatus.Completed).build(),
            referralFormSectionFactory
              .checkAnswers()
              .status(ReferralFormStatus.Completed)
              .build({ tasks: [{ title: 'Check your answers', url: 'check-answers' }] }),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
  })
})
