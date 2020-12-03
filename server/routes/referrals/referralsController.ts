import { Request, Response } from 'express'
import InterventionsService from '../../services/interventionsService'

export default class ReferralsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  async startReferral(req: Request, res: Response): Promise<void> {
    res.render('referrals/start')
  }

  async createReferral(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.createReferral()

    res.redirect(303, `/referrals/${referral.id}/form`)
  }

  async viewReferralForm(req: Request, res: Response): Promise<void> {
    const referral = await this.interventionsService.getReferral(req.params.id)

    res.render('referrals/form', { referral })
  }
}
