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
import CommunityApiService from '../../services/communityApiService'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import errorMessages from '../../utils/errorMessages'
import logger from '../../../log'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import ServiceUserDetailsView from './serviceUserDetailsView'
import ReferralStartForm from './referralStartForm'
import RelevantSentencePresenter from './relevantSentencePresenter'
import RelevantSentenceView from './relevantSentenceView'
import RelevantSentenceForm from './relevantSentenceForm'
import ControllerUtils from '../../utils/controllerUtils'
import UpdateServiceCategoriesPresenter from './updateServiceCategoriesPresenter'
import UpdateServiceCategoriesView from './updateServiceCategoriesView'
import UpdateServiceCategoriesForm from './updateServiceCategoriesForm'

export default class ReferralsController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    const { interventionId } = req.params

    const presenter = new ReferralStartPresenter(interventionId)
    const view = new ReferralStartView(presenter)

    ControllerUtils.renderWithLayout(res, view, null)
  }

  async createReferral(req: Request, res: Response): Promise<void> {
    const form = await ReferralStartForm.createForm(req)

    let error: FormValidationError | null = null

    let serviceUser: DeliusServiceUser | null = null

    const crn = req.body['service-user-crn']
    const { interventionId } = req.params

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
          logger.error({ err: e }, 'crn lookup failed')
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
        res.locals.user.token.accessToken,
        crn,
        interventionId
      )

      await this.interventionsService.patchDraftReferral(res.locals.user.token.accessToken, referral.id, {
        serviceUser: this.interventionsService.serializeDeliusServiceUser(serviceUser),
      })

      res.redirect(303, `/referrals/${referral.id}/form`)
    } else {
      const presenter = new ReferralStartPresenter(interventionId, error)
      const view = new ReferralStartView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewServiceUserDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)

    const presenter = new ServiceUserDetailsPresenter(referral.serviceUser)
    const view = new ServiceUserDetailsView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async confirmServiceUserDetails(req: Request, res: Response): Promise<void> {
    res.redirect(`/referrals/${req.params.id}/risk-information`)
  }

  async viewReferralForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('No service category selected')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new ReferralFormPresenter(referral, serviceCategory.name)
    const view = new ReferralFormView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewRelevantSentence(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view relevant sentence without service category selected')
    }

    const [serviceCategory, serviceUser, convictions] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
      this.communityApiService.getActiveConvictionsByCRN(referral.serviceUser.crn),
    ])

    if (convictions.length < 1) {
      throw new Error(`No active convictions found for service user ${referral.serviceUser.crn}`)
    }

    const presenter = new RelevantSentencePresenter(referral, serviceCategory, convictions)
    const view = new RelevantSentenceView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateRelevantSentence(req: Request, res: Response): Promise<void> {
    const form = await RelevantSentenceForm.createForm(req)

    let error: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (!referral.serviceCategoryIds || referral.serviceCategoryIds.length < 1) {
      throw new Error('Attempting to update relevant sentence without service category selected')
    }

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/service-category/${referral.serviceCategoryIds[0]}/desired-outcomes`)
    } else {
      if (!referral.serviceCategoryId) {
        throw new Error('Attempting to view relevant sentence without service category selected')
      }

      const [serviceCategory, serviceUser, convictions] = await Promise.all([
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
        this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
        this.communityApiService.getActiveConvictionsByCRN(referral.serviceUser.crn),
      ])

      if (convictions.length < 1) {
        throw new Error(`No active convictions found for service user ${referral.serviceUser.crn}`)
      }

      const presenter = new RelevantSentencePresenter(referral, serviceCategory, convictions, error)
      const view = new RelevantSentenceView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewComplexityLevel(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view complexity level without service category selected')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new ComplexityLevelPresenter(referral, serviceCategory)
    const view = new ComplexityLevelView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewOrUpdateComplexityLevel(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId, serviceCategoryId } = req.params
    let formError: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    if (req.method === 'POST') {
      const data = await new ComplexityLevelForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
      } else {
        try {
          await this.interventionsService.setComplexityLevelForServiceCategory(accessToken, referralId, {
            serviceCategoryId,
            ...data.paramsForUpdate,
          })

          if (referral.serviceCategoryIds && referral.serviceCategoryIds.length > 1) {
            // TODO IC-1686: take to next service category desired outcome or completion deadline if this is the last service category
            return res.redirect(`/referrals/${referralId}/form`)
          }

          return res.redirect(`/referrals/${referralId}/completion-deadline`)
        } catch (e) {
          formError = createFormValidationErrorOrRethrow(e)
        }
      }
    }

    if (!referral.serviceCategoryIds || !referral.serviceCategoryIds.includes(serviceCategoryId)) {
      throw new Error('Attempting to view complexity level without service categories set on the referral')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(accessToken, serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new ComplexityLevelPresenter(referral, serviceCategory, formError)
    const view = new ComplexityLevelView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateComplexityLevel(req: Request, res: Response): Promise<void> {
    const data = await new ComplexityLevelForm(req).data()

    let formError: FormValidationError | null = null

    if (!data.error) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          data.paramsForUpdate
        )
      } catch (e) {
        formError = createFormValidationErrorOrRethrow(e)
      }
    } else {
      formError = data.error
    }

    if (!formError) {
      res.redirect(`/referrals/${req.params.id}/completion-deadline`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )

      if (referral.serviceCategoryId === null) {
        throw new Error('Attempting to view complexity level without service category selected')
      }

      const [serviceCategory, serviceUser] = await Promise.all([
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
        this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
      ])

      const presenter = new ComplexityLevelPresenter(referral, serviceCategory, formError, req.body)
      const view = new ComplexityLevelView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewCompletionDeadline(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view completion deadline without service category selected')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new CompletionDeadlinePresenter(referral, serviceCategory)

    const view = new CompletionDeadlineView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateCompletionDeadline(req: Request, res: Response): Promise<void> {
    const data = await new CompletionDeadlineForm(req).data()

    let error: FormValidationError | null = null

    if (data.paramsForUpdate) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          data.paramsForUpdate
        )
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = data.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/rar-days`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )

      if (referral.serviceCategoryId === null) {
        throw new Error('Attempting to view completion deadline without service category selected')
      }

      const [serviceCategory, serviceUser] = await Promise.all([
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
        this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
      ])

      const presenter = new CompletionDeadlinePresenter(referral, serviceCategory, error, req.body)
      const view = new CompletionDeadlineView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewFurtherInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view further information without service category selected')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new FurtherInformationPresenter(referral, serviceCategory)

    const view = new FurtherInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateFurtherInformation(req: Request, res: Response): Promise<void> {
    let error: FormValidationError | null = null

    const paramsForUpdate = {
      furtherInformation: req.body['further-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id,
        paramsForUpdate
      )
    } catch (e) {
      error = createFormValidationErrorOrRethrow(e)
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )

      if (!referral.serviceCategoryId) {
        throw new Error('Attempting to view complexity level without service category selected')
      }

      const [serviceCategory, serviceUser] = await Promise.all([
        this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
        this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
      ])

      const presenter = new FurtherInformationPresenter(referral, serviceCategory, error, req.body)
      const view = new FurtherInformationView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewOrUpdateDesiredOutcomes(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId, serviceCategoryId } = req.params
    let formError: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    if (req.method === 'POST') {
      const data = await new DesiredOutcomesForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
      } else {
        try {
          await this.interventionsService.setDesiredOutcomesForServiceCategory(accessToken, referralId, {
            serviceCategoryId,
            ...data.paramsForUpdate,
          })

          if (referral.serviceCategoryIds && referral.serviceCategoryIds.length > 1) {
            return res.redirect(`/referrals/${referralId}/form`)
          }

          return res.redirect(`/referrals/${referralId}/service-category/${serviceCategoryId}/complexity-level`)
        } catch (e) {
          formError = createFormValidationErrorOrRethrow(e)
        }
      }
    }

    if (!referral.serviceCategoryIds) {
      throw new Error('Attempting to view desired outcomes without service categories selected')
    }

    const selectedServiceCategoryId = referral.serviceCategoryIds.find(id => id === serviceCategoryId)

    if (!selectedServiceCategoryId) {
      throw new Error('Requested service category not set on the referral')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(accessToken, selectedServiceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new DesiredOutcomesPresenter(referral, serviceCategory, formError)
    const view = new DesiredOutcomesView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)

    const presenter = new NeedsAndRequirementsPresenter(referral)
    const view = new NeedsAndRequirementsView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await NeedsAndRequirementsForm.createForm(req, referral)

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)

      const presenter = new NeedsAndRequirementsPresenter(referral, error, req.body)
      const view = new NeedsAndRequirementsView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewRiskInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)
    const presenter = new RiskInformationPresenter(referral)
    const view = new RiskInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateRiskInformation(req: Request, res: Response): Promise<void> {
    let error: FormValidationError | null = null

    const paramsForUpdate = {
      additionalRiskInformation: req.body['additional-risk-information'],
    }

    try {
      await this.interventionsService.patchDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id,
        paramsForUpdate
      )
    } catch (e) {
      error = createFormValidationErrorOrRethrow(e)
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )
      const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)

      const presenter = new RiskInformationPresenter(referral, error, req.body)
      const view = new RiskInformationView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewRarDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to view RAR days without service category selected')
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new RarDaysPresenter(referral, serviceCategory)
    const view = new RarDaysView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateRarDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to update RAR days without service category selected')
    }

    const serviceCategory = await this.interventionsService.getServiceCategory(
      res.locals.user.token.accessToken,
      referral.serviceCategoryId
    )

    const form = await RarDaysForm.createForm(req, serviceCategory)

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        error = createFormValidationErrorOrRethrow(e)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/further-information`)
    } else {
      const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)
      const presenter = new RarDaysPresenter(referral, serviceCategory, error, req.body)
      const view = new RarDaysView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async checkAnswers(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    if (referral.serviceCategoryId === null) {
      throw new Error('Attempting to check answers without service category selected')
    }
    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(res.locals.user.token.accessToken, referral.serviceCategoryId),
      this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn),
    ])

    const presenter = new CheckAnswersPresenter(referral, serviceCategory)
    const view = new CheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async sendDraftReferral(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.sendDraftReferral(res.locals.user.token.accessToken, req.params.id)

    res.redirect(303, `/referrals/${referral.id}/confirmation`)
  }

  async updateServiceCategories(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    let formError: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.serviceUser.crn)

    if (req.method === 'POST') {
      const data = await new UpdateServiceCategoriesForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
      } else {
        await this.interventionsService.patchDraftReferral(accessToken, req.params.id, data.paramsForUpdate)

        return res.redirect(`/referrals/${req.params.id}/form`)
      }
    }

    const intervention = await this.interventionsService.getIntervention(accessToken, referral.interventionId)

    const presenter = new UpdateServiceCategoriesPresenter(referral, intervention.serviceCategories, formError)
    const view = new UpdateServiceCategoriesView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewConfirmation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)

    const presenter = new ConfirmationPresenter(referral)
    const view = new ConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
