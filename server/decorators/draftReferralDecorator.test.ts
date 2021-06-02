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

  describe('completionDeadline', () => {
    describe('when referral has a null completionDeadline', () => {
      it('returns null', () => {
        const referral = draftReferralFactory.build({ completionDeadline: null })

        expect(new DraftReferralDecorator(referral).completionDeadline).toBeNull()
      })
    })

    describe('when referral has a parseable completionDeadline', () => {
      it('returns the referral’s completion deadline as a calendar day', () => {
        const referral = draftReferralFactory.build({ completionDeadline: '2021-03-10' })

        expect(new DraftReferralDecorator(referral).completionDeadline).toEqual({ day: 10, month: 3, year: 2021 })
      })
    })

    describe('when referral has a malformed completionDeadline', () => {
      it('throws an error', () => {
        const referral = draftReferralFactory.build({ completionDeadline: 'abc' })

        expect(() => new DraftReferralDecorator(referral).completionDeadline).toThrow()
      })
    })
  })
})
