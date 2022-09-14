import SentReferralFactory from '../../../../testutils/factories/sentReferral'
import ServiceUserFactory from '../../../../testutils/factories/deliusServiceUser'
import IntepreterRequiredPresenter from './intepreterRequiredPresenter'

describe('intepreterRequiredPresenter.test', () => {
  const serviceUser = ServiceUserFactory.build()
  const referral = SentReferralFactory.build({
    referral: {
      interpreterLanguage: 'Spanish',
      needsInterpreter: false,
    },
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

        expect(presenter.reasonForChangeError).toBeNull()
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information for reason for change field', () => {
        const presenter = new IntepreterRequiredPresenter(referral, serviceUser, {
          errors: [
            {
              formFields: ['reason-for-change'],
              errorSummaryLinkedField: 'reason-for-change',
              message: 'Enter reason for change',
            },
          ],
        })

        expect(presenter.reasonForChangeError).toEqual('Enter reason for change')
      })
    })
  })

  describe('when an error is passed in', () => {
    it('returns error information for outcomes field', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser, {
        errors: [
          {
            formFields: ['interpreter-language'],
            errorSummaryLinkedField: 'interpreter-language',
            message: 'Suggest a language',
          },
        ],
      })

      expect(presenter.interpreterLanguageError).toEqual('Suggest a language')
    })
  })

  describe('titles', () => {
    it('returns an outcomes title', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.text.requirements.title).toEqual(
        `Do you want to change whether ${referral.referral.serviceUser?.firstName} needs an interpreter?`
      )
    })

    it('returns an reason for change title', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.text.reasonForChange.title).toEqual(
        `What is the reason for changing whether ${referral.referral.serviceUser?.firstName} needs an interpreter?`
      )
    })
  })

  describe('desired outcomes', () => {
    it('returns desired outcomes with current selection checked', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.fields).toMatchObject({
        needsInterpreter: false,
        interpreterLanguage: 'Spanish',
      })
    })
  })
})

describe('intepreterRequiredPresenter.test', () => {
  const referral = SentReferralFactory.build({
    referral: {
      interpreterLanguage: 'Spanish',
      needsInterpreter: false,
    },
  })

  describe('errorMessage', () => {
    const serviceUser = ServiceUserFactory.build()
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

        expect(presenter.reasonForChangeError).toBeNull()
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
      it('returns error information for reason for change field', () => {
        const presenter = new IntepreterRequiredPresenter(referral, serviceUser, {
          errors: [
            {
              formFields: ['reason-for-change'],
              errorSummaryLinkedField: 'reason-for-change',
              message: 'Enter reason for change',
            },
          ],
        })

        expect(presenter.reasonForChangeError).toEqual('Enter reason for change')
      })
    })
  })

  describe('when an error is passed in', () => {
    const serviceUser = ServiceUserFactory.build()

    it('returns error information for outcomes field', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser, {
        errors: [
          {
            formFields: ['interpreter-language'],
            errorSummaryLinkedField: 'interpreter-language',
            message: 'Suggest a language',
          },
        ],
      })

      expect(presenter.interpreterLanguageError).toEqual('Suggest a language')
    })
  })

  describe('titles', () => {
    const serviceUser = ServiceUserFactory.build()
    it('returns an outcomes title', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.text.requirements.title).toEqual(
        `Do you want to change whether ${referral.referral.serviceUser?.firstName} needs an interpreter?`
      )
    })

    it('returns an reason for change title', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.text.reasonForChange.title).toEqual(
        `What is the reason for changing whether ${referral.referral.serviceUser?.firstName} needs an interpreter?`
      )
    })
  })

  describe('desired outcomes', () => {
    const serviceUser = ServiceUserFactory.build()
    it('returns desired outcomes with current selection checked', () => {
      const presenter = new IntepreterRequiredPresenter(referral, serviceUser)

      expect(presenter.fields).toMatchObject({
        needsInterpreter: false,
        interpreterLanguage: 'Spanish',
      })
    })
  })
})
