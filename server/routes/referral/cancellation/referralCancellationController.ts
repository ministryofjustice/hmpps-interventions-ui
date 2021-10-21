import { Request, Response } from 'express'
import DraftCancellationData from './draftCancellationData'
import ControllerUtils from '../../../utils/controllerUtils'
import ReferralCancellationReasonForm from './reason/referralCancellationReasonForm'
import { FormValidationError } from '../../../utils/formValidationError'
import ReferralCancellationReasonPresenter from './reason/referralCancellationReasonPresenter'
import ReferralCancellationReasonView from './reason/referralCancellationReasonView'
import ReferralCancellationCheckAnswersPresenter from './checkAnswers/referralCancellationCheckAnswersPresenter'
import ReferralCancellationCheckAnswersView from './checkAnswers/referralCancellationCheckAnswersView'
import ReferralCancellationConfirmationPresenter from './confirmation/referralCancellationConfirmationPresenter'
import ReferralCancellationConfirmationView from './confirmation/referralCancellationConfirmationView'
import InterventionsService from '../../../services/interventionsService'
import CommunityApiService from '../../../services/communityApiService'
import HmppsAuthService from '../../../services/hmppsAuthService'
import AssessRisksAndNeedsService from '../../../services/assessRisksAndNeedsService'
import DraftsService from '../../../services/draftsService'

export default class ReferralCancellationController {
  constructor(
    private readonly interventionsService: InterventionsService,
    private readonly communityApiService: CommunityApiService,
    private readonly hmppsAuthService: HmppsAuthService,
    private readonly assessRisksAndNeedsService: AssessRisksAndNeedsService,
    private readonly draftsService: DraftsService
  ) {}

  async startCancellation(req: Request, res: Response): Promise<void> {
    const draftCancellation = await this.draftsService.createDraft<DraftCancellationData>(
      'cancellation',
      {
        cancellationReason: null,
        cancellationComments: null,
      },
      { userId: res.locals.user.userId }
    )
    res.redirect(`/probation-practitioner/referrals/${req.params.id}/cancellation/${draftCancellation.id}/reason`)
  }

  async editCancellationReason(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const data = await new ReferralCancellationReasonForm(req).data()

    let formError: FormValidationError | null = null

    if (req.method === 'POST') {
      if (!data.error) {
        await this.draftsService.updateDraft<DraftCancellationData>(draftCancellation.id, data.paramsForUpdate, {
          userId: res.locals.user.userId,
        })

        res.redirect(
          `/probation-practitioner/referrals/${referralId}/cancellation/${draftCancellation.id}/check-your-answers`
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
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)
    const cancellationReasons = await this.interventionsService.getReferralCancellationReasons(accessToken)

    const presenter = new ReferralCancellationReasonPresenter(
      draftCancellation,
      sentReferral,
      intervention,
      serviceUser,
      cancellationReasons,
      formError
    )
    const view = new ReferralCancellationReasonView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async cancellationCheckAnswers(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralCancellationCheckAnswersPresenter(req.params.id, draftCancellation.id)
    const view = new ReferralCancellationCheckAnswersView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  async submitCancellation(req: Request, res: Response): Promise<void> {
    const fetchResult = await this.fetchDraftCancellationOrRenderMessage(req, res)
    if (fetchResult.rendered) {
      return
    }
    const draftCancellation = fetchResult.draft

    const { cancellationReason, cancellationComments } = draftCancellation.data

    if (cancellationReason === null) {
      throw new Error('Got unexpectedly null cancellationReason')
    }
    if (cancellationComments === null) {
      throw new Error('Got unexpectedly null cancellationComments')
    }

    const { user } = res.locals
    const { accessToken } = user.token
    const referralId = req.params.id

    await this.interventionsService.endReferral(accessToken, referralId, cancellationReason, cancellationComments)
    await this.draftsService.deleteDraft(draftCancellation.id, { userId: res.locals.user.userId })

    res.redirect(`/probation-practitioner/referrals/${referralId}/cancellation/confirmation`)
  }

  async showCancellationConfirmationPage(req: Request, res: Response): Promise<void> {
    const { user } = res.locals
    const { accessToken } = user.token

    const sentReferral = await this.interventionsService.getSentReferral(accessToken, req.params.id)
    const intervention = await this.interventionsService.getIntervention(
      accessToken,
      sentReferral.referral.interventionId
    )
    const serviceUser = await this.communityApiService.getServiceUserByCRN(sentReferral.referral.serviceUser.crn)

    const presenter = new ReferralCancellationConfirmationPresenter(sentReferral, intervention)
    const view = new ReferralCancellationConfirmationView(presenter)

    ControllerUtils.renderWithLayout(res, view, serviceUser)
  }

  private async fetchDraftCancellationOrRenderMessage(req: Request, res: Response) {
    return ControllerUtils.fetchDraftOrRenderMessage<DraftCancellationData>(req, res, this.draftsService, {
      idParamName: 'draftCancellationId',
      notFoundUserMessage:
        'Too much time has passed since you started cancelling this referral. Your answers have not been saved, and you will need to start again.',
      typeName: 'cancellation',
    })
  }
}
