import { Request, Response } from 'express'
import createError from 'http-errors'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import { FormValidationError } from '../../utils/formValidationError'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import ReferralFormPresenter from './form/referralFormPresenter'
import ReferralStartPresenter from './start/referralStartPresenter'
import CompletionDeadlinePresenter from './completion-deadline/completionDeadlinePresenter'
import ReferralFormView from './form/referralFormView'
import ReferralTypePresenter from './referral-type-form/referralTypePresenter'
import ReferralTypeFormView from './referral-type-form/referralTypeFormView'
import CompletionDeadlineView from './completion-deadline/completionDeadlineView'
import CompletionDeadlineForm from './completion-deadline/completionDeadlineForm'
import ComplexityLevelView from './service-category/complexity-level/complexityLevelView'
import ComplexityLevelPresenter from './service-category/complexity-level/complexityLevelPresenter'
import ComplexityLevelForm from './service-category/complexity-level/complexityLevelForm'
import FurtherInformationPresenter from './further-information/furtherInformationPresenter'
import FurtherInformationView from './further-information/furtherInformationView'
import DesiredOutcomesPresenter from './service-category/desired-outcomes/desiredOutcomesPresenter'
import DesiredOutcomesView from './service-category/desired-outcomes/desiredOutcomesView'
import DesiredOutcomesForm from './service-category/desired-outcomes/desiredOutcomesForm'
import NeedsAndRequirementsPresenter from './needs-and-requirements/needsAndRequirementsPresenter'
import NeedsAndRequirementsView from './needs-and-requirements/needsAndRequirementsView'
import NeedsAndRequirementsForm from './needs-and-requirements/needsAndRequirementsForm'
import RiskInformationPresenter from './risk-information/riskInformationPresenter'
import RiskInformationView from './risk-information/riskInformationView'
import ReferralStartView from './start/referralStartView'
import CheckAllReferralInformationView from './check-all-referral-information/checkAllReferralInformationView'
import CheckAllReferralInformationPresenter from './check-all-referral-information/checkAllReferralInformationPresenter'
import ConfirmationView from './confirmation/confirmationView'
import ConfirmationPresenter from './confirmation/confirmationPresenter'
import DeliusServiceUser from '../../models/delius/deliusServiceUser'
import { DeliusResponsibleOfficer } from '../../models/delius/deliusResponsibleOfficer'
import errorMessages from '../../utils/errorMessages'
import logger from '../../../log'
import ServiceUserDetailsPresenter from './service-user-details/serviceUserDetailsPresenter'
import ServiceUserDetailsView from './service-user-details/serviceUserDetailsView'
import ReferralStartForm from './start/referralStartForm'
import RelevantSentencePresenter from './relevant-sentence/relevantSentencePresenter'
import RelevantSentenceView from './relevant-sentence/relevantSentenceView'
import RelevantSentenceForm from './relevant-sentence/relevantSentenceForm'
import ControllerUtils from '../../utils/controllerUtils'
import UpdateServiceCategoriesPresenter from './service-categories/updateServiceCategoriesPresenter'
import UpdateServiceCategoriesView from './service-categories/updateServiceCategoriesView'
import UpdateServiceCategoriesForm from './service-categories/updateServiceCategoriesForm'
import EnforceableDaysForm from './enforceable-days/enforceableDaysForm'
import EnforceableDaysPresenter from './enforceable-days/enforceableDaysPresenter'
import EnforceableDaysView from './enforceable-days/enforceableDaysView'
import RiskInformationForm from './risk-information/riskInformationForm'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import OasysRiskInformationPresenter from './risk-information/oasys/view/oasysRiskInformationPresenter'
import OasysRiskInformationView from './risk-information/oasys/view/oasysRiskInformationView'
import { RestClientError } from '../../data/restClient'
import EditOasysRiskInformationView from './risk-information/oasys/edit/editOasysRiskInformationView'
import EditOasysRiskInformationPresenter from './risk-information/oasys/edit/editOasysRiskInformationPresenter'
import DraftReferral from '../../models/draftReferral'
import ConfirmOasysRiskInformationForm from './risk-information/oasys/confirmOasysRiskInformationForm'
import EditOasysRiskInformationForm from './risk-information/oasys/edit/editOasysRiskInformationForm'
import { DraftOasysRiskInformation } from '../../models/draftOasysRiskInformation'
import OasysRiskSummaryView from './risk-information/oasys/oasysRiskSummaryView'
import CurrentLocationPresenter from './current-location/currentLocationPresenter'
import CurrentLocationView from './current-location/currentLocationView'
import PrisonRegisterService from '../../services/prisonRegisterService'
import CurrentLocationForm from './current-location/currentLocationForm'
import ReferralTypeForm from './referral-type-form/referralTypeForm'
import ExpectedReleaseDateForm from './expected-release-date/expectedReleaseDateForm'
import ExpectedReleaseDatePresenter from './expected-release-date/expectedReleaseDatePresenter'
import ExpectedReleaseDateView from './expected-release-date/expectedReleaseDateView'
import ConfirmProbationPractitionerDetailsPresenter from './confirm-probation-practitioner-details/confirmProbationPractitionerDetailsPresenter'
import ConfirmProbationPractitionerDetailsView from './confirm-probation-practitioner-details/confirmProbationPractitionerDetailsView'
import ReferenceDataService from '../../services/referenceDataService'
import ConfirmProbationPractitionerDetailsForm from './confirm-probation-practitioner-details/confirmProbationPractitionerDetailsForm'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import ServiceUser from '../../models/serviceUser'
import PrisonReleasePresenter from './prison-release-form/prisonReleasePresenter'
import PrisonReleaseForm from './prison-release-form/prisonReleaseForm'
import PrisonReleaseFormView from './prison-release-form/prisonReleaseFormView'
import ConfirmMainPointOfContactDetailsPresenter from './confirm-main-point-of-contact-details/confirmMainPointOfContactDetailsPresenter'
import ConfirmMainPointOfContactDetailsView from './confirm-main-point-of-contact-details/confirmMainPointOfContactDetailsView'
import ConfirmMainPointOfContactDetailsForm from './confirm-main-point-of-contact-details/confirmMainPointOfContactDetailsForm'

export default class MakeAReferralController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly referenceDataService: ReferenceDataService
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

    // We trim and change to uppercase to make user experience more pleasant. All CRNs are uppercase in delius.
    const crn = req.body['service-user-crn']?.trim()?.toUpperCase()
    const { interventionId } = req.params
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(crn)

    if (form.isValid) {
      try {
        serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(crn)
      } catch (e) {
        const rce = e as RestClientError

        if (rce.status === 404) {
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
          logger.error({ err: rce }, 'crn lookup failed')
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

      if (this.userHasComAllocated(deliusResponsibleOfficer)) {
        res.redirect(301, `/referrals/${referral.id}/referral-type-form`)
      } else {
        res.redirect(301, `/referrals/${referral.id}/prison-release-form`)
      }
    } else {
      const presenter = new ReferralStartPresenter(interventionId, error)
      const view = new ReferralStartView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewServiceUserDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    const prisons = await this.prisonRegisterService.getPrisons()

    const presenter = new ServiceUserDetailsPresenter(referral.serviceUser, serviceUser, prisons, referral.id)
    const view = new ServiceUserDetailsView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async confirmServiceUserDetails(req: Request, res: Response): Promise<void> {
    res.redirect(`/referrals/${req.params.id}/risk-information`)
  }

  private async getDraftOasysRiskInformation(
    accessToken: string,
    referralId: string
  ): Promise<DraftOasysRiskInformation | null> {
    try {
      return await this.interventionsService.getDraftOasysRiskInformation(accessToken, referralId)
    } catch (e) {
      const restClientError = e as RestClientError
      if (restClientError.status === 404) {
        return null
      }
      throw e
    }
  }

  async viewReferralForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const [intervention, serviceUser] = await Promise.all([
      this.interventionsService.getIntervention(accessToken, referral.interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
    ])
    if (
      intervention.serviceCategories.length === 1 &&
      (referral.serviceCategoryIds === null || referral.serviceCategoryIds.length === 0)
    ) {
      throw new Error('No service category selected')
    }

    const draftOasysRiskInformation = await this.getDraftOasysRiskInformation(accessToken, referralId)
    const presenter = new ReferralFormPresenter(referral, intervention, draftOasysRiskInformation)
    const view = new ReferralFormView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewReferralTypeForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const [serviceUser] = await Promise.all([this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)])
    const presenter = new ReferralTypePresenter(referral, null, req.body)
    const view = new ReferralTypeFormView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewPrisonReleaseForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const serviceUser = await Promise.resolve(this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn))
    const presenter = new PrisonReleasePresenter(referral, null, req.body)
    const view = new PrisonReleaseFormView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewRelevantSentence(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const [intervention, caseConvictions] = await Promise.all([
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.interventionId),
      this.ramDeliusApiService.getConvictionsByCrn(referral.serviceUser.crn),
    ])

    const serviceUser = caseConvictions.caseDetail
    const { convictions } = caseConvictions

    if (convictions.length < 1) {
      throw createError(500, `No active convictions found for ${referral.serviceUser.crn}`, {
        userMessage: `No convictions were found in nDelius for ${referral.serviceUser.crn}.`,
      })
    }

    const presenter = new RelevantSentencePresenter(referral, intervention, convictions)
    const view = new RelevantSentenceView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateRelevantSentence(req: Request, res: Response): Promise<void> {
    const form = await RelevantSentenceForm.createForm(req)

    let error: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    if (!referral.serviceCategoryIds || referral.serviceCategoryIds.length < 1) {
      throw new Error(
        'Attempting to update relevant sentence without service category selected; ' +
          'a selected service category is required to construct the link to the next page in the referral form.'
      )
    }

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/service-category/${referral.serviceCategoryIds[0]}/desired-outcomes`)
    } else {
      const [intervention, caseConvictions] = await Promise.all([
        this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.interventionId),
        this.ramDeliusApiService.getConvictionsByCrn(referral.serviceUser.crn),
      ])

      const serviceUser = caseConvictions.caseDetail
      const { convictions } = caseConvictions

      if (convictions.length < 1) {
        throw createError(500, `No active convictions found for ${referral.serviceUser.crn}`, {
          userMessage: `No convictions were found in nDelius for ${referral.serviceUser.crn}.`,
        })
      }

      const presenter = new RelevantSentencePresenter(referral, intervention, convictions, error)
      const view = new RelevantSentenceView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
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

          if (referral.serviceCategoryIds) {
            const serviceCategoryIndex = referral.serviceCategoryIds.indexOf(serviceCategoryId)
            const isLastSelectedServiceCategory = serviceCategoryIndex === referral.serviceCategoryIds.length - 1
            if (!isLastSelectedServiceCategory) {
              const nextServiceCategoryId = referral.serviceCategoryIds[serviceCategoryIndex + 1]
              return res.redirect(`/referrals/${referralId}/service-category/${nextServiceCategoryId}/desired-outcomes`)
            }
          }

          return res.redirect(`/referrals/${referralId}/enforceable-days`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          formError = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(accessToken, serviceCategoryId),
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
    ])

    const presenter = new ComplexityLevelPresenter(referral, serviceCategory, formError)
    const view = new ComplexityLevelView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewCompletionDeadline(req: Request, res: Response): Promise<void> {
    const isSentReferral = await this.isSentReferral(req, res)
    const { interventionId, serviceUser, completionDeadline } = await this.getCompletionDeadlinePresenterParams(
      isSentReferral,
      req,
      res
    )

    const [intervention, serviceUserDetails] = await Promise.all([
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(serviceUser.crn),
    ])

    const presenter = new CompletionDeadlinePresenter(
      completionDeadline,
      intervention,
      isSentReferral,
      req.params.id,
      serviceUser
    )

    const view = new CompletionDeadlineView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUserDetails)
  }

  async updateCompletionDeadline(req: Request, res: Response): Promise<void> {
    const isSentReferral = await this.isSentReferral(req, res)
    const data = await new CompletionDeadlineForm(req, isSentReferral).data()

    let error: FormValidationError | null = null

    if (data.paramsForUpdate) {
      if (!isSentReferral) {
        try {
          await this.interventionsService.patchDraftReferral(res.locals.user.token.accessToken, req.params.id, {
            completionDeadline: data.paramsForUpdate.completionDeadline,
          })
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          error = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      } else {
        try {
          await this.interventionsService.updateSentReferralDetails(res.locals.user.token.accessToken, req.params.id, {
            completionDeadline: data.paramsForUpdate.completionDeadline,
            reasonForChange: data.paramsForUpdate.reasonForChange!,
          })
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          error = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
    } else {
      error = data.error
    }

    if (isSentReferral && error === null) {
      res.redirect(`/probation-practitioner/referrals/${req.params.id}/details?detailsUpdated=true`)
      return
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/further-information`)
    } else {
      const { interventionId, serviceUser, completionDeadline } = await this.getCompletionDeadlinePresenterParams(
        isSentReferral,
        req,
        res
      )

      const [intervention, serviceUserDetails] = await Promise.all([
        this.interventionsService.getIntervention(res.locals.user.token.accessToken, interventionId),
        this.ramDeliusApiService.getCaseDetailsByCrn(serviceUser.crn),
      ])

      const presenter = new CompletionDeadlinePresenter(
        completionDeadline,
        intervention,
        isSentReferral,
        req.params.id,
        serviceUser,
        error,
        req.body
      )
      const view = new CompletionDeadlineView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUserDetails)
    }
  }

  private async getCompletionDeadlinePresenterParams(
    isSentReferral: boolean,
    req: Request,
    res: Response
  ): Promise<{ interventionId: string; serviceUser: ServiceUser; completionDeadline: string | null }> {
    let referral
    if (isSentReferral) {
      referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
      return {
        interventionId: referral.referral.interventionId,
        serviceUser: referral.referral.serviceUser,
        completionDeadline: referral.referral.completionDeadline,
      }
    }
    referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    return {
      interventionId: referral.interventionId,
      serviceUser: referral.serviceUser,
      completionDeadline: referral.completionDeadline,
    }
  }

  async viewFurtherInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const [intervention, serviceUser] = await Promise.all([
      this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.interventionId),
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
    ])

    const presenter = new FurtherInformationPresenter(referral, intervention)

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
      const interventionsServiceError = e as InterventionsServiceError
      error = createFormValidationErrorOrRethrow(interventionsServiceError)
    }

    if (!error) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )

      const [intervention, serviceUser] = await Promise.all([
        this.interventionsService.getIntervention(res.locals.user.token.accessToken, referral.interventionId),
        this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
      ])

      const presenter = new FurtherInformationPresenter(referral, intervention, error, req.body)
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

          return res.redirect(`/referrals/${referralId}/service-category/${serviceCategoryId}/complexity-level`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          formError = createFormValidationErrorOrRethrow(interventionsServiceError)
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
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
    ])

    const presenter = new DesiredOutcomesPresenter(referral, serviceCategory, formError)
    const view = new DesiredOutcomesView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async viewNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

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
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new NeedsAndRequirementsPresenter(referral, error, req.body)
      const view = new NeedsAndRequirementsView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async editCurrentLocation(req: Request, res: Response): Promise<void> {
    const prisons = await this.prisonRegisterService.getPrisons()
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new CurrentLocationPresenter(referral, prisons, null, req.body)
    const view = new CurrentLocationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitReferralTypeForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await ReferralTypeForm.createForm(req, referral)

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new ReferralTypePresenter(referral, error, req.body)
      const view = new ReferralTypeFormView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async submitPrisonReleaseForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await PrisonReleaseForm.createForm(req, referral)

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new PrisonReleasePresenter(referral, error, req.body)
      const view = new PrisonReleaseFormView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async submitCurrentLocation(req: Request, res: Response): Promise<void> {
    const prisons = await this.prisonRegisterService.getPrisons()
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await CurrentLocationForm.createForm(req, referral)

    let error: FormValidationError | null = null

    if (form.isValid) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    }

    if (
      error === null &&
      form.paramsForUpdate.personCustodyPrisonId != null &&
      referral.isReferralReleasingIn12Weeks != null &&
      !referral.isReferralReleasingIn12Weeks
    ) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else if (error === null && form.paramsForUpdate.personCustodyPrisonId != null) {
      res.redirect(`/referrals/${req.params.id}/expected-release-date`)
    } else if (error === null && form.paramsForUpdate.personCustodyPrisonId == null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new CurrentLocationPresenter(referral, prisons, error, req.body)
      const view = new CurrentLocationView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewExpectedReleaseDate(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ExpectedReleaseDatePresenter(referral)
    const view = new ExpectedReleaseDateView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateExpectedReleaseDate(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await new ExpectedReleaseDateForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }
    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new ExpectedReleaseDatePresenter(referral, error, req.body)
      const view = new ExpectedReleaseDateView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async confirmProbationPractitionerDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ConfirmProbationPractitionerDetailsPresenter(
      referral,
      deliusOfficeLocations,
      deliusDeliveryUnits,
      deliusResponsibleOfficer
    )
    const view = new ConfirmProbationPractitionerDetailsView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateProbationPractitionerDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const form = await ConfirmProbationPractitionerDetailsForm.createForm(req, referral, deliusResponsibleOfficer)

    let error: FormValidationError | null = null

    if (!form.error) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }
    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new ConfirmProbationPractitionerDetailsPresenter(
        referral,
        deliusOfficeLocations,
        deliusDeliveryUnits,
        deliusResponsibleOfficer,
        error,
        req.body
      )
      const view = new ConfirmProbationPractitionerDetailsView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async confirmMainPointOfContactDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const prisons = await this.prisonRegisterService.getPrisons()

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ConfirmMainPointOfContactDetailsPresenter(
      referral,
      prisons,
      deliusOfficeLocations,
      deliusDeliveryUnits,
      deliusResponsibleOfficer
    )
    const view = new ConfirmMainPointOfContactDetailsView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateMainPointOfContactDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const prisons = await this.prisonRegisterService.getPrisons()
    const form = await ConfirmMainPointOfContactDetailsForm.createForm(req, referral, deliusResponsibleOfficer)

    let error: FormValidationError | null = null

    if (!form.error) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          form.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = form.error
    }
    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new ConfirmMainPointOfContactDetailsPresenter(
        referral,
        prisons,
        deliusOfficeLocations,
        deliusDeliveryUnits,
        deliusResponsibleOfficer,
        error,
        req.body
      )
      const view = new ConfirmMainPointOfContactDetailsView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewRiskInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    await this.displayOasysRiskInformationPage(res, referral, serviceUser)
  }

  private async displayOasysRiskInformationPage(
    res: Response,
    referral: DraftReferral,
    serviceUser: DeliusServiceUser,
    error: FormValidationError | null = null
  ) {
    const { accessToken } = res.locals.user.token
    const label = `${referral.serviceUser?.firstName} ${referral.serviceUser?.lastName} (CRN: ${referral.serviceUser?.crn})`
    const riskSummary = await this.assessRisksAndNeedsService.getRiskSummary(referral.serviceUser.crn, accessToken)
    const presenter = new OasysRiskInformationPresenter(referral.id, riskSummary, error, label)
    const view = new OasysRiskInformationView(presenter)
    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async confirmEditOasysRiskInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const confirmEditRiskForm = await ConfirmOasysRiskInformationForm.createForm(req)
    if (confirmEditRiskForm.isValid) {
      if (confirmEditRiskForm.userWantsToEdit) {
        res.redirect(`/referrals/${referralId}/edit-oasys-risk-information`)
      } else {
        const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)
        const riskSummary = await this.assessRisksAndNeedsService.getRiskSummary(referral.serviceUser.crn, accessToken)
        const oasysRiskSummaryView = new OasysRiskSummaryView(riskSummary)
        const draftOasysRiskInformation: DraftOasysRiskInformation = {
          riskSummaryWhoIsAtRisk: oasysRiskSummaryView.oasysRiskInformationArgs.summary.whoIsAtRisk.text,
          riskSummaryNatureOfRisk: oasysRiskSummaryView.oasysRiskInformationArgs.summary.natureOfRisk.text,
          riskSummaryRiskImminence: oasysRiskSummaryView.oasysRiskInformationArgs.summary.riskImminence.text,
          riskToSelfSuicide: oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.suicide.text,
          riskToSelfSelfHarm: oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.selfHarm.text,
          riskToSelfHostelSetting: oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.hostelSetting.text,
          riskToSelfVulnerability: oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.vulnerability.text,
          additionalInformation: null,
        }
        await this.interventionsService.updateDraftOasysRiskInformation(
          accessToken,
          referralId,
          draftOasysRiskInformation
        )
        res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
      }
    } else {
      const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, referralId)
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
      await this.displayOasysRiskInformationPage(res, referral, serviceUser, confirmEditRiskForm.error)
    }
  }

  async editOasysRiskInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    let error: FormValidationError | null = null
    let draftOasysRiskInformation: DraftOasysRiskInformation | null = null
    if (req.method === 'POST') {
      const form = await EditOasysRiskInformationForm.createForm(req)
      if (form.isValid) {
        await this.interventionsService.updateDraftOasysRiskInformation(
          accessToken,
          referralId,
          form.editedDraftRiskInformation
        )

        res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
        return
      }
      error = form.error
      draftOasysRiskInformation = form.editedDraftRiskInformation
    } else {
      try {
        draftOasysRiskInformation = await this.interventionsService.getDraftOasysRiskInformation(
          accessToken,
          referralId
        )
      } catch (e) {
        const restClientError = e as RestClientError
        if (restClientError.status === 404) {
          draftOasysRiskInformation = null
        } else {
          throw e
        }
      }
    }
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)
    const [serviceUser, riskSummary] = await Promise.all([
      this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn),
      this.assessRisksAndNeedsService.getRiskSummary(referral.serviceUser.crn, accessToken),
    ])
    const label = `${referral.serviceUser?.firstName} ${referral.serviceUser?.lastName} (CRN: ${referral.serviceUser?.crn})`

    const presenter = new EditOasysRiskInformationPresenter(riskSummary, draftOasysRiskInformation, error, label)
    const view = new EditOasysRiskInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateRiskInformation(req: Request, res: Response): Promise<void> {
    let error: FormValidationError | null = null

    const data = await new RiskInformationForm(req).data()
    error = data.error

    if (data.error === null) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          data.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/needs-and-requirements`)
    } else {
      const referral = await this.interventionsService.getDraftReferral(
        res.locals.user.token.accessToken,
        req.params.id
      )

      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
      const presenter = new RiskInformationPresenter(referral, error, req.body)
      const view = new RiskInformationView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async viewEnforceableDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new EnforceableDaysPresenter(
      referral.serviceUser.crn,
      referral.maximumEnforceableDays,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName
    )
    const view = new EnforceableDaysView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async updateEnforceableDays(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const data = await new EnforceableDaysForm(req).data()

    let error: FormValidationError | null = null

    if (!data.error) {
      try {
        await this.interventionsService.patchDraftReferral(
          res.locals.user.token.accessToken,
          req.params.id,
          data.paramsForUpdate
        )
      } catch (e) {
        const interventionsServiceError = e as InterventionsServiceError
        error = createFormValidationErrorOrRethrow(interventionsServiceError)
      }
    } else {
      error = data.error
    }

    if (error === null) {
      res.redirect(`/referrals/${req.params.id}/completion-deadline`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
      const presenter = new EnforceableDaysPresenter(
        referral.serviceUser.crn,
        referral.maximumEnforceableDays,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        error,
        req.body
      )
      const view = new EnforceableDaysView(presenter)

      res.status(400)
      ControllerUtils.renderWithLayout(res, view, serviceUser)
    }
  }

  async checkAllReferralInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referral = await this.interventionsService.getDraftReferral(accessToken, req.params.id)
    const prisons = await this.prisonRegisterService.getPrisons()
    if (referral.serviceCategoryIds === null) {
      throw new Error('Attempting to check answers without service categories selected')
    }
    if (referral.relevantSentenceId === null) {
      throw new Error('Attempting to check answers without relevant sentence selected')
    }

    const [intervention, caseConviction] = await Promise.all([
      this.interventionsService.getIntervention(accessToken, referral.interventionId),
      this.ramDeliusApiService.getConvictionByCrnAndId(referral.serviceUser.crn, referral.relevantSentenceId),
    ])
    const editedOasysRiskInformation = await this.interventionsService.getDraftOasysRiskInformation(
      accessToken,
      referral.id
    )
    const presenter = new CheckAllReferralInformationPresenter(
      referral,
      intervention,
      caseConviction.conviction,
      caseConviction.caseDetail,
      prisons,
      editedOasysRiskInformation
    )
    const view = new CheckAllReferralInformationView(presenter)

    ControllerUtils.renderWithLayout(res, view, caseConviction.caseDetail)
  }

  async sendDraftReferral(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.sendDraftReferral(res.locals.user.token.accessToken, req.params.id)

    res.redirect(303, `/referrals/${referral.id}/confirmation`)
  }

  async updateServiceCategories(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    let formError: FormValidationError | null = null

    const referral = await this.interventionsService.getDraftReferral(accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

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
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new ConfirmationPresenter(referral, res.locals.user)
    const view = new ConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async isSentReferral(req: Request, res: Response): Promise<boolean> {
    try {
      await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
      return true
    } catch (e) {
      const interventionsServiceError = e as InterventionsServiceError
      if (interventionsServiceError.status === 404) {
        return false
      }
      throw e
    }
  }

  userHasComAllocated(deliusResponsibleOfficer: DeliusResponsibleOfficer | null): boolean {
    if (
      deliusResponsibleOfficer !== null &&
      !deliusResponsibleOfficer?.communityManager.unallocated &&
      !deliusResponsibleOfficer?.prisonManager?.unallocated
    ) {
      return true
    }
    return false
  }
}
