import RelevantSentencePresenter from './relevantSentencePresenter'
import deliusConvictionFactory from '../../../testutils/factories/deliusConviction'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import interventionFactory from '../../../testutils/factories/intervention'

describe(RelevantSentencePresenter, () => {
  const intervention = interventionFactory.build({ contractType: { name: 'personal wellbeing' } })
  const draftReferral = draftReferralFactory.justCreated().build({ interventionId: intervention.id })

  describe('title', () => {
    it('includes the service type name', () => {
      const convictions = [deliusConvictionFactory.build()]
      const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

      expect(presenter.title).toEqual('Select the relevant sentence for the personal wellbeing referral')
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

        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

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

        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

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

        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

        expect(presenter.relevantSentenceFields[0].endOfSentenceDate).toEqual('15 September 2025')
      })
    })

    describe('value', () => {
      it('uses the conviction ID', () => {
        const convictions = [deliusConvictionFactory.build({ convictionId: 123456789 })]

        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

        expect(presenter.relevantSentenceFields[0].value).toEqual(123456789)
      })
    })

    describe('checked', () => {
      describe('when there is no user input data', () => {
        it('sets the `checked` value to `false`', () => {
          const convictions = deliusConvictionFactory.buildList(2)

          const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

          expect(presenter.relevantSentenceFields[0].checked).toBe(false)
          expect(presenter.relevantSentenceFields[1].checked).toBe(false)
        })

        describe('when the referral already has a selected sentence ID', () => {
          it('sets checked to true for the referral’s selected sentence ID', () => {
            const convictionWithSelectedSentence = deliusConvictionFactory.build({ convictionId: 123456789 })
            draftReferral.relevantSentenceId = convictionWithSelectedSentence.convictionId

            const convictions = [deliusConvictionFactory.build(), convictionWithSelectedSentence]

            const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

            expect(presenter.relevantSentenceFields[0].checked).toBe(false)
            expect(presenter.relevantSentenceFields[1].checked).toBe(true)
          })
        })
      })

      describe('when there is user input data', () => {
        it('sets checked to true for the sentence that the user chose', () => {
          const convictionWithSelectedSentence = deliusConvictionFactory.build({ convictionId: 123456789 })

          const convictions = [deliusConvictionFactory.build(), convictionWithSelectedSentence]

          const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions, null, {
            'relevant-sentence-id': convictionWithSelectedSentence.convictionId,
          })

          expect(
            presenter.relevantSentenceFields.find(field => field.value === convictionWithSelectedSentence.convictionId)!
              .checked
          ).toEqual(true)
        })

        describe('when the referral already has a selected sentence ID', () => {
          it('sets checked to true for the sentence that the user chose', () => {
            draftReferral.relevantSentenceId = 123456789

            const convictionWithSentenceChosenByUser = deliusConvictionFactory.build({ convictionId: 987654321 })
            const convictionWithSentenceAlreadyOnReferral = deliusConvictionFactory.build({ convictionId: 123456789 })

            const convictions = [convictionWithSentenceAlreadyOnReferral, convictionWithSentenceChosenByUser]

            const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions, null, {
              'relevant-sentence-id': convictionWithSentenceChosenByUser.convictionId,
            })

            expect(presenter.relevantSentenceFields[0].checked).toBe(false)
            expect(presenter.relevantSentenceFields[1].checked).toBe(true)
          })
        })
      })
    })
  })

  describe('errorSummary', () => {
    const convictions = deliusConvictionFactory.buildList(2)

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions, {
          errors: [
            {
              formFields: ['relevant-sentence-id'],
              errorSummaryLinkedField: 'relevant-sentence-id',
              message: 'Select the relevant sentence',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'relevant-sentence-id', message: 'Select the relevant sentence' },
        ])
      })
    })
  })

  describe('errorMessage', () => {
    const convictions = deliusConvictionFactory.buildList(2)

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions, {
          errors: [
            {
              formFields: ['relevant-sentence-id'],
              errorSummaryLinkedField: 'relevant-sentence-id',
              message: 'Select the relevant sentence',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Select the relevant sentence')
      })
    })
  })
})
