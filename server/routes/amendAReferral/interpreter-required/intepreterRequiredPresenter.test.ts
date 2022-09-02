import AmendDesiredOutcomesPresenter from './intepreterRequiredPresenter'
import SentReferralFactory from '../../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'
import intepreterRequiredPresenter from './intepreterRequiredPresenter'

describe('intepreterRequiredPresenter.test', () => {
  
  const referral = SentReferralFactory.build({referral:{
interpreterLanguage:'Spanish',
needsInterpreter:false
  }})

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new intepreterRequiredPresenter(referral)

        expect(presenter.reasonForChangeError).toBeNull()
        expect(presenter.errorSummary).toBeNull()
      })
    })

    describe('when an error is passed in', () => {
     
      it('returns error information for reason for change field', () => {
        const presenter = new intepreterRequiredPresenter(referral, {
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
      const presenter = new intepreterRequiredPresenter(referral, {
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
      const presenter = new intepreterRequiredPresenter(referral)

      expect(presenter.text.requirements.title).toEqual(`Do you want to change whether ${referral.referral.serviceUser?.firstName} needs and intepreter?`)
    })

    it('returns an reason for change title', () => {
      const presenter = new intepreterRequiredPresenter(referral)

      expect(presenter.text.reasonForChange.title).toEqual(`What is the reason for changing whether ${referral.referral.serviceUser?.firstName} needs an intepreter?`)
    })
  })

  describe('desired outcomes', () => {
    it('returns desired outcomes with current selection checked', () => {
      const presenter = new intepreterRequiredPresenter(referral)

      expect(presenter.fields).toMatchObject(
        {
          needsInterpreter: false,
          interpreterLanguage: 'Spanish',
        },
      )
    })
  })
})
