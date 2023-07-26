import RelevantSentencePresenter from './relevantSentencePresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import interventionFactory from '../../../../testutils/factories/intervention'
import caseConvictionFactory from '../../../../testutils/factories/caseConviction'
import caseConvictionsFactory from '../../../../testutils/factories/caseConvictions'

describe(RelevantSentencePresenter, () => {
  const intervention = interventionFactory.build({ contractType: { name: 'personal wellbeing' } })
  const draftReferral = draftReferralFactory.justCreated().build({ interventionId: intervention.id })

  describe('title', () => {
    it('includes the service type name', () => {
      const convictions = caseConvictionsFactory.build()
      const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

      expect(presenter.title).toEqual('Select the relevant sentence for the Personal wellbeing referral')
    })
  })

  describe('relevantSentenceFields', () => {
    describe('presenter', () => {
      it('returns a presenter with information about the conviction', () => {
        const convictions = caseConvictionsFactory.build()
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

        expect(presenter.relevantSentenceFields[1].presenter).toBeDefined()
        expect(presenter.relevantSentenceFields[1].presenter.category).toEqual('Common and other types of assault')
      })
    })

    describe('value', () => {
      it('uses the conviction ID', () => {
        const convictions = caseConvictionsFactory.build()

        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

        expect(presenter.relevantSentenceFields[1].value).toEqual(convictions.convictions[1].id)
      })
    })

    describe('checked', () => {
      describe('when there is no user input data', () => {
        it('sets the `checked` value to `false`', () => {
          const convictions = caseConvictionsFactory.build()

          const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

          expect(presenter.relevantSentenceFields[0].checked).toBe(false)
          expect(presenter.relevantSentenceFields[1].checked).toBe(false)
        })

        describe('when the referral already has a selected sentence ID', () => {
          it('sets checked to true for the referral’s selected sentence ID', () => {
            const convictions = caseConvictionsFactory.build()
            draftReferral.relevantSentenceId = convictions.convictions[1].id

            const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

            expect(presenter.relevantSentenceFields[0].checked).toBe(false)
            expect(presenter.relevantSentenceFields[1].checked).toBe(true)
          })
        })
      })

      describe('when there is user input data', () => {
        it('sets checked to true for the sentence that the user chose', () => {
          const convictionWithSelectedSentence = caseConvictionFactory.build()

          const convictions = caseConvictionsFactory.build()
          convictions.convictions.push(convictionWithSelectedSentence.conviction)

          const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions, null, {
            'relevant-sentence-id': convictionWithSelectedSentence.conviction.id,
          })

          expect(
            presenter.relevantSentenceFields.find(
              field => field.value === convictionWithSelectedSentence.conviction.id
            )!.checked
          ).toEqual(true)
        })

        describe('when the referral already has a selected sentence ID', () => {
          it('sets checked to true for the sentence that the user chose', () => {
            draftReferral.relevantSentenceId = 123456789

            const convictionWithSentenceChosenByUser = caseConvictionFactory.build()
            const convictionWithSentenceAlreadyOnReferral = caseConvictionFactory.build()

            const convictions = [
              convictionWithSentenceAlreadyOnReferral.conviction,
              convictionWithSentenceChosenByUser.conviction,
            ]

            const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions, null, {
              'relevant-sentence-id': convictionWithSentenceChosenByUser.conviction.id,
            })

            expect(presenter.relevantSentenceFields[0].checked).toBe(false)
            expect(presenter.relevantSentenceFields[1].checked).toBe(true)
          })
        })
      })
    })
  })

  describe('errorSummary', () => {
    const convictions = caseConvictionsFactory.build()

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions, {
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
    const convictions = caseConvictionsFactory.build()

    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new RelevantSentencePresenter(draftReferral, intervention, convictions.convictions, {
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
