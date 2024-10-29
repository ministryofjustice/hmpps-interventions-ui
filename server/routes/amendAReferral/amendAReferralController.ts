import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import AmendMaximumEnforceableDaysPresenter from './maximumEnforceableDays/amendMaximumEnforceableDaysPresenter'
import RamDeliusApiService from '../../services/ramDeliusApiService'
import AmendMaximumEnforceableDaysView from './maximumEnforceableDays/amendMaximumEnforceableDaysView'
import AmendMaximumEnforceableDaysForm from './maximumEnforceableDays/amendMaximumEnforceableDaysForm'
import AmendAccessibilityNeedsForm from './accessibility-needs/amendAccessibilityNeedsForm'
import AmendAccessibilityNeedsView from './accessibility-needs/amendAccessibilityNeedsView'
import AmendAccessibilityNeedsPresenter from './accessibility-needs/amendAccessibilityNeedsPresenter'
import AmendDesiredOutcomesView from './desired-outcomes/amendDesiredOutcomesView'
import AmendDesiredOutcomesPresenter from './desired-outcomes/amendDesiredOutcomesPresenter'
import AmendDesiredOutcomesForm from './desired-outcomes/amendDesiredOutcomesForm'
import ReferralDesiredOutcomes from '../../models/referralDesiredOutcomes'
import { FormValidationError } from '../../utils/formValidationError'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import AmendComplexityLevelPresenter from './complexityLevel/amendComplexityLevelPresenter'
import AmendComplexityLevelView from './complexityLevel/amendComplexityLevelView'
import AmendComplexityLevelForm from './complexityLevel/amendComplexityLevelForm'
import IntepreterRequiredPresenter from './interpreter-required/intepreterRequiredPresenter'
import IntepreterRequiredView from './interpreter-required/intepreterRequiredView'
import { NeedsAndRequirementsType } from '../../models/needsAndRequirementsType'
import AmendNeedsAndRequirementsIntepreterForm from './interpreter-required/amendNeedsAndRequirementsIntepreterForm'
import AmendAdditionalInformationPresenter from './additionalInformation/amendAdditionalInformationPresenter'
import AmendAdditionalInformationView from './additionalInformation/amendAdditionalInformationView'
import AmendAdditionalInformationForm from './additionalInformation/amendAdditionalInformationForm'
import AmendEmploymentResponsibilitiesPresenter from './employment-responsibilities/amendEmploymentResponsibilitiesPresenter'
import AmendEmploymentResponsibilitiesView from './employment-responsibilities/amendEmploymentResponsibilitiesView'
import AmendEmploymentResponsibilitiesForm from './employment-responsibilities/amendEmploymentResponsibilitiesForm'
import AmendReasonForReferralPresenter from './reason-for-referral/amendReasonForReferralPresenter'
import AmendReasonForReferralView from './reason-for-referral/amendReasonForReferralView'
import AmendReasonForReferralForm from './reason-for-referral/amendReasonForReferralForm'
import AmendPrisonEstablishmentForm from './amend-prison-establishment/amendPrisonEstablishmentForm'
import AmendPrisonEstablishmentPresenter from './amend-prison-establishment/amendPrisonEstablishmentPresenter'
import AmendPrisonEstablishmentView from './amend-prison-establishment/amendPrisonEstablishmentView'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import AmendExpectedReleaseDateForm from './amend-expected-release-date/amendExpectedReleaseDateForm'
import AmendExpectedReleaseDatePresenter from './amend-expected-release-date/amendExpectedReleaseDatePresenter'
import AmendExpectedReleaseDateView from './amend-expected-release-date/amendExpectedReleaseDateView'
import ConfirmAmendProbationOfficePresenter from './amend-probation-office/confirmAmendProbationOfficePresenter'
import ConfirmAmendProbationOfficeView from './amend-probation-office/confirmAmendProbationOfficeView'
import ReferenceDataService from '../../services/referenceDataService'
import AmendProbationOfficePresenter from './amend-probation-office/amendProbationOfficePresenter'
import AmendProbationOfficeView from './amend-probation-office/amendProbationOfficeView'
import AmendProbationOfficeForm from './amend-probation-office/amendProbationOfficeForm'
import { CurrentLocationType } from '../../models/draftReferral'
import AmendProbationPractitionerNameForm from './amend-probation-practitioner-name/amendProbationPractitionerNameForm'
import AmendProbationPractitionerNamePresenter from './amend-probation-practitioner-name/amendProbationPractitionerNamePresenter'
import AmendProbationPractitionerNameView from './amend-probation-practitioner-name/amendProbationPractitionerNameView'
import AmendProbationPractitionerEmailForm from './amend-probation-practitioner-email/amendProbationPractitionerEmailForm'
import AmendProbationPractitionerEmailPresenter from './amend-probation-practitioner-email/amendProbationPractitionerEmailPresenter'
import AmendProbationPractitionerEmailView from './amend-probation-practitioner-email/amendProbationPractitionerEmailView'
import AmendProbationPractitionerPhoneNumberForm from './amend-probation-practitioner-phone-number/amendProbationPractitionerPhoneNumberForm'
import AmendProbationPractitionerPhoneNumberPresenter from './amend-probation-practitioner-phone-number/amendProbationPractitionerPhoneNumberPresenter'
import AmendProbationPractitionerPhoneNumberView from './amend-probation-practitioner-phone-number/amendProbationPractitionerPhoneNumberView'

export default class AmendAReferralController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
    private readonly prisonAndSecureChildAgencyService: PrisonAndSecuredChildAgencyService,
    private readonly referenceDataService: ReferenceDataService
  ) {}

  async confirmAmendExpectedProbationOffice(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id: referralId } = req.params

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const referralWithoutCom = referral.referral.isReferralReleasingIn12Weeks
    const presenter = new ConfirmAmendProbationOfficePresenter(
      referral.id,
      'amend-expected-probation-office',
      referralWithoutCom,
      referral.referral.serviceUser.firstName,
      referral.referral.serviceUser.lastName,
      referral.referral.ppPdu ?? referral.referral.ndeliusPDU
    )
    const view = new ConfirmAmendProbationOfficeView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendExpectedProbationOffice(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params
    let error: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, id)

    if (req.method === 'POST') {
      const form = await AmendProbationOfficeForm.createForm(req)

      const isInCustodyWithCom =
        sentReferral.referral.personCurrentLocationType === CurrentLocationType.custody &&
        sentReferral.referral.isReferralReleasingIn12Weeks === null

      if (!form.error) {
        try {
          await this.interventionsService.updateExpectedProbationOffice(
            res.locals.user.token.accessToken,
            req.params.id,
            form.paramsForUpdate
          )
          if (isInCustodyWithCom) {
            await this.interventionsService.updateProbationPractitionerProbationOffice(
              res.locals.user.token.accessToken,
              req.params.id,
              form.paramsForUpdate,
              true
            )
          }
          return res.redirect(`/probation-practitioner/referrals/${id}/details?detailsUpdated=true`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          error = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
      error = form.error
      res.status(400)
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()

    const presenter = new AmendProbationOfficePresenter(
      sentReferral,
      deliusOfficeLocations,
      error,
      null,
      'expectedProbationOffice'
    )
    const view = new AmendProbationOfficeView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async confirmAmendProbationPractitionerProbationOffice(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id: referralId } = req.params

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const referralWithoutCom = referral.referral.isReferralReleasingIn12Weeks
    const presenter = new ConfirmAmendProbationOfficePresenter(
      referral.id,
      'amend-pp-probation-office',
      referralWithoutCom,
      referral.referral.serviceUser.firstName,
      referral.referral.serviceUser.lastName,
      referral.referral.ppPdu ?? referral.referral.ndeliusPDU
    )
    const view = new ConfirmAmendProbationOfficeView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendProbationPractitionerProbationOffice(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id } = req.params
    let error: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, id)

    if (req.method === 'POST') {
      const form = await AmendProbationOfficeForm.createForm(req)

      const isInCustodyWithCom =
        sentReferral.referral.personCurrentLocationType === CurrentLocationType.custody &&
        sentReferral.referral.isReferralReleasingIn12Weeks === null

      if (!form.error) {
        try {
          await this.interventionsService.updateProbationPractitionerProbationOffice(
            res.locals.user.token.accessToken,
            req.params.id,
            form.paramsForUpdate
          )
          if (isInCustodyWithCom) {
            await this.interventionsService.updateExpectedProbationOffice(
              res.locals.user.token.accessToken,
              req.params.id,
              form.paramsForUpdate,
              true
            )
          }
          return res.redirect(`/probation-practitioner/referrals/${id}/details?detailsUpdated=true`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          error = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
      error = form.error
      res.status(400)
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
    const deliusOfficeLocations = await this.referenceDataService.getProbationOffices()

    const presenter = new AmendProbationOfficePresenter(
      sentReferral,
      deliusOfficeLocations,
      error,
      null,
      'expectedProbationOffice'
    )
    const view = new AmendProbationOfficeView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateMaximumEnforceableDays(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { id: referralId } = req.params
    let error = null
    let userInputData = null

    if (req.method === 'POST') {
      const formData = await new AmendMaximumEnforceableDaysForm(req).data()

      if (!formData.error) {
        await this.interventionsService.updateSentReferralDetails(accessToken, referralId, formData.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${req.params.id}/details?detailsUpdated=true`)
      }

      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const presenter = new AmendMaximumEnforceableDaysPresenter(
      referral.id,
      referral.referral.maximumEnforceableDays,
      referral.referral.serviceUser.firstName,
      referral.referral.serviceUser.lastName,
      referral.referral.serviceUser.crn,
      error,
      userInputData
    )
    const view = new AmendMaximumEnforceableDaysView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateAdditionalInformation(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error = null
    let userInputData = null
    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)

    if (req.method === 'POST') {
      req.body.additionalNeedsInformation = referral.referral.additionalNeedsInformation

      const formData = await new AmendAdditionalInformationForm(req).data()

      if (!formData.error && !formData.paramsForUpdate?.changesMade) {
        return res.redirect(`${req.baseUrl}${req.path}?noChanges=true`)
      }

      if (!formData.error) {
        await this.interventionsService.amendAdditionalInformation(accessToken, referralId, formData.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      delete req.query.noChanges
      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const presenter = new AmendAdditionalInformationPresenter(
      referral,
      referral.referral.additionalNeedsInformation,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new AmendAdditionalInformationView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateDesiredOutcomes(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId, serviceCategoryId } = req.params
    let error = null
    let userInputData = null

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      req.body.origOutcomes = referral.referral.desiredOutcomes.find(
        (val: ReferralDesiredOutcomes) => val.serviceCategoryId === serviceCategoryId
      )?.desiredOutcomesIds
      const formData = await new AmendDesiredOutcomesForm(req).data()

      if (!formData.error && !formData.paramsForUpdate?.changesMade) {
        return res.redirect(`${req.baseUrl}${req.path}?noChanges=true`)
      }

      if (!formData.error) {
        await this.interventionsService.updateDesiredOutcomesForServiceCategory(
          accessToken,
          referralId,
          serviceCategoryId,
          formData.paramsForUpdate
        )
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      delete req.query.noChanges
      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const serviceCategory = await this.interventionsService.getServiceCategory(accessToken, serviceCategoryId)
    const presenter = new AmendDesiredOutcomesPresenter(
      referral,
      serviceCategory,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new AmendDesiredOutcomesView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendAccessibilityNeeds(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error = null
    let userInputData = null

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      req.body.origOutcomes = referral.referral.accessibilityNeeds
      const formData = await new AmendAccessibilityNeedsForm(req).data()

      if (!formData.error && !formData.paramsForUpdate?.changesMade) {
        return res.redirect(`${req.baseUrl}${req.path}?noChanges=true`)
      }

      if (!formData.error) {
        await this.interventionsService.updateAccessibilityNeeds(accessToken, referralId, formData.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      delete req.query.noChanges
      error = formData.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const presenter = new AmendAccessibilityNeedsPresenter(
      referral,
      serviceUser,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new AmendAccessibilityNeedsView(presenter)
    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateComplexityLevel(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId, serviceCategoryId } = req.params
    let formError: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      const data = await new AmendComplexityLevelForm(req).data()

      if (data.error) {
        res.status(400)
        formError = data.error
      } else {
        try {
          await this.interventionsService.amendComplexityLevelForServiceCategory(
            accessToken,
            referralId,
            serviceCategoryId,
            data.paramsForUpdate
          )
          return res.redirect(`/probation-practitioner/referrals/${req.params.referralId}/details?detailsUpdated=true`)
        } catch (e) {
          const interventionsServiceError = e as InterventionsServiceError
          formError = createFormValidationErrorOrRethrow(interventionsServiceError)
        }
      }
    }

    const [serviceCategory, serviceUser] = await Promise.all([
      this.interventionsService.getServiceCategory(accessToken, serviceCategoryId),
      this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AmendComplexityLevelPresenter(
      sentReferral,
      sentReferral.referral.complexityLevels,
      serviceCategory,
      formError
    )
    const view = new AmendComplexityLevelView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateInterpreterNeeds(req: Request, res: Response): Promise<void> {
    const { referralId } = req.params
    const { accessToken } = res.locals.user.token
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
    let error = null
    let userInputData = null

    if (req.method === 'POST') {
      req.body.originalInterpreterNeeds = {
        intepreterLanguage: sentReferral.referral.interpreterLanguage,
        intepreterNeeded: sentReferral.referral.needsInterpreter ? 'yes' : 'no',
      }
      if (req.body['needs-interpreter'] === 'no') {
        req.body['interpreter-language'] = ''
      }
      const formData = await new AmendNeedsAndRequirementsIntepreterForm(req).data()
      if (!formData.error && !formData.paramsForUpdate?.changesMade) {
        return res.redirect(`${req.baseUrl}${req.path}?noChanges=true`)
      }

      if (!formData.error) {
        await this.interventionsService.updateNeedsAndRequirments(
          accessToken,
          sentReferral,
          NeedsAndRequirementsType.interpreterRequired,
          {
            reasonForChange: formData.paramsForUpdate.reasonForChange!,
            needsInterpreter: formData.paramsForUpdate.needsInterpreter,
            interpreterLanguage: formData.paramsForUpdate.interpreterLanguage,
          }
        )
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      delete req.query.noChanges
      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const presenter = new IntepreterRequiredPresenter(
      sentReferral,
      serviceUser,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new IntepreterRequiredView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async updateEmploymentResponsibilities(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error = null
    let userInputData = null
    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      req.body.originalEmploymentResponsibilities = {
        hasAdditionalResponsibilities: sentReferral.referral.hasAdditionalResponsibilities ? 'yes' : 'no',
        whenUnavailable: sentReferral.referral.whenUnavailable,
      }

      if (req.body['has-additional-responsibilities'] === 'no') {
        req.body['when-unavailable'] = null
      }

      const formData = await new AmendEmploymentResponsibilitiesForm(req).data()
      if (!formData.error && !formData.paramsForUpdate?.changesMade) {
        return res.redirect(`${req.baseUrl}${req.path}?noChanges=true`)
      }

      if (!formData.error) {
        await this.interventionsService.updateEmploymentResponsibilities(
          accessToken,
          referralId,
          formData.paramsForUpdate
        )
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }
      delete req.query.noChanges
      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(referral.referral.serviceUser.crn)
    const presenter = new AmendEmploymentResponsibilitiesPresenter(
      referral,
      serviceUser,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new AmendEmploymentResponsibilitiesView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendReasonForReferral(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error: FormValidationError | null = null
    let userInputData = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      const form = await new AmendReasonForReferralForm(req).data()

      if (!form.error) {
        await this.interventionsService.updateSentReferralDetails(accessToken, referralId, form.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendReasonForReferralPresenter(sentReferral, error, userInputData)
    const view = new AmendReasonForReferralView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendPrisonEstablishment(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error: FormValidationError | null = null
    let userInputData = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const prisonAndSecureChildAgency = await this.prisonAndSecureChildAgencyService.getPrisonsAndSecureChildAgencies(
      res.locals.user.token.accessToken
    )

    if (req.method === 'POST') {
      const form = await new AmendPrisonEstablishmentForm(
        req,
        prisonAndSecureChildAgency,
        sentReferral.referral.personCustodyPrisonId
      ).data()

      if (!form.error) {
        await this.interventionsService.updatePrisonEstablishment(accessToken, referralId, form.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendPrisonEstablishmentPresenter(
      sentReferral,
      prisonAndSecureChildAgency,
      error,
      userInputData
    )
    const view = new AmendPrisonEstablishmentView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendExpectedReleaseDate(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let userInputData = null
    let error: FormValidationError | null = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    if (req.method === 'POST') {
      const form = await new AmendExpectedReleaseDateForm(
        req,
        sentReferral.referral.expectedReleaseDate,
        sentReferral.referral.expectedReleaseDateMissingReason
      ).data()

      if (!form.error) {
        await this.interventionsService.updateExpectedReleaseDate(accessToken, referralId, form.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendExpectedReleaseDatePresenter(sentReferral, error, userInputData)
    const view = new AmendExpectedReleaseDateView(presenter, req)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendProbationPractitionerName(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error: FormValidationError | null = null
    let userInputData = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    const beforePpName: string =
      (sentReferral.referral && sentReferral.referral.ppName) || sentReferral.referral.ndeliusPPName || 'Invalid User'

    if (req.method === 'POST') {
      const form = await new AmendProbationPractitionerNameForm(req, beforePpName).data()

      if (!form.error) {
        await this.interventionsService.updateProbationPractitionerName(accessToken, referralId, form.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendProbationPractitionerNamePresenter(sentReferral, error, userInputData)
    const view = new AmendProbationPractitionerNameView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendProbationPractitionerEmail(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error: FormValidationError | null = null
    let userInputData = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    const beforePpEmailAddress: string =
      (sentReferral.referral && sentReferral.referral.ppEmailAddress) ||
      sentReferral.referral.ndeliusPPEmailAddress ||
      'Invalid Email'

    if (req.method === 'POST') {
      const form = await new AmendProbationPractitionerEmailForm(req, beforePpEmailAddress).data()

      if (!form.error) {
        await this.interventionsService.updateProbationPractitionerEmail(accessToken, referralId, form.paramsForUpdate)
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendProbationPractitionerEmailPresenter(sentReferral, error, userInputData)
    const view = new AmendProbationPractitionerEmailView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async amendProbationPractitionerPhoneNumber(req: Request, res: Response): Promise<void> {
    const { accessToken } = res.locals.user.token
    const { referralId } = req.params
    let error: FormValidationError | null = null
    let userInputData = null

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)

    const beforePpPhoneNumber: string =
      (sentReferral.referral && sentReferral.referral.ppPhoneNumber) ||
      sentReferral.referral.ndeliusPhoneNumber ||
      'Invalid Phone Number'

    if (req.method === 'POST') {
      const form = await new AmendProbationPractitionerPhoneNumberForm(req, beforePpPhoneNumber).data()

      if (!form.error) {
        await this.interventionsService.updateProbationPractitionerPhoneNumber(
          accessToken,
          referralId,
          form.paramsForUpdate
        )
        return res.redirect(`/probation-practitioner/referrals/${referralId}/details?detailsUpdated=true`)
      }

      error = form.error
      userInputData = req.body
      res.status(400)
    }
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new AmendProbationPractitionerPhoneNumberPresenter(sentReferral, error, userInputData)
    const view = new AmendProbationPractitionerPhoneNumberView(presenter)

    return ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }
}
