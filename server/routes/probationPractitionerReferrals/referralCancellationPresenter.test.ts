import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import serviceProviderFactory from '../../../testutils/factories/serviceProvider'
import { CancellationReason } from '../../services/interventionsService'
import ReferralCancellationPresenter from './referralCancellationPresenter'

describe(ReferralCancellationPresenter, () => {
  describe('text', () => {
    it('includes a title, information and label for the additional comments question', () => {
      const serviceProvider = serviceProviderFactory.build({ name: 'Harmony Living' })
      const sentReferral = sentReferralFactory.build({ referral: { serviceProvider } })
      const serviceUser = deliusServiceUserFactory.build({ firstName: 'Alex', surname: 'River' })
      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
      const cancellationReasons: CancellationReason[] = []

      const presenter = new ReferralCancellationPresenter(
        sentReferral,
        serviceCategory,
        serviceUser,
        cancellationReasons
      )
      expect(presenter.text.title).toEqual('Referral cancellation')
      expect(presenter.text.information).toEqual(
        "You are about to cancel Alex River's referral for an accommodation intervention with Harmony Living."
      )
      expect(presenter.text.additionalCommentsLabel).toEqual('Additional comments (optional):')
    })
  })

  describe('referralCancellationFields', () => {
    it('returns an array of fields to be passed as radio button args', () => {
      const sentReferral = sentReferralFactory.build()
      const serviceUser = deliusServiceUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const cancellationReasons: CancellationReason[] = [
        { code: 'MIS', description: 'Referral was made by mistake' },
        { code: 'MOV', description: 'Service user has moved out of delivery area' },
      ]

      const presenter = new ReferralCancellationPresenter(
        sentReferral,
        serviceCategory,
        serviceUser,
        cancellationReasons
      )

      expect(presenter.cancellationReasonsFields).toEqual([
        { value: 'MIS', text: 'Referral was made by mistake', checked: false },
        { value: 'MOV', text: 'Service user has moved out of delivery area', checked: false },
      ])
    })
  })

  describe('errorSummary', () => {
    const sentReferral = sentReferralFactory.build()
    const serviceUser = deliusServiceUserFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const cancellationReasons: CancellationReason[] = []

    describe('when there is an error', () => {
      it('returns a summary of the error', () => {
        const presenter = new ReferralCancellationPresenter(
          sentReferral,
          serviceCategory,
          serviceUser,
          cancellationReasons,
          {
            errors: [
              {
                errorSummaryLinkedField: 'cancellation-reason',
                formFields: ['cancellation-reason'],
                message: 'Select a reason for cancelling the referral',
              },
            ],
          }
        )

        expect(presenter.errorSummary).toEqual([
          { field: 'cancellation-reason', message: 'Select a reason for cancelling the referral' },
        ])
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new ReferralCancellationPresenter(
          sentReferral,
          serviceCategory,
          serviceUser,
          cancellationReasons
        )

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('errorMessage', () => {
    const sentReferral = sentReferralFactory.build()
    const serviceUser = deliusServiceUserFactory.build()
    const serviceCategory = serviceCategoryFactory.build()
    const cancellationReasons: CancellationReason[] = []

    describe('when there is an error', () => {
      it('returns the error message', () => {
        const presenter = new ReferralCancellationPresenter(
          sentReferral,
          serviceCategory,
          serviceUser,
          cancellationReasons,
          {
            errors: [
              {
                errorSummaryLinkedField: 'cancellation-reason',
                formFields: ['cancellation-reason'],
                message: 'Select a reason for cancelling the referral',
              },
            ],
          }
        )

        expect(presenter.errorMessage).toEqual('Select a reason for cancelling the referral')
      })
    })

    describe('when there is no error', () => {
      it('returns null', () => {
        const presenter = new ReferralCancellationPresenter(
          sentReferral,
          serviceCategory,
          serviceUser,
          cancellationReasons
        )

        expect(presenter.errorMessage).toBeNull()
      })
    })
  })
})
