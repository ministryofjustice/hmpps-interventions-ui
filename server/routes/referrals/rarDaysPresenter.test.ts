import RarDaysPresenter from './rarDaysPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import interventionFactory from '../../../testutils/factories/intervention'

describe(RarDaysPresenter, () => {
  const intervention = interventionFactory.build({ contractType: { name: "Women's Service" } })
  describe('text', () => {
    it('returns text to be displayed', () => {
      const referral = draftReferralFactory.build()

      const presenter = new RarDaysPresenter(referral, intervention)

      expect(presenter.text).toEqual({
        title: "Are you using RAR days for the Women's service referral?",
        usingRarDays: {
          errorMessage: null,
        },
        maximumRarDays: {
          label: "What is the maximum number of RAR days for the Women's service referral?",
          errorMessage: null,
        },
      })
    })

    describe('when some fields have errors', () => {
      it('includes error messages for those fields', () => {
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, intervention, {
          errors: [
            { formFields: ['using-rar-days'], errorSummaryLinkedField: 'using-rar-days', message: 'usingRarDays msg' },
            {
              formFields: ['maximum-rar-days'],
              errorSummaryLinkedField: 'maximum-rar-days',
              message: 'maximumRarDays msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          usingRarDays: {
            errorMessage: 'usingRarDays msg',
          },
          maximumRarDays: {
            errorMessage: 'maximumRarDays msg',
          },
        })
      })
    })
  })

  describe('fields', () => {
    describe('when the answers are null on the referral and there is no user input data', () => {
      it('returns values corresponding to no selection', () => {
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, intervention)

        expect(presenter.fields).toEqual({
          usingRarDays: null,
          maximumRarDays: '',
        })
      })
    })

    describe('when the answers are present on the referral', () => {
      it('returns the values from the referral', () => {
        const referral = draftReferralFactory.build({ usingRarDays: true, maximumRarDays: 10 })

        const presenter = new RarDaysPresenter(referral, intervention)

        expect(presenter.fields).toEqual({
          usingRarDays: true,
          maximumRarDays: '10',
        })
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input values', () => {
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, intervention, null, {
          'using-rar-days': 'yes',
          'maximum-rar-days': 'blah',
        })

        expect(presenter.fields).toEqual({
          usingRarDays: true,
          maximumRarDays: 'blah',
        })
      })
    })

    describe('when there is user input data and the answers are present on the referral', () => {
      it('returns the user input values', () => {
        const referral = draftReferralFactory.build({ usingRarDays: false, maximumRarDays: null })

        const presenter = new RarDaysPresenter(referral, intervention, null, {
          'using-rar-days': 'yes',
          'maximum-rar-days': 'blah',
        })

        expect(presenter.fields).toEqual({
          usingRarDays: true,
          maximumRarDays: 'blah',
        })
      })
    })
  })

  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, intervention)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted by the order the fields appear on the page', () => {
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, intervention, {
          errors: [
            {
              formFields: ['maximum-rar-days'],
              errorSummaryLinkedField: 'maximum-rar-days',
              message: 'maximumRarDays msg',
            },
            { formFields: ['using-rar-days'], errorSummaryLinkedField: 'using-rar-days', message: 'usingRarDays msg' },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'using-rar-days', message: 'usingRarDays msg' },
          { field: 'maximum-rar-days', message: 'maximumRarDays msg' },
        ])
      })
    })
  })
})
