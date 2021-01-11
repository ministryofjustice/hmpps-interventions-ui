import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import ReferralFormPresenter from './referralFormPresenter'
import DraftReferralsListPresenter from './draftReferralsListPresenter'
import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ReferralFormView from './referralFormView'
import CompletionDeadlineView from './completionDeadlineView'
import CompletionDeadlineForm, { CompletionDeadlineErrors } from './completionDeadlineForm'
import ComplexityLevelView from './complexityLevelView'
import ComplexityLevelPresenter, { ComplexityLevelError } from './complexityLevelPresenter'
import ComplexityLevelForm from './complexityLevelForm'
import FurtherInformationPresenter, { FurtherInformationError } from './furtherInformationPresenter'
import FurtherInformationView from './furtherInformationView'
import DesiredOutcomesPresenter, { DesiredOutcomesError } from './desiredOutcomesPresenter'
import DesiredOutcomesView from './desiredOutcomesView'
import DesiredOutcomesForm from './desiredOutcomesForm'
import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import NeedsAndRequirementsView from './needsAndRequirementsView'
import NeedsAndRequirementsForm, { NeedsAndRequirementsError } from './needsAndRequirementsForm'
import RiskInformationPresenter from './riskInformationPresenter'
import RiskInformationView from './riskInformationView'
import RarDaysView from './rarDaysView'
import RarDaysPresenter from './rarDaysPresenter'
import RarDaysForm from './rarDaysForm'
import ReferralStartView from './referralStartView'

export default class ReferralsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    const { token, userId } = res.locals.user
    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token, userId)
    const presenter = new DraftReferralsListPresenter(existingDraftReferrals)
    const view = new ReferralStartView(presenter)

    res.render(...view.renderArgs)
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

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view complexity level without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new ComplexityLevelPresenter(referral, serviceCategory)
    const view = new ComplexityLevelView(presenter)

    res.render(...view.renderArgs)
  }

  async updateComplexityLevel(req: Request, res: Response): Promise<void> {
    const form = await ComplexityLevelForm.createForm(req)

    let error: ComplexityLevelError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = {
          message: e.message,
        }
      }
    } else {
      error = form.error
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/completion-deadline`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      if (referral.serviceCategoryId === null) {
        throw new Error('Attempting to view complexity level without service category selected')
      }

      const serviceCategory = await this.interventionsService.getServiceCategory(
        res.locals.user.token,
        referral.serviceCategoryId
      )

      const presenter = new ComplexityLevelPresenter(referral, serviceCategory, error, req.body)
      const view = new ComplexityLevelView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewCompletionDeadline(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view completion deadline without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

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
      res.redirect(`/referrals/${req.params.id}/rar-days`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      if (referral.serviceCategoryId === null) {
        throw new Error('Attempting to view completion deadline without service category selected')
      }

      const serviceCategory = await this.interventionsService.getServiceCategory(
        res.locals.user.token,
        referral.serviceCategoryId
      )

      const presenter = new CompletionDeadlinePresenter(referral, serviceCategory, errors, req.body)
      const view = new CompletionDeadlineView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewFurtherInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view further information without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new FurtherInformationPresenter(referral, serviceCategory)

    const view = new FurtherInformationView(presenter)

    res.render(...view.renderArgs)
  }

  async updateFurtherInformation(req: Request, res: Response): Promise<void> {
    let error: FurtherInformationError | null = null

    const paramsForUpdate = {
      furtherInformation: req.body['further-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, paramsForUpdate)
    } catch (e) {
      error = {
        message: e.message,
      }
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      if (!referral.serviceCategoryId) {
        throw new Error('Attempting to view complexity level without service category selected')
      }

      const serviceCategory = await this.interventionsService.getServiceCategory(
        res.locals.user.token,
        referral.serviceCategoryId
      )

      const presenter = new FurtherInformationPresenter(referral, serviceCategory, error, req.body)
      const view = new FurtherInformationView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewDesiredOutcomes(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (!referral.serviceCategoryId) {
      throw new Error('Attempting to view desired outcomes without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new DesiredOutcomesPresenter(referral, serviceCategory)
    const view = new DesiredOutcomesView(presenter)

    res.render(...view.renderArgs)
  }

  async updateDesiredOutcomes(req: Request, res: Response): Promise<void> {
    const form = await DesiredOutcomesForm.createForm(req)

    let error: DesiredOutcomesError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = {
          message: e.message,
        }
      }
    } else {
      error = form.error
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/complexity-level`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      if (!referral.serviceCategoryId) {
        throw new Error('Attempting to view desired outcomes without service category selected')
      }

      const serviceCategory = await this.interventionsService.getServiceCategory(
        res.locals.user.token,
        referral.serviceCategoryId
      )

      const presenter = new DesiredOutcomesPresenter(referral, serviceCategory, error, req.body)
      const view = new DesiredOutcomesView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    const presenter = new NeedsAndRequirementsPresenter(referral)
    const view = new NeedsAndRequirementsView(presenter)

    res.render(...view.renderArgs)
  }

  async updateNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)
    const form = await NeedsAndRequirementsForm.createForm(req, referral)

    let errors: NeedsAndRequirementsError[] | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        // TODO IC-615 use proper error information
        errors = [{ field: 'additional-needs-information', message: e.message }]
      }
    } else {
      errors = form.errors
    }

    if (errors === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const presenter = new NeedsAndRequirementsPresenter(referral, errors, req.body)
      const view = new NeedsAndRequirementsView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewRiskInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)
    const presenter = new RiskInformationPresenter(referral)
    const view = new RiskInformationView(presenter)

    res.render(...view.renderArgs)
  }

  async updateRiskInformation(req: Request, res: Response): Promise<void> {
    let errors: { field: string; message: string }[] | null = null

    const paramsForUpdate = {
      additionalRiskInformation: req.body['additional-risk-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, paramsForUpdate)
    } catch (e) {
      errors = [
        {
          field: 'additional-risk-information',
          // TODO (IC-615) there’s probably a more appropriate message to use from the response
          message: e.message,
        },
      ]
    }

    if (errors === null) {
      res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      const presenter = new RiskInformationPresenter(referral, errors, req.body)
      const view = new RiskInformationView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewRarDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view RAR days without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new RarDaysPresenter(referral, serviceCategory)
    const view = new RarDaysView(presenter)

    res.render(...view.renderArgs)
  }

  async updateRarDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to update RAR days without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const form = await RarDaysForm.createForm(req, serviceCategory)

    let errors: { field: string; message: string }[] | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        // TODO IC-615 use proper error information
        errors = [{ field: 'using-rar-days', message: e.message }]
      }
    } else {
      errors = form.errors
    }

    if (errors === null) {
      res.redirect(`/referrals/${req.params.id}/further-information`)
    } else {
      const presenter = new RarDaysPresenter(referral, serviceCategory, errors, req.body)
      const view = new RarDaysView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }
}
