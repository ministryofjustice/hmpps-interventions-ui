import { Request } from 'express'
import { body, Result, ValidationChain, ValidationError } from 'express-validator'
import errorMessages from '../../../utils/errorMessages'
import FormUtils from '../../../utils/formUtils'
import { FormValidationError } from '../../../utils/formValidationError'
import { FormData } from '../../../utils/forms/formData'
import { CaseNote } from '../../../models/caseNote'

export default class AddNewCaseNoteForm {
  constructor(
    private readonly request: Request,
    private readonly loggedInUserType: 'service-provider' | 'probation-practitioner'
  ) {}

  static readonly caseNoteSubjectFormId = 'case-note-subject'

  static readonly caseNoteBodyFormId = 'case-note-body'

  static readonly sendCaseNoteEmailId = 'send-case-note-email'

  async data(referralId: string): Promise<FormData<Partial<CaseNote>>> {
    const validationResult = await FormUtils.runValidations({
      request: this.request,
      validations: AddNewCaseNoteForm.validations(this.loggedInUserType),
    })

    const error = this.error(validationResult)
    if (error) {
      return {
        paramsForUpdate: null,
        error,
      }
    }

    return {
      paramsForUpdate: {
        referralId,
        subject: this.request.body[AddNewCaseNoteForm.caseNoteSubjectFormId],
        body: this.request.body[AddNewCaseNoteForm.caseNoteBodyFormId],
        sendEmail: this.request.body[AddNewCaseNoteForm.sendCaseNoteEmailId],
      },
      error: null,
    }
  }

  private static validations(loggedInUserType: string): ValidationChain[] {
    const validationChain = [
      body(AddNewCaseNoteForm.caseNoteSubjectFormId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.caseNote.subject.empty),
      body(AddNewCaseNoteForm.caseNoteBodyFormId)
        .notEmpty({ ignore_whitespace: true })
        .withMessage(errorMessages.caseNote.body.empty),
    ]

    const sendCaseNoteEmailValidation = body(AddNewCaseNoteForm.sendCaseNoteEmailId)
      .notEmpty({ ignore_whitespace: true })
      .withMessage(errorMessages.caseNote.sendCaseNoteEmail.empty)

    return loggedInUserType === 'service-provider' ? [...validationChain, sendCaseNoteEmailValidation] : validationChain
  }

  get isValid(): boolean {
    return this.error == null
  }

  private error(validationResult: Result<ValidationError>): FormValidationError | null {
    if (validationResult.isEmpty()) {
      return null
    }

    return {
      errors: validationResult.array().map(validationError => ({
        formFields: [validationError.param],
        errorSummaryLinkedField: validationError.param,
        message: validationError.msg,
      })),
    }
  }
}
