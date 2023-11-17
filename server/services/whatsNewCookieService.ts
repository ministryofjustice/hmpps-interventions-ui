import { Request, Response } from 'express'

export default class WhatsNewCookieService {
  static COOKIE_NAME = 'whats-new-banner'

  static persistDismissedVersion = (res: Response, version: number) => {
    const oneYear = 52 * 24 * 3600000
    return res.cookie(this.COOKIE_NAME, version, { maxAge: oneYear, httpOnly: true })
  }

  static getDismissedVersion = (req: Request): number => Number(req.cookies[this.COOKIE_NAME])
}
