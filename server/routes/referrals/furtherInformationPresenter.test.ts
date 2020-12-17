import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import FurtherInformationPresenter from './furtherInformationPresenter'

describe('FurtherInformationPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new FurtherInformationPresenter(serviceCategory)
      expect(presenter.title).toEqual(
        'Do you have further information for the social inclusion service provider? (optional)'
      )
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const presenter = new FurtherInformationPresenter(serviceCategory)
      expect(presenter.hint).toEqual(
        'For example, relevant previous offences, previously completed programmes or further reasons for this referral'
      )
    })
  })

  describe('error information', () => {
    describe('when no errors are passed in', () => {
      it('returns no errors', () => {
        const presenter = new FurtherInformationPresenter(serviceCategory)

        expect(presenter.error).toBeNull()
      })
    })

    describe('when errors are passed in', () => {
      it('returns error information', () => {
        const presenter = new FurtherInformationPresenter(serviceCategory, {
          message: 'Something went wrong, please try again',
        })

        expect(presenter.error).toEqual({ message: 'Something went wrong, please try again' })
      })
    })
  })
})
