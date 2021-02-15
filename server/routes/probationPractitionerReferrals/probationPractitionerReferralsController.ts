import { Request, Response } from 'express'

export default class ProbationPractitionerReferralsController {
  async showDashboard(req: Request, res: Response): Promise<void> {
    res.render('probationPractitionerReferrals/dashboard')
  }
}
