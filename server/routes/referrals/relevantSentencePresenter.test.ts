import RelevantSentencePresenter from './relevantSentencePresenter'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'

describe(RelevantSentencePresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })

  describe('title', () => {
    it('includes the service category name', () => {
      const convictions = [deliusConvictionFactory.build()]
      const presenter = new RelevantSentencePresenter(serviceCategory, convictions)

      expect(presenter.title).toEqual('Select the relevant sentence for the social inclusion referral')
    })
  })

  describe('relevantSentenceFields', () => {
    describe('category', () => {
      it('returns the main offence‘s category', () => {
        const offences = [
          {
            offenceId: 'M2500297061',
            mainOffence: false,
            detail: {
              code: '10400',
              description: 'Assault on Police Officer - 10400',
              mainCategoryCode: '104',
              mainCategoryDescription: 'Assault on Police Officer',
              mainCategoryAbbreviation: 'Assault on Police Officer',
              ogrsOffenceCategory: 'Violence',
              subCategoryCode: '00',
              subCategoryDescription: 'Assault on Police Officer',
              form20Code: '88',
            },
            offenceDate: '2019-09-09T00:00:00',
            offenceCount: 1,
            offenderId: 2500343964,
            createdDatetime: '2019-09-17T00:00:00',
            lastUpdatedDatetime: '2019-09-17T00:00:00',
          },
          {
            offenceId: 'M2600297062',
            mainOffence: true,
            detail: {
              code: '10501',
              description: 'Common assault and battery - 10501',
              mainCategoryCode: '105',
              mainCategoryDescription: 'Common and other types of assault',
              mainCategoryAbbreviation: 'Common and other types of assault',
              ogrsOffenceCategory: 'Violence',
              subCategoryCode: '01',
              subCategoryDescription: 'Common assault and battery',
              form20Code: '88',
            },
            offenceDate: '2019-09-09T00:00:00',
            offenceCount: 1,
            offenderId: 2600343964,
            createdDatetime: '2019-09-17T00:00:00',
            lastUpdatedDatetime: '2019-09-17T00:00:00',
          },
        ]

        const convictions = [deliusConvictionFactory.build({ offences })]

        const presenter = new RelevantSentencePresenter(serviceCategory, convictions)

        expect(presenter.relevantSentenceFields[0].category).toEqual('Common and other types of assault')
      })
    })

    describe('subcategory', () => {
      it('returns the main offence‘s subcategory', () => {
        const offences = [
          {
            offenceId: 'M2500297061',
            mainOffence: false,
            detail: {
              code: '10400',
              description: 'Assault on Police Officer - 10400',
              mainCategoryCode: '104',
              mainCategoryDescription: 'Assault on Police Officer',
              mainCategoryAbbreviation: 'Assault on Police Officer',
              ogrsOffenceCategory: 'Violence',
              subCategoryCode: '00',
              subCategoryDescription: 'Assault on Police Officer',
              form20Code: '88',
            },
            offenceDate: '2019-09-09T00:00:00',
            offenceCount: 1,
            offenderId: 2500343964,
            createdDatetime: '2019-09-17T00:00:00',
            lastUpdatedDatetime: '2019-09-17T00:00:00',
          },
          {
            offenceId: 'M2600297062',
            mainOffence: true,
            detail: {
              code: '10501',
              description: 'Common assault and battery - 10501',
              mainCategoryCode: '105',
              mainCategoryDescription: 'Common and other types of assault',
              mainCategoryAbbreviation: 'Common and other types of assault',
              ogrsOffenceCategory: 'Violence',
              subCategoryCode: '01',
              subCategoryDescription: 'Common assault and battery',
              form20Code: '88',
            },
            offenceDate: '2019-09-09T00:00:00',
            offenceCount: 1,
            offenderId: 2600343964,
            createdDatetime: '2019-09-17T00:00:00',
            lastUpdatedDatetime: '2019-09-17T00:00:00',
          },
        ]

        const convictions = [deliusConvictionFactory.build({ offences })]

        const presenter = new RelevantSentencePresenter(serviceCategory, convictions)

        expect(presenter.relevantSentenceFields[0].subcategory).toEqual('Common assault and battery')
      })
    })

    describe('endOfSentenceDate', () => {
      it('uses the GOV UK date format', () => {
        const convictions = [
          deliusConvictionFactory.build({
            sentence: {
              sentenceId: 2500284169,
              description: 'Absolute/Conditional Discharge',
              expectedSentenceEndDate: '2025-09-15',
              sentenceType: {
                code: 'SC',
                description: 'CJA - Indeterminate Public Prot.',
              },
            },
          }),
        ]

        const presenter = new RelevantSentencePresenter(serviceCategory, convictions)

        expect(presenter.relevantSentenceFields[0].endOfSentenceDate).toEqual('15 September 2025')
      })
    })

    describe('value', () => {
      it('uses the conviction ID', () => {
        const convictions = [deliusConvictionFactory.build({ convictionId: 123456789 })]

        const presenter = new RelevantSentencePresenter(serviceCategory, convictions)

        expect(presenter.relevantSentenceFields[0].value).toEqual(123456789)
      })
    })
  })
})
