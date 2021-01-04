import FurtherInformationPresenter from './furtherInformationPresenter'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import draftReferralFactory from '../../../testutils/factories/draftReferral'

describe('FurtherInformationPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
  const draftReferral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory)
      expect(presenter.title).toEqual(
        'Do you have further information for the social inclusion service provider? (optional)'
      )
    })
  })

  describe('hint', () => {
    it('returns a hint', () => {
      const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory)
      expect(presenter.hint).toEqual(
        'For example, relevant previous offences, previously completed programmes or further reasons for this referral'
      )
    })
  })

  describe('error information', () => {
    describe('when no errors are passed in', () => {
      it('returns no errors', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory)

        expect(presenter.error).toBeNull()
      })
    })

    describe('when errors are passed in', () => {
      it('returns error information', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory, {
          message: 'Something went wrong, please try again',
        })

        expect(presenter.error).toEqual({ message: 'Something went wrong, please try again' })
      })
    })
  })

  describe('value', () => {
    describe('when the referral already has further information set', () => {
      it('uses that further information as the value attribute', () => {
        draftReferral.furtherInformation = 'Some information about the service user'
        const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory)

        expect(presenter.value).toEqual('Some information about the service user')
      })
    })

    describe('when there is user input data', () => {
      it('uses that further information as the value attribute', () => {
        const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory, null, {
          'further-information': 'Some information about the service user',
        })

        expect(presenter.value).toEqual('Some information about the service user')
      })
    })

    describe('when the referral already has further information and there is user input data', () => {
      it('sets the new input data as the further information value', () => {
        draftReferral.furtherInformation = 'Some old information about the service user'
        const presenter = new FurtherInformationPresenter(draftReferral, serviceCategory, null, {
          'further-information': 'Some new information about the service user',
        })

        expect(presenter.value).toEqual('Some new information about the service user')
      })
    })
  })
})
