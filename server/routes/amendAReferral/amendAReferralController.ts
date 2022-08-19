import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionsService, { InterventionsServiceError } from '../../services/interventionsService'
import AmendMaximumEnforceableDaysPresenter from './maximumEnforceableDays/amendMaximumEnforceableDaysPresenter'
import CommunityApiService from '../../services/communityApiService'
import AmendMaximumEnforceableDaysView from './maximumEnforceableDays/amendMaximumEnforceableDaysView'
import AmendMaximumEnforceableDaysForm from './maximumEnforceableDays/amendMaximumEnforceableDaysForm'
import AmendDesiredOutcomesView from './desired-outcomes/amendDesiredOutcomesView'
import AmendDesiredOutcomesPresenter from './desired-outcomes/amendDesiredOutcomesPresenter'
import AmendDesiredOutcomesForm from './desired-outcomes/amendDesiredOutcomesForm'
import ReferralDesiredOutcomes from '../../models/referralDesiredOutcomes'
import { FormValidationError } from '../../utils/formValidationError'
import createFormValidationErrorOrRethrow from '../../utils/interventionsFormError'
import AmendComplexityLevelPresenter from './complexityLevel/amendComplexityLevelPresenter'
import AmendComplexityLevelView from './complexityLevel/amendComplexityLevelView'
import AmendComplexityLevelForm from './complexityLevel/amendComplexityLevelForm'

export default class AmendAReferralController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService
  ) {}

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
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const presenter = new AmendMaximumEnforceableDaysPresenter(
      referral.id,
      referral.referral.maximumEnforceableDays,
      error,
      userInputData
    )
    const view = new AmendMaximumEnforceableDaysView(presenter)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
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

    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const serviceCategory = await this.interventionsService.getServiceCategory(accessToken, serviceCategoryId)
    const presenter = new AmendDesiredOutcomesPresenter(
      referral,
      serviceCategory,
      error,
      userInputData,
      req.query.noChanges === 'true'
    )
    const view = new AmendDesiredOutcomesView(presenter)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
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
      this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn),
    ])

    const presenter = new AmendComplexityLevelPresenter(
      sentReferral,
      sentReferral.referral.complexityLevels,
      serviceCategory,
      formError
    )
    const view = new AmendComplexityLevelView(presenter)

    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
