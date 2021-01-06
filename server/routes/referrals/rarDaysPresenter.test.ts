import RarDaysPresenter from './rarDaysPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(RarDaysPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const referral = draftReferralFactory.build()

      const presenter = new RarDaysPresenter(referral, serviceCategory)

      expect(presenter.text).toEqual({
        title: 'Are you using RAR days for the accommodation service?',
        usingRarDays: {
          errorMessage: null,
        },
        maximumRarDays: {
          label: 'What is the maximum number of RAR days for the accommodation service?',
          errorMessage: null,
        },
      })
    })

    describe('when some fields have errors', () => {
      it('includes error messages for those fields', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, serviceCategory, [
          { field: 'using-rar-days', message: 'usingRarDays msg' },
          { field: 'maximum-rar-days', message: 'maximumRarDays msg' },
        ])

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
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, serviceCategory)

        expect(presenter.fields).toEqual({
          usingRarDays: null,
          maximumRarDays: '',
        })
      })
    })

    describe('when the answers are present on the referral', () => {
      it('returns the values from the referral', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build({ usingRarDays: true, maximumRarDays: 10 })

        const presenter = new RarDaysPresenter(referral, serviceCategory)

        expect(presenter.fields).toEqual({
          usingRarDays: true,
          maximumRarDays: '10',
        })
      })
    })

    describe('when there is user input data', () => {
      it('returns the user input values', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, serviceCategory, null, {
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
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build({ usingRarDays: false, maximumRarDays: null })

        const presenter = new RarDaysPresenter(referral, serviceCategory, null, {
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
    describe('when errors is null', () => {
      it('returns null', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, serviceCategory)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when errors is not null', () => {
      it('returns the errors sorted by the order the fields appear on the page', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.build()

        const presenter = new RarDaysPresenter(referral, serviceCategory, [
          { field: 'maximum-rar-days', message: 'maximumRarDays msg' },
          { field: 'using-rar-days', message: 'usingRarDays msg' },
        ])

        expect(presenter.errorSummary).toEqual([
          { field: 'using-rar-days', message: 'usingRarDays msg' },
          { field: 'maximum-rar-days', message: 'maximumRarDays msg' },
        ])
      })
    })
  })
})
