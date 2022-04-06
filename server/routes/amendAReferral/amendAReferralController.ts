import { Request, Response } from 'express'
import ControllerUtils from '../../utils/controllerUtils'
import InterventionsService from '../../services/interventionsService'
import AmendMaximumEnforceableDaysPresenter from './maximumEnforceableDays/amendMaximumEnforceableDaysPresenter'
import CommunityApiService from '../../services/communityApiService'
import AmendMaximumEnforceableDaysView from './maximumEnforceableDays/amendMaximumEnforceableDaysView'
import AmendMaximumEnforceableDaysForm from './maximumEnforceableDays/amendMaximumEnforceableDaysForm'

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
        return res.redirect(`/probation-practitioner/referrals/${req.params.id}/details`)
      }

      error = formData.error
      userInputData = req.body
      res.status(400)
    }

    const referral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(referral.referral.serviceUser.crn)
    const presenter = new AmendMaximumEnforceableDaysPresenter(
      referral.referral.maximumEnforceableDays,
      error,
      userInputData
    )
    const view = new AmendMaximumEnforceableDaysView(presenter)
    return ControllerUtils.renderWithLayout(res, view, serviceUser)
  }
}
