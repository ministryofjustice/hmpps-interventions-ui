import AmendEmploymentResponsibilitiesPresenter from './amendEmploymentResponsibilitiesPresenter'
import sentReferralFactory from '../../../../testutils/factories/sentReferral'
import ServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'

describe('AmendEmploymentResponsibilitiesPresenter', () => {
  const serviceUser = ServiceUserFactory.build()
  describe('errorSummary', () => {
    describe('when error is null', () => {
      it('returns null', () => {
        const referral = sentReferralFactory.build()
        const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when error is not null', () => {
      it('returns a summary of the errors sorted into the order their fields appear on the page', () => {
        const referral = sentReferralFactory.build()
        const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser, {
          errors: [
            {
              formFields: ['has-additional-responsibilities'],
              errorSummaryLinkedField: 'has-additional-responsibilities',
              message: 'has-additional-responsibilities msg',
            },
          ],
        })

        expect(presenter.errorSummary).toEqual([
          { field: 'has-additional-responsibilities', message: 'has-additional-responsibilities msg' },
        ])
      })
    })
  })

  describe('text', () => {
    it('returns content to be displayed on the page', () => {
      const referral = sentReferralFactory.build()
      const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser)

      expect(presenter.text).toEqual({
        responsibilities: {
          title: 'Do you want to change whether Alex has caring or employment responsibilities?',
          hasAdditionalResponsibilities: {
            errorMessage: null,
            hint: 'For example, times and dates when they are at work.',
            label: 'Do you want to change whether Alex has caring or employment responsibilities?',
          },
          whenUnavailable: {
            errorMessage: null,
            label: 'Provide details of when Alex will not be able to attend sessions',
          },
        },
        reasonForChange: {
          title: `What is the reason for changing Alex's caring or employment responsibilities?`,
          hint: `For example, they would prefer to speak in their native language`,
        },
      })
    })

    describe('when there are errors', () => {
      it('populates the error messages for the fields with errors', () => {
        const referral = sentReferralFactory.build()
        const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser, {
          errors: [
            {
              formFields: ['has-additional-responsibilities'],
              errorSummaryLinkedField: 'has-additional-responsibilities',
              message: 'has-additional-responsibilities msg',
            },
          ],
        })

        expect(presenter.text).toMatchObject({
          responsibilities: {
            hasAdditionalResponsibilities: {
              errorMessage: 'has-additional-responsibilities msg',
            },
            whenUnavailable: {
              errorMessage: null,
            },
          },
        })
      })
    })
  })

  describe('fields', () => {
    describe('when there is no data on the referral', () => {
      it('replays empty answers', () => {
        const referral = sentReferralFactory.build()
        referral.referral.hasAdditionalResponsibilities = false
        referral.referral.whenUnavailable = null
        const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser)

        expect(presenter.fields).toEqual({
          hasAdditionalResponsibilities: false,
          whenUnavailable: '',
        })
      })
    })

    describe('when there is user input data', () => {
      it('replays the user input data', () => {
        const referral = sentReferralFactory.build()

        referral.referral.hasAdditionalResponsibilities = false
        referral.referral.whenUnavailable = ''

        const userInputData = {
          'has-additional-responsibilities': 'yes',
          'when-unavailable': 'She works Fridays 9am - midday',
          'reason-for-change': ' a reason',
        }
        const presenter = new AmendEmploymentResponsibilitiesPresenter(referral, serviceUser, null, userInputData)

        expect(presenter.fields).toEqual({
          hasAdditionalResponsibilities: true,
          whenUnavailable: 'She works Fridays 9am - midday',
        })
      })
    })
  })
})
