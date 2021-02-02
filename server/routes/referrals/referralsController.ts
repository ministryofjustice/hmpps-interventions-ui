import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import ReferralFormPresenter from './referralFormPresenter'
import ReferralStartPresenter from './referralStartPresenter'
import CompletionDeadlinePresenter from './completionDeadlinePresenter'
import ReferralFormView from './referralFormView'
import CompletionDeadlineView from './completionDeadlineView'
import CompletionDeadlineForm from './completionDeadlineForm'
import ComplexityLevelView from './complexityLevelView'
import ComplexityLevelPresenter from './complexityLevelPresenter'
import ComplexityLevelForm from './complexityLevelForm'
import FurtherInformationPresenter from './furtherInformationPresenter'
import FurtherInformationView from './furtherInformationView'
import DesiredOutcomesPresenter from './desiredOutcomesPresenter'
import DesiredOutcomesView from './desiredOutcomesView'
import DesiredOutcomesForm from './desiredOutcomesForm'
import NeedsAndRequirementsPresenter from './needsAndRequirementsPresenter'
import NeedsAndRequirementsView from './needsAndRequirementsView'
import NeedsAndRequirementsForm from './needsAndRequirementsForm'
import RiskInformationPresenter from './riskInformationPresenter'
import RiskInformationView from './riskInformationView'
import RarDaysView from './rarDaysView'
import RarDaysPresenter from './rarDaysPresenter'
import RarDaysForm from './rarDaysForm'
import ReferralStartView from './referralStartView'
import CheckAnswersView from './checkAnswersView'
import CheckAnswersPresenter from './checkAnswersPresenter'
import ConfirmationView from './confirmationView'
import ConfirmationPresenter from './confirmationPresenter'
import CommunityApiService, { DeliusServiceUser } from '../../services/communityApiService'
import errorMessages from '../../utils/errorMessages'
import logger from '../../../log'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import ServiceUserDetailsView from './serviceUserDetailsView'
import ReferralStartForm from './referralStartForm'

export default class ReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    const { token, userId } = res.locals.user
    const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token, userId)
    const presenter = new ReferralStartPresenter(existingDraftReferrals)
    const view = new ReferralStartView(presenter)

    res.render(...view.renderArgs)
  }

  async createReferral(req: Request, res: Response): Promise<void> {
    const form = await ReferralStartForm.createForm(req)

    let error: FormValidationError | null = null

    let serviceUser: DeliusServiceUser | null = null

    const crn = req.body['service-user-crn']
    const hardcodedInterventionId = '98a42c61-c30f-4beb-8062-04033c376e2d'

    if (form.isValid) {
      try {
        serviceUser = await this.communityApiService.getServiceUserByCRN(crn)
      } catch (e) {
        if (e.status === 404) {
          error = {
            errors: [
              {
                formFields: ['service-user-crn'],
                errorSummaryLinkedField: 'service-user-crn',
                message: errorMessages.startReferral.crnNotFound,
              },
            ],
          }
        } else {
          logger.error('crn lookup failed', e)
          error = {
            errors: [
              {
                formFields: ['service-user-crn'],
                errorSummaryLinkedField: 'service-user-crn',
                message: errorMessages.startReferral.unknownError,
              },
            ],
          }
        }
      }
    } else {
      error = form.error
    }

    if (error === null) {
      const referral = await this.interventionsService.createDraftReferral(
        res.locals.user.token,
        crn,
        hardcodedInterventionId
      )
      // fixme: this sets some static data for the new referral which will need to be
      //  changed to allow these fields to be set properly
      await this.interventionsService.patchDraftReferral(res.locals.user.token, referral.id, {
        serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
        serviceUser: this.interventionsService.serializeDeliusServiceUser(serviceUser),
      })

      res.redirect(303, `/referrals/${referral.id}/form`)
    } else {
      const { token, userId } = res.locals.user
      const existingDraftReferrals = await this.interventionsService.getDraftReferralsForUser(token, userId)
      const presenter = new ReferralStartPresenter(existingDraftReferrals, error)
      const view = new ReferralStartView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async viewServiceUserDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    const presenter = new ServiceUserDetailsPresenter(referral.serviceUser)
    const view = new ServiceUserDetailsView(presenter)

    res.render(...view.renderArgs)
  }

  async confirmServiceUserDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    res.redirect(303, `/referrals/${referral.id}/form`)
  }

  async viewReferralForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('No service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new ReferralFormPresenter(referral, serviceCategory.name)
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

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
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

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (error === null) {
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

      const presenter = new CompletionDeadlinePresenter(referral, serviceCategory, error, req.body)
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
    let error: FormValidationError | null = null

    const paramsForUpdate = {
      furtherInformation: req.body['further-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, paramsForUpdate)
    } catch (e) {
      error = createFormValidationErrorOrRethrow(e)
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

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
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

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const presenter = new NeedsAndRequirementsPresenter(referral, error, req.body)
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
    let error: FormValidationError | null = null

    const paramsForUpdate = {
      additionalRiskInformation: req.body['additional-risk-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, paramsForUpdate)
    } catch (e) {
      error = createFormValidationErrorOrRethrow(e)
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)

      const presenter = new RiskInformationPresenter(referral, error, req.body)
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

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(res.locals.user.token, req.params.id, form.paramsForUpdate)
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/further-information`)
    } else {
      const presenter = new RarDaysPresenter(referral, serviceCategory, error, req.body)
      const view = new RarDaysView(presenter)

      res.status(400)
      res.render(...view.renderArgs)
    }
  }

  async checkAnswers(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token, req.params.id)
    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to check answers without service category selected')
    }
    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token,
      referral.serviceCategoryId
    )

    const presenter = new CheckAnswersPresenter(referral, serviceCategory)
    const view = new CheckAnswersView(presenter)

    res.render(...view.renderArgs)
  }

  async sendDraftReferral(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.sendDraftReferral(res.locals.user.token, req.params.id)

    res.redirect(303, `/referrals/${referral.id}/confirmation`)
  }

  async viewConfirmation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token, req.params.id)
    const serviceProvider = await this.interventionsService.getServiceProvider(
      res.locals.user.token,
      referral.referral.serviceProviderId
    )

    const presenter = new ConfirmationPresenter(referral, serviceProvider)
    const view = new ConfirmationView(presenter)

    res.render(...view.renderArgs)
  }
}
