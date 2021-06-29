import DesiredOutcomesPresenter from './desiredOutcomesPresenter'
import draftReferralFactory from '../../../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../../../testutils/factories/serviceCategory'

describe('DesiredOutcomesPresenter', () => {
  const serviceCategory = serviceCategoryFactory.build({
    name: 'social inclusion',
    desiredOutcomes: [
      {
        id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
        description:
          'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
      },
      {
        id: '65924ac6-9724-455b-ad30-906936291421',
        description: 'Service user makes progress in obtaining accommodation',
      },
      {
        id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
        description: 'Service user is helped to secure social or supported housing',
      },
      {
        id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
        description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
      },
    ],
  })
  const draftReferral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build()

  describe('desiredOutcomes', () => {
    it('sets each the id of each desired outcome as the `value` on the presenter', () => {
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

      const expectedValues = presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.value).sort()
      const desiredOutcomeIds = serviceCategory.desiredOutcomes.map(desiredOutcome => desiredOutcome.id).sort()

      expect(expectedValues).toEqual(desiredOutcomeIds)
    })

    it('sets the description of each desired outcome as the `text` on the presenter', () => {
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

      const presenterTexts = presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.text).sort()
      const desiredOutcomeDescriptions = serviceCategory.desiredOutcomes
        .map(desiredOutcome => desiredOutcome.description)
        .sort()

      expect(presenterTexts).toEqual(desiredOutcomeDescriptions)
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

        expect(presenter.errorMessage).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, {
          errors: [
            {
              formFields: ['desired-outcomes-ids'],
              errorSummaryLinkedField: 'desired-outcomes-ids',
              message: 'Select desired outcomes',
            },
          ],
        })

        expect(presenter.errorMessage).toEqual('Select desired outcomes')
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information', () => {
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, {
          errors: [
            {
              formFields: ['desired-outcomes-ids'],
              errorSummaryLinkedField: 'desired-outcomes-ids',
              message: 'Select desired outcomes',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([{ field: 'desired-outcomes-ids', message: 'Select desired outcomes' }])
      })
    })
  })

  describe('when the referral already has selected desired outcomes for the service category', () => {
    it('sets checked to true for the referral’s selected desired outcomes for the service category', () => {
      draftReferral.desiredOutcomes = [
        {
          serviceCategoryId: serviceCategory.id,
          desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id, serviceCategory.desiredOutcomes[1].id],
        },
      ]
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

      expect(presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.checked)).toEqual([
        true,
        true,
        false,
        false,
      ])
    })
  })

  describe('when there is user input data', () => {
    it('sets checked to true for the desired outcomes that the user chose', () => {
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, null, {
        'desired-outcomes-ids': [serviceCategory.desiredOutcomes[0].id, serviceCategory.desiredOutcomes[1].id],
      })

      expect(presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.checked)).toEqual([
        true,
        true,
        false,
        false,
      ])
    })

    describe('when the user input data doesn’t contain a desired-outcomes-ids key', () => {
      it('doesn’t set any of the desired outcomes as checked', () => {
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, null, {})

        expect(presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.checked)).toEqual([
          false,
          false,
          false,
          false,
        ])
      })
    })
  })

  describe('when the referral already has a selected desired outcomes for the service category and there is user input data', () => {
    it('sets checked to true for the desired outcomes that the user chose', () => {
      draftReferral.desiredOutcomes = [
        {
          serviceCategoryId: serviceCategory.id,
          desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id, serviceCategory.desiredOutcomes[1].id],
        },
      ]
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, null, {
        'desired-outcomes-ids': [serviceCategory.desiredOutcomes[1].id, serviceCategory.desiredOutcomes[2].id],
      })

      expect(presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.checked)).toEqual([
        false,
        true,
        true,
        false,
      ])
    })

    describe('when the user input data doesn’t contain a desired-outcomes-ids key', () => {
      it('doesn’t set any of the desired outcomes as checked', () => {
        draftReferral.desiredOutcomes = [
          {
            serviceCategoryId: serviceCategory.id,
            desiredOutcomesIds: [serviceCategory.desiredOutcomes[0].id],
          },
        ]
        const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory, null, {})

        expect(presenter.desiredOutcomes.map(desiredOutcome => desiredOutcome.checked)).toEqual([
          false,
          false,
          false,
          false,
        ])
      })
    })
  })

  describe('title', () => {
    it('returns a title', () => {
      const presenter = new DesiredOutcomesPresenter(draftReferral, serviceCategory)

      expect(presenter.title).toEqual('What are the desired outcomes for the Social inclusion service?')
    })
  })
})
