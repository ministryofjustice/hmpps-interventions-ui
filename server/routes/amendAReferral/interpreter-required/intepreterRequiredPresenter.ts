import { FormValidationError } from '../../../utils/formValidationError'
import PresenterUtils from '../../../utils/presenterUtils'
import SentReferral from '../../../models/sentReferral'
import AmendNeedsAndRequirementsIntepreterForm from './amendNeedsAndRequirementsIntepreterForm'
import DeliusServiceUser from '../../../models/delius/deliusServiceUser'

export default class IntepreterRequiredPresenter {
  private readonly utils = new PresenterUtils(this.userInputData)

  readonly reasonForChangeError = PresenterUtils.errorMessage(
    this.error,
    AmendNeedsAndRequirementsIntepreterForm.reasonForChangeId
  )

  readonly interpreterLanguageError = PresenterUtils.errorMessage(
    this.error,
    AmendNeedsAndRequirementsIntepreterForm.interpreterLanguageId
  )

  readonly errorSummary = PresenterUtils.errorSummary(this.error)

  readonly backLinkUrl: string

  constructor(
    private readonly sentReferral: SentReferral,
    private readonly serviceUser: DeliusServiceUser,
    private readonly error: FormValidationError | null = null,
    private readonly userInputData: Record<string, string> | null = null,
    readonly showNoChangesBanner: boolean = false
  ) {
    this.backLinkUrl = `/probation-practitioner/referrals/${sentReferral.id}/details`
  }

  private errorMessageForField(field: string): string | null {
    return PresenterUtils.errorMessage(this.error, field)
  }

  readonly text = {
    requirements: {
      title: `Does ${this.serviceUser.name.forename} need an interpreter?`,
      needsInterpreter: {
        hint: '',
        errorMessage: this.errorMessageForField('needs-intepreter'),
      },
      interpreterLanguage: {
        label: 'Enter the language they need an interpreter for',
        errorMessage: this.errorMessageForField('interpreter-language'),
      },
    },
    reasonForChange: {
      title: `What is the reason for changing whether ${this.serviceUser.name.forename} needs an interpreter?`,
      hint: `For example, they would prefer to speak in their native language.`,
    },
  }

  readonly fields = {
    needsInterpreter: this.utils.booleanValue(this.sentReferral.referral.needsInterpreter, 'needs-interpreter'),
    interpreterLanguage: this.utils.stringValue(this.sentReferral.referral.interpreterLanguage, 'interpreter-language'),
  }
}
