import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import ReferralFormPresenter from './referralFormPresenter'
import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ReferralFormView from './referralFormView'
import CompletionDeadlineView from './completionDeadlineView'
import CompletionDeadlineForm, { CompletionDeadlineErrors } from './completionDeadlineForm'
import ComplexityLevelView from './complexityLevelView'
import ComplexityLevelPresenter, { ComplexityLevelError } from './complexityLevelPresenter'

export default class ReferralsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    res.render('referrals/start')
  }

  async createReferral(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.createDraftReferral(res.locals.user.token)

    res.redirect(303, `/referrals/${referral.id}/form`)
  }

  async viewReferralForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    const presenter = new ReferralFormPresenter(referral)
    const view = new ReferralFormView(presenter)

    res.render(...view.renderArgs)
  }

  async viewComplexityLevel(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)
    const complexityLevels = await this.interventionsService.getComplexityLevels(
      res.locals.user.token,
      referral.serviceCategory.id
    )

    const presenter = new ComplexityLevelPresenter(referral, complexityLevels)
    const view = new ComplexityLevelView(presenter)

    res.render(...view.renderArgs)
  }

  async viewCompletionDeadline(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    const presenter = new CompletionDeadlinePresenter(referral)
    const view = new CompletionDeadlineView(presenter)

    res.render(...view.renderArgs)
  }

  async updateCompletionDeadline(req: Request, res: Response): Promise<void> {
    const form = await CompletionDeadlineForm.createForm(req)

    let errors: CompletionDeadlineErrors | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        errors = {
          firstErroredField: 'day',
          erroredFields: ['day', 'month', 'year'],
          // TODO (IC-615) there’s probably a more appropriate message to use from the response
          message: e.message,
        }
      }
    } else {
      errors = form.errors
    }

    if (errors === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      const presenter = new CompletionDeadlinePresenter(referral, errors, req.body)
      const view = new CompletionDeadlineView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }
}
