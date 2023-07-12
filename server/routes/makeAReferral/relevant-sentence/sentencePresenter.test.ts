import SentencePresenter from './sentencePresenter'
import caseConvictionFactory from '../../../../testutils/factories/caseConviction'

describe(SentencePresenter, () => {
  describe('category', () => {
    it('returns the main offence‘s category', () => {
      const conviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            category: 'Common and other types of assault',
          },
        },
      })

      const presenter = new SentencePresenter(conviction.conviction)

      expect(presenter.category).toEqual('Common and other types of assault')
    })
  })

  describe('subcategory', () => {
    it('returns the main offence‘s subcategory', () => {
      const conviction = caseConvictionFactory.build({
        conviction: {
          mainOffence: {
            subCategory: 'Common assault and battery',
          },
        },
      })

      const presenter = new SentencePresenter(conviction.conviction)

      expect(presenter.subcategory).toEqual('Common assault and battery')
    })
  })

  describe('endOfSentenceDate', () => {
    it('uses the GOV UK date format', () => {
      const conviction = caseConvictionFactory.build({
        conviction: {
          sentence: {
            expectedEndDate: '2025-09-15',
          },
        },
      })

      const presenter = new SentencePresenter(conviction.conviction)

      expect(presenter.endOfSentenceDate).toEqual('15 Sept 2025')
    })
  })
})
