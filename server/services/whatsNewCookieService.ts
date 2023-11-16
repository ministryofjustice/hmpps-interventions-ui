import { Request, Response } from 'express'

export default class WhatsNewCookieService {
  COOKIE_NAME = 'whats-new-banner'

  public persistDismissedVersion = (res: Response, version: number) => {
    const oneYear = 52 * 24 * 3600000
    return res.cookie(this.COOKIE_NAME, version, { maxAge: oneYear, httpOnly: true })
  }

  public getDismissedVersion = (req: Request): number => Number(req.cookies[this.COOKIE_NAME])
}
