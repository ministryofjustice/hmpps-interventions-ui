import DraftReferralDecorator from './draftReferralDecorator'
import serviceCategoryFactory from '../../testutils/factories/serviceCategory'
import draftReferralFactory from '../../testutils/factories/draftReferral'

describe(DraftReferralDecorator, () => {
  describe('referralServiceCategories', () => {
    const allServiceCategories = serviceCategoryFactory.buildList(3)

    it('returns the referral’s service categories', () => {
      const referral = draftReferralFactory.build({
        serviceCategoryIds: allServiceCategories.slice(0, 2).map(val => val.id),
      })

      expect(new DraftReferralDecorator(referral).referralServiceCategories(allServiceCategories)).toEqual(
        allServiceCategories.slice(0, 2)
      )
    })

    describe('when the referral hasn’t had service categories set', () => {
      it('throws an error', () => {
        const referral = draftReferralFactory.build({ serviceCategoryIds: null })

        expect(() => new DraftReferralDecorator(referral).referralServiceCategories(allServiceCategories)).toThrow()
      })
    })

    describe('when a service category referenced by the referral isn’t in the list of service categories', () => {
      it('throws an error', () => {
        const referral = draftReferralFactory.build({ serviceCategoryIds: [serviceCategoryFactory.build().id] })

        expect(() => new DraftReferralDecorator(referral).referralServiceCategories(allServiceCategories)).toThrow()
      })
    })
  })
})
