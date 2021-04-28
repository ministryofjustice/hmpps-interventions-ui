import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'

describe('NeedsAndRequirementsPresenter', () => {
  describe('summary', () => {
    it('returns a summary of the service user’s details', () => {
      const referral = draftReferralFactory.serviceCategorySelected().build()
      const presenter = new NeedsAndRequirementsPresenter(referral)

      expect(presenter.summary).toEqual([
        { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], isList: true },
        { key: 'Gender', lines: ['Male'], isList: false },
      ])
    })
  })

  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new NeedsAndRequirementsPresenter(referral, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = draftReferralFactory.serviceCategorySelected().build()
        const presenter = new NeedsAndRequirementsPresenter(referral, {
          errors: [
            {
              formFields: ['has-additional-responsibilities'],
              errorSummaryLinkedField: 'has-additional-responsibilities',
              message: 'has-additional-responsibilities msg',
            },
            {
              formFields: ['needs-interpreter'],
              errorSummaryLinkedField: 'needs-interpreter',
              message: 'needs-interpreter msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'needs-interpreter', message: 'needs-interpreter msg' },
          { field: 'has-additional-responsibilities', message: 'has-additional-responsibilities msg' },
        ])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = draftReferralFactory
        .serviceCategorySelected()
        .serviceUserSelected()
        .build({ serviceUser: { firstName: 'Geoffrey' } })
      const presenter = new NeedsAndRequirementsPresenter(referral)

      expect(presenter.text).toEqual({
        accessibilityNeeds: {
          errorMessage: null,
          hint: 'For example, if they use a wheelchair, use a hearing aid or have a learning difficulty.',
          label: 'Does Geoffrey have any other mobility, disability or accessibility needs? (optional)',
        },
        additionalNeedsInformation: {
          errorMessage: null,
          label: 'Additional information about Geoffrey’s needs (optional)',
        },
        hasAdditionalResponsibilities: {
          errorMessage: null,
          hint: 'For example, times and dates when they are at work.',
          label: 'Does Geoffrey have caring or employment responsibilities?',
        },
        interpreterLanguage: {
          errorMessage: null,
          label: 'What language?',
        },
        needsInterpreter: {
          errorMessage: null,
          label: 'Does Geoffrey need an interpreter?',
        },
        title: 'Geoffrey’s needs and requirements',
        whenUnavailable: {
          errorMessage: null,
          label: 'Provide details of when Geoffrey will not be able to attend sessions',
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = draftReferralFactory
          .serviceCategorySelected()
          .serviceUserSelected()
          .build({ serviceUser: { firstName: 'Geoffrey' } })
        const presenter = new NeedsAndRequirementsPresenter(referral, {
          errors: [
            {
              formFields: ['accessibility-needs'],
              errorSummaryLinkedField: 'accessibility-needs',
              message: 'accessibilityNeeds msg',
            },
            {
              formFields: ['interpreter-language'],
              errorSummaryLinkedField: 'interpreter-language',
              message: 'interpreterLanguage msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          accessibilityNeeds: {
            errorMessage: 'accessibilityNeeds msg',
          },
          additionalNeedsInformation: {
            errorMessage: null,
          },
          hasAdditionalResponsibilities: {
            errorMessage: null,
          },
          interpreterLanguage: {
            errorMessage: 'interpreterLanguage msg',
          },
          needsInterpreter: {
            errorMessage: null,
          },
          whenUnavailable: {
            errorMessage: null,
          },
        })
      })
    })
  })

  // This is tested in detail in the tests for ReferralDataPresenterUtils.
  // I’m just hoping to test a little here that things are glued together correctly.
  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = draftReferralFactory.build()
        const presenter = new NeedsAndRequirementsPresenter(referral)

        expect(presenter.fields).toEqual({
          additionalNeedsInformation: '',
          accessibilityNeeds: '',
          needsInterpreter: null,
          interpreterLanguage: '',
          hasAdditionalResponsibilities: null,
          whenUnavailable: '',
        })
      })
    })

    describe('when there is data on the referral', () => {
      it('replays the data from the referral', () => {
        const referral = draftReferralFactory.build({
          additionalNeedsInformation: 'She does not have a place to live',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: false,
          whenUnavailable: null,
        })
        const presenter = new NeedsAndRequirementsPresenter(referral)

        expect(presenter.fields).toEqual({
          additionalNeedsInformation: 'She does not have a place to live',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: false,
          whenUnavailable: '',
        })
      })
    })

    describe('when there is user input data', () => {
      it('replays the user input data', () => {
        const referral = draftReferralFactory.build({
          additionalNeedsInformation: 'She does not have a place to live',
          accessibilityNeeds: 'She uses a wheelchair',
          needsInterpreter: true,
          interpreterLanguage: 'Spanish',
          hasAdditionalResponsibilities: false,
          whenUnavailable: null,
        })
        const userInputData = {
          'additional-needs-information': '',
          'accessibility-needs': 'She has limited hearing',
          'needs-interpreter': 'no',
          'interpreter-language': '',
          'has-additional-responsibilities': 'yes',
          'when-unavailable': 'She works Fridays 9am - midday',
        }
        const presenter = new NeedsAndRequirementsPresenter(referral, null, userInputData)

        expect(presenter.fields).toEqual({
          additionalNeedsInformation: '',
          accessibilityNeeds: 'She has limited hearing',
          needsInterpreter: false,
          interpreterLanguage: '',
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'She works Fridays 9am - midday',
        })
      })
    })
  })
})
