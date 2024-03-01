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
import CurrentLocationPresenter from './current-location/currentLocationPresenter'
import CurrentLocationView from './current-location/currentLocationView'
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
import RiskSummary from '../../models/assessRisksAndNeeds/riskSummary'
import OasysRiskSummaryView from './risk-information/oasys/oasysRiskSummaryView'
import CommunityAllocatedPresenter from './community-allocated-form/communityAllocatedPresenter'
import CommunityAllocatedView from './community-allocated-form/communityAllocatedView'
import CommunityAllocatedForm from './community-allocated-form/communityAllocatedForm'
import PrisonAndSecureChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import UpdateProbationPractitionerView from './update/probation-practitioner-name/updateProbationPractitionerView'
import UpdateProbationPractitionerNamePresenter from './update/probation-practitioner-name/updateProbationPractitionerNamePresenter'
import UpdateProbationPractitionerForm from './update/probation-practitioner-name/updateProbationPractitionerNameForm'
import UpdateProbationPractitionerEmailAddressForm from './update/probation-practitioner-email-address/updateProbationPractitionerEmailAddressForm'
import UpdateProbationPractitionerEmailAddressPresenter from './update/probation-practitioner-email-address/updateProbationPractitionerEmailAddressPresenter'
import UpdateProbationPractitionerEmailAddressView from './update/probation-practitioner-email-address/updateProbationPractitionerEmailAddressView'
import UpdateProbationPractitionerPhoneNumberPresenter from './update/probation-practitioner-phone-number/updateProbationPractitionerPhoneNumberPresenter'
import UpdateProbationPractitionerPhoneNumberView from './update/probation-practitioner-phone-number/updateProbationPractitionerPhoneNumberView'
import UpdateProbationPractitionerPhoneNumberForm from './update/probation-practitioner-phone-number/updateProbationPractitionerPhoneNumberForm'
import UpdateProbationPractitionerPduPresenter from './update/probation-practitioner-pdu/updateProbationPractitionerPduPresenter'
import UpdateProbationPractitionerPduForm from './update/probation-practitioner-pdu/updateProbationPractitionerPduForm'
import UpdateProbationPractitionerPduView from './update/probation-practitioner-pdu/updateProbationPractitionerPduView'
import DeleteProbationPractitionerFieldsPresenter from './delete/deleteProbationPractitionerFieldsPresenter'
import DeleteProbationPractitionerFieldsView from './delete/deleteProbationPractitionerFieldsView'
import DeleteProbationPractitionerFieldsForm from './delete/deleteProbationPractitionerFieldsForm'
import UpdateProbationPractitionerOfficePresenter from './update/probation-practitioner-probation-office/updateProbationPractitionerOfficePresenter'
import UpdateProbationPractitionerOfficeView from './update/probation-practitioner-probation-office/updateProbationPractitionerOfficeView'
import UpdateProbationPractitionerOfficeForm from './update/probation-practitioner-probation-office/updateProbationPractitionerOfficeForm'
import UpdateProbationPractitionerTeamPhoneNumberPresenter from './update/probation-practitioner-team-phone-number/updateProbationPractitionerTeamPhoneNumberPresenter'
import UpdateProbationPractitionerTeamPhoneNumberView from './update/probation-practitioner-team-phone-number/updateProbationPractitionerTeamPhoneNumberView'
import UpdateProbationPractitionerTeamPhoneNumberForm from './update/probation-practitioner-team-phone-number/updateProbationPractitionerTeamPhoneNumberForm'
// import DeleteProbationPractitionerPhoneNumberPresenter from './delete/probation-practioner-phone-number/deleteProbationPractitionerPhoneNumberPresenter'
// import DeleteProbationPractitionerPhoneNumberView from './delete/probation-practioner-phone-number/deleteProbationPractitionerPhoneNumberView'
// import DeleteProbationPractitionerPhoneNumberForm from './delete/probation-practioner-phone-number/deleteProbationPractitionerPhoneNumberForm'
// import DeleteProbationPractitionerView from './delete/probation-practitioner-email/deleteProbationPractitionerView'
// import DeleteProbationPractitionerPresenter from './delete/probation-practitioner-email/deleteProbationPractitionerPresenter'
// import DeleteProbationPractitionerForm from './delete/probation-practitioner-email/deleteProbationPractitionerForm'

export default class MakeAReferralController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly prisonAndSecureChildAgencyService: PrisonAndSecureChildAgencyService,
    private readonly referenceDataService: ReferenceDataService
  ) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    const { interventionId } = req.params

    const presenter = new ReferralStartPresenter(interventionId)
    const view = new ReferralStartView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, null, 'probation-practitioner')
  }

  async createReferral(req: Request, res: Response): Promise<void> {
    const form = await ReferralStartForm.createForm(req)

    let error: FormValidationError | null = null

    let serviceUser: DeliusServiceUser | null = null

    // We trim and change to uppercase to make user experience more pleasant. All CRNs are uppercase in delius.
    const crn = req.body['service-user-crn']?.trim()?.toUpperCase()
    const { interventionId } = req.params

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

      res.redirect(301, `/referrals/${referral.id}/community-allocated-form`)
    } else {
      const presenter = new ReferralStartPresenter(interventionId, error)
      const view = new ReferralStartView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewServiceUserDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ServiceUserDetailsPresenter(referral.serviceUser, serviceUser, referral.id)
    const view = new ServiceUserDetailsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async viewReferralTypeForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const [serviceUser] = await Promise.all([this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)])
    const presenter = new ReferralTypePresenter(referral, null, req.body)
    const view = new ReferralTypeFormView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async viewCommunityAllocatedForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const [serviceUser] = await Promise.all([this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)])
    const presenter = new CommunityAllocatedPresenter(referral, null, req.body)
    const view = new CommunityAllocatedView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async viewPrisonReleaseForm(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referralId = req.params.id
    const referral = await this.interventionsService.getDraftReferral(accessToken, referralId)

    const serviceUser = await Promise.resolve(this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn))
    const presenter = new PrisonReleasePresenter(referral, null, req.body)
    const view = new PrisonReleaseFormView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUserDetails, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUserDetails, 'probation-practitioner')
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async viewNeedsAndRequirements(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new NeedsAndRequirementsPresenter(referral)
    const view = new NeedsAndRequirementsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async editCurrentLocation(req: Request, res: Response): Promise<void> {
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new CurrentLocationPresenter(referral, prisonAndSecureChildAgency, null, req.body)
    const view = new CurrentLocationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async submitCommunityAllocatedForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await CommunityAllocatedForm.createForm(req, referral)

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

    if (error === null && form.paramsForUpdate.allocatedCommunityPP) {
      res.redirect(`/referrals/${req.params.id}/referral-type-form`)
    } else if (error === null && !form.paramsForUpdate.allocatedCommunityPP) {
      res.redirect(`/referrals/${req.params.id}/prison-release-form`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new PrisonReleasePresenter(referral, error, req.body)
      const view = new PrisonReleaseFormView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async submitCurrentLocation(req: Request, res: Response): Promise<void> {
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )
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

      const presenter = new CurrentLocationPresenter(referral, prisonAndSecureChildAgency, error, req.body)
      const view = new CurrentLocationView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewExpectedReleaseDate(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ExpectedReleaseDatePresenter(referral)
    const view = new ExpectedReleaseDateView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewConfirmProbationPractitionerDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    // save the initial delius data
    const savedDraftReferral = await this.saveResponsibleOfficer(referral, res, req, deliusResponsibleOfficer)

    const presenter = new ConfirmProbationPractitionerDetailsPresenter(
      savedDraftReferral,
      deliusOfficeLocations,
      deliusDeliveryUnits,
      deliusResponsibleOfficer
    )
    const view = new ConfirmProbationPractitionerDetailsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  private async saveResponsibleOfficer(
    referral: DraftReferral,
    res: Response,
    req: Request,
    deliusResponsibleOfficer: DeliusResponsibleOfficer | null
  ) {
    if (referral.ndeliusPPName === null) {
      try {
        return await this.interventionsService.patchDraftReferral(res.locals.user.token.accessToken, req.params.id, {
          ndeliusPPName: `${deliusResponsibleOfficer?.communityManager.name.forename} ${deliusResponsibleOfficer?.communityManager.name.surname}`,
          ndeliusPPEmailAddress: deliusResponsibleOfficer?.communityManager.email,
          ndeliusPDU: `${deliusResponsibleOfficer?.communityManager.pdu.description}`,
          ndeliusPhoneNumber: deliusResponsibleOfficer?.communityManager.telephoneNumber,
          ndeliusTeamPhoneNumber: deliusResponsibleOfficer?.communityManager.team.telephoneNumber,
        })
      } catch (e) {
        // ignore the error if it is happening while saving
      }
    }
    return referral
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
          form.paramsForUpdate(referral)
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewUpdateProbationPractitionerName(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const presenter = new UpdateProbationPractitionerNamePresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppName || referral.ndeliusPPName,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails
    )
    const view = new UpdateProbationPractitionerView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerName(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await new UpdateProbationPractitionerForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppName !== '') {
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
      }
    } else {
      error = form.error
    }
    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerNamePresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ndeliusPPName,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body
      )
      const view = new UpdateProbationPractitionerView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewUpdateProbationPractitionerEmailAddress(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppEmailAddress || referral.ndeliusPPEmailAddress,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails
    )
    const view = new UpdateProbationPractitionerEmailAddressView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerEmailAddress(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await new UpdateProbationPractitionerEmailAddressForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppEmailAddress !== '') {
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
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerEmailAddressPresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ndeliusPPEmailAddress,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body
      )
      const view = new UpdateProbationPractitionerEmailAddressView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewUpdateProbationPractitionerPhoneNumber(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const presenter = new UpdateProbationPractitionerPhoneNumberPresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppPhoneNumber || referral.ndeliusPhoneNumber,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails
    )
    const view = new UpdateProbationPractitionerPhoneNumberView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerPhoneNumber(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await new UpdateProbationPractitionerPhoneNumberForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppPhoneNumber !== '') {
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
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerPhoneNumberPresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ndeliusPhoneNumber,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body
      )
      const view = new UpdateProbationPractitionerPhoneNumberView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewDeleteProbationPractitionerDetails(req: Request, res: Response): Promise<void> {
    const { fieldName } = req.params

    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new DeleteProbationPractitionerFieldsPresenter(
      referral.id,
      referral.serviceUser.crn,
      fieldName,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName
    )
    const view = new DeleteProbationPractitionerFieldsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async deleteProbationPractitionerDetails(req: Request, res: Response): Promise<void> {
    const { fieldName } = req.params
    const form = await new DeleteProbationPractitionerFieldsForm(fieldName)

    // do the delete
    await this.interventionsService.patchDraftReferral(
      res.locals.user.token.accessToken,
      req.params.id,
      form.paramsForUpdate!
    )
    res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
  }

  async viewUpdateProbationPractitionerPdu(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new UpdateProbationPractitionerPduPresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppPdu || referral.ndeliusPDU,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails,
      null,
      null,
      deliusDeliveryUnits
    )
    const view = new UpdateProbationPractitionerPduView(presenter, deliusDeliveryUnits)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerPdu(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const form = await new UpdateProbationPractitionerPduForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppPdu !== '') {
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
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerPduPresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ndeliusPDU,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body,
        deliusDeliveryUnits
      )
      const view = new UpdateProbationPractitionerPduView(presenter, deliusDeliveryUnits)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewUpdateProbationPractitionerOffice(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusOfficeLocation = await this.referenceDataService.getProbationOffices()
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new UpdateProbationPractitionerOfficePresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppProbationOffice,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails,
      null,
      null,
      deliusOfficeLocation
    )
    const view = new UpdateProbationPractitionerOfficeView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerOffice(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusOfficeLocation = await this.referenceDataService.getProbationOffices()
    const form = await new UpdateProbationPractitionerOfficeForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppProbationOffice !== '') {
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
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerOfficePresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ppProbationOffice,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body,
        deliusOfficeLocation
      )
      const view = new UpdateProbationPractitionerOfficeView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewUpdateProbationPractitionerTeamPhoneNumber(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const amendPPDetails = req.query.amendPPDetails === 'true'

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
      referral.id,
      referral.serviceUser.crn,
      referral.ppTeamPhoneNumber || referral.ndeliusTeamPhoneNumber,
      referral.serviceUser.firstName,
      referral.serviceUser.lastName,
      amendPPDetails
    )
    const view = new UpdateProbationPractitionerTeamPhoneNumberView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateProbationPractitionerTeamPhoneNumber(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const form = await new UpdateProbationPractitionerTeamPhoneNumberForm(req).data()

    let error: FormValidationError | null = null

    if (!form.error) {
      if (form.paramsForUpdate.ppTeamPhoneNumber !== '') {
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
      }
    } else {
      error = form.error
    }

    const amendPPDetails = req.query.amendPPDetails === 'true'

    if (error === null && amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/check-all-referral-information`)
    } else if (error === null && !amendPPDetails) {
      res.redirect(`/referrals/${req.params.id}/confirm-probation-practitioner-details`)
    } else {
      const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

      const presenter = new UpdateProbationPractitionerTeamPhoneNumberPresenter(
        referral.id,
        referral.serviceUser.crn,
        form.paramsForUpdate?.ndeliusTeamPhoneNumber,
        referral.serviceUser.firstName,
        referral.serviceUser.lastName,
        amendPPDetails,
        error,
        req.body
      )
      const view = new UpdateProbationPractitionerTeamPhoneNumberView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async confirmMainPointOfContactDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)

    const presenter = new ConfirmMainPointOfContactDetailsPresenter(
      referral,
      prisonAndSecureChildAgency,
      deliusOfficeLocations,
      deliusDeliveryUnits,
      deliusResponsibleOfficer
    )
    const view = new ConfirmMainPointOfContactDetailsView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateMainPointOfContactDetails(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const deliusResponsibleOfficer = await this.ramDeliusApiService.getResponsibleOfficer(referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()
    const deliusDeliveryUnits = await this.referenceDataService.getProbationDeliveryUnits()
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )
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
        prisonAndSecureChildAgency,
        deliusOfficeLocations,
        deliusDeliveryUnits,
        deliusResponsibleOfficer,
        error,
        req.body
      )
      const view = new ConfirmMainPointOfContactDetailsView(presenter)

      res.status(400)
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async viewRiskInformation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getDraftReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.serviceUser.crn)
    await this.displayOasysRiskInformationPage(req, res, referral, serviceUser)
  }

  private updateRiskSummary(
    editedOasysRiskInformation: DraftOasysRiskInformation,
    riskSummary: RiskSummary | null
  ): RiskSummary | null {
    return riskSummary
      ? {
          ...riskSummary,
          summary: {
            whoIsAtRisk: editedOasysRiskInformation.riskSummaryWhoIsAtRisk,
            natureOfRisk: editedOasysRiskInformation.riskSummaryNatureOfRisk,
            riskImminence: editedOasysRiskInformation.riskSummaryRiskImminence,
            riskInCommunity: riskSummary.summary.riskInCommunity,
          },
          riskToSelf: {
            suicide: {
              risk: riskSummary.riskToSelf.suicide?.risk ?? null,
              current: riskSummary.riskToSelf.suicide?.current ?? null,
              currentConcernsText: editedOasysRiskInformation.riskToSelfSuicide,
            },
            selfHarm: {
              risk: riskSummary.riskToSelf.selfHarm?.risk ?? null,
              current: riskSummary.riskToSelf.selfHarm?.current ?? null,
              currentConcernsText: editedOasysRiskInformation.riskToSelfSelfHarm,
            },
            hostelSetting: {
              risk: riskSummary.riskToSelf.hostelSetting?.risk ?? null,
              current: riskSummary.riskToSelf.hostelSetting?.current ?? null,
              currentConcernsText: editedOasysRiskInformation.riskToSelfHostelSetting,
            },
            vulnerability: {
              risk: riskSummary.riskToSelf.vulnerability?.risk ?? null,
              current: riskSummary.riskToSelf.vulnerability?.current ?? null,
              currentConcernsText: editedOasysRiskInformation.riskToSelfVulnerability,
            },
          },
        }
      : null
  }

  private async displayOasysRiskInformationPage(
    req: Request,
    res: Response,
    referral: DraftReferral,
    serviceUser: DeliusServiceUser,
    error: FormValidationError | null = null
  ) {
    const { accessToken } = res.locals.user.token
    const label = `${referral.serviceUser?.firstName} ${referral.serviceUser?.lastName} (CRN: ${referral.serviceUser?.crn})`
    const editedOasysRiskInformation = await this.getDraftOasysRiskInformation(accessToken, referral.id)
    const riskSummary = await this.assessRisksAndNeedsService.getRiskSummary(referral.serviceUser.crn, accessToken)
    const updatedRiskSummary = editedOasysRiskInformation
      ? this.updateRiskSummary(editedOasysRiskInformation, riskSummary)
      : riskSummary
    const presenter = new OasysRiskInformationPresenter(referral.id, updatedRiskSummary, error, label)
    const view = new OasysRiskInformationView(presenter)
    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
        const editedOasysRiskInformation = await this.getDraftOasysRiskInformation(accessToken, referral.id)
        const oasysRiskSummaryView = new OasysRiskSummaryView(riskSummary)
        const draftOasysRiskInformation: DraftOasysRiskInformation = {
          riskSummaryWhoIsAtRisk:
            editedOasysRiskInformation?.riskSummaryWhoIsAtRisk ??
            oasysRiskSummaryView.oasysRiskInformationArgs.summary.whoIsAtRisk.text,
          riskSummaryNatureOfRisk:
            editedOasysRiskInformation?.riskSummaryNatureOfRisk ??
            oasysRiskSummaryView.oasysRiskInformationArgs.summary.natureOfRisk.text,
          riskSummaryRiskImminence:
            editedOasysRiskInformation?.riskSummaryRiskImminence ??
            oasysRiskSummaryView.oasysRiskInformationArgs.summary.riskImminence.text,
          riskToSelfSuicide:
            editedOasysRiskInformation?.riskToSelfSuicide ??
            oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.suicide.text,
          riskToSelfSelfHarm:
            editedOasysRiskInformation?.riskToSelfSelfHarm ??
            oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.selfHarm.text,
          riskToSelfHostelSetting:
            editedOasysRiskInformation?.riskToSelfHostelSetting ??
            oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.hostelSetting.text,
          riskToSelfVulnerability:
            editedOasysRiskInformation?.riskToSelfVulnerability ??
            oasysRiskSummaryView.oasysRiskInformationArgs.riskToSelf.vulnerability.text,
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
      await this.displayOasysRiskInformationPage(req, res, referral, serviceUser, confirmEditRiskForm.error)
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
      await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
    }
  }

  async checkAllReferralInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const referral = await this.interventionsService.getDraftReferral(accessToken, req.params.id)
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )
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
      res.locals.user,
      caseConviction.conviction,
      caseConviction.caseDetail,
      prisonAndSecureChildAgency,
      editedOasysRiskInformation
    )
    const view = new CheckAllReferralInformationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, caseConviction.caseDetail, 'probation-practitioner')
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

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async viewConfirmation(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getSentReferral(res.locals.user.token.accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    const presenter = new ConfirmationPresenter(referral, res.locals.user)
    const view = new ConfirmationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
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
