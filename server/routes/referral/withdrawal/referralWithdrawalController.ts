import { Request, Response } from 'express'
import DraftWithdrawalData from './draftWithdrawalData'
import ControllerUtils from '../../../utils/controllerUtils'
import ReferralWithdrawalReasonForm from './reason/referralWithdrawalReasonForm'
import { FormValidationError } from '../../../utils/formValidationError'
import InterventionsService from '../../../services/interventionsService'
import HmppsAuthService from '../../../services/hmppsAuthService'
import AssessRisksAndNeedsService from '../../../services/assessRisksAndNeedsService'
import DraftsService from '../../../services/draftsService'
import RamDeliusApiService from '../../../services/ramDeliusApiService'
import ReferralWithdrawalReasonPresenter from './reason/referralWithdrawlReasonPresenter'
import ReferralWithdrawalReasonView from './reason/referralWithdrawalReasonView'
import ReferralWithdrawalConfirmationPresenter from './confirmation/referralWithdrawalConfirmationPresenter'
import ReferralWithdrawalConfirmationView from './confirmation/referralWithdrawalConfirmationView'
import ReferralWithdrawalCheckAnswersPresenter from './checkAnswers/referralWithdrawalCheckAnswersPresenter'
import ReferralWithdrawalCheckAnswersView from './checkAnswers/referralWithdrawalCheckAnswersView'

export default class ReferralWithdrawalController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly ramDeliusApiService: RamDeliusApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly draftsService: DraftsService
  ) {}

  async startWithdrawal(req: Request, res: Response): Promise<void> {
    const draftWithdrawal = await this.draftsService.createDraft<DraftWithdrawalData>(
      'withdrawal',
      {
        withdrawalReason: null,
        withdrawalComments: null,
      },
      { userId: res.locals.user.userId }
    )
    res.redirect(`/probation-practitioner/referrals/${req.params.id}/withdrawal/${draftWithdrawal.id}/reason`)
  }

  async editWithdrawalReason(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const referralId = req.params.id

    const fetchResult = await this.fetchDraftWithdrawalOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftWithdrawal = fetchResult.draft

    const data = await new ReferralWithdrawalReasonForm(req).data()

    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      if (!data.error) {
        await this.draftsService.updateDraft<DraftWithdrawalData>(draftWithdrawal.id, data.paramsForUpdate, {
          userId: res.locals.user.userId,
        })

        res.redirect(
          `/probation-practitioner/referrals/${referralId}/withdrawal/${draftWithdrawal.id}/check-your-answers`
        )
        return
      }

      res.status(400)
      formError = data.error
    }

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, referralId)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)
    const withdrawalReasons = await this.interventionsService.getReferralWithdrawalReasons(accessToken)

    const presenter = new ReferralWithdrawalReasonPresenter(
      draftWithdrawal,
      sentReferral,
      intervention,
      serviceUser,
      withdrawalReasons,
      formError
    )
    const view = new ReferralWithdrawalReasonView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async withdrawalCheckAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const fetchResult = await this.fetchDraftWithdrawalOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftWithdrawal = fetchResult.draft

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralWithdrawalCheckAnswersPresenter(req.params.id, draftWithdrawal.id)
    const view = new ReferralWithdrawalCheckAnswersView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  async submitWithdrawal(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftWithdrawalOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftWithdrawal = fetchResult.draft

    const { withdrawalReason, withdrawalComments } = draftWithdrawal.data

    if (withdrawalReason === null) {
      throw new Error('Got unexpectedly null withdrawalReason')
    }
    if (withdrawalComments === null) {
      throw new Error('Got unexpectedly null withdrawalComments')
    }

    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    await this.interventionsService.endReferral(accessToken, referralId, withdrawalReason, withdrawalComments)
    await this.draftsService.deleteDraft(draftWithdrawal.id, { userId: res.locals.user.userId })

    res.redirect(`/probation-practitioner/referrals/${referralId}/withdrawal/confirmation`)
  }

  async showWithdrawalConfirmationPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.ramDeliusApiService.getCaseDetailsByCrn(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralWithdrawalConfirmationPresenter(
      sentReferral,
      intervention,
      req.session.dashboardOriginPage
    )
    const view = new ReferralWithdrawalConfirmationView(presenter)

    await ControllerUtils.renderWithLayout(req, res, view, serviceUser, 'probation-practitioner')
  }

  private async fetchDraftWithdrawalOrRenderMessage(req: Request, res: Response) {
    const backLink = {
      target: `/probation-practitioner/referrals/${req.params.id}/progress`,
      message: 'go to the referral to withdraw it',
    }
    return ControllerUtils.fetchDraftOrRenderMessage<DraftWithdrawalData>(
      req,
      res,
      this.draftsService,
      'probation-practitioner',
      {
        idParamName: 'draftWithdrawalId',
        notFoundUserMessage:
          'You have not withdrawn this referral. This is because too much time has passed since you started it.',
        typeName: 'withdrawal',
        backLink,
      }
    )
  }
}
