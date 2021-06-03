import SentencePresenter from './sentencePresenter'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import deliusOffenceFactory from '../../../testutils/factories/deliusOffence'
import deliusSentenceFactory from '../../../testutils/factories/deliusSentence'

describe(SentencePresenter, () => {
  describe('category', () => {
    it('returns the main offence‘s category', () => {
      const offences = [
        deliusOffenceFactory.build({
          mainOffence: false,
          detail: {
            mainCategoryDescription: 'Assault on Police Officer',
          },
        }),
        deliusOffenceFactory.build({
          mainOffence: true,
          detail: {
            mainCategoryDescription: 'Common and other types of assault',
          },
        }),
      ]

      const conviction = deliusConvictionFactory.build({ offences })

      const presenter = new SentencePresenter(conviction)

      expect(presenter.category).toEqual('Common and other types of assault')
    })
  })

  describe('subcategory', () => {
    it('returns the main offence‘s subcategory', () => {
      const offences = [
        deliusOffenceFactory.build({
          mainOffence: false,
          detail: {
            subCategoryDescription: 'Assault on Police Officer',
          },
        }),
        deliusOffenceFactory.build({
          mainOffence: true,
          detail: {
            subCategoryDescription: 'Common assault and battery',
          },
        }),
      ]

      const conviction = deliusConvictionFactory.build({ offences })

      const presenter = new SentencePresenter(conviction)

      expect(presenter.subcategory).toEqual('Common assault and battery')
    })
  })

  describe('endOfSentenceDate', () => {
    it('uses the GOV UK date format', () => {
      const conviction = deliusConvictionFactory.build({
        sentence: deliusSentenceFactory.build({
          expectedSentenceEndDate: '2025-09-15',
        }),
      })

      const presenter = new SentencePresenter(conviction)

      expect(presenter.endOfSentenceDate).toEqual('15 September 2025')
    })
  })
})
