import { Request, Response } from 'express'
import md5 from 'md5'

export default class WhatsNewCookieService {
  static COOKIE_NAME = 'whats-new-banner'

  static key = (id: string) => `${this.COOKIE_NAME}-${md5(id)}`

  static persistDismissedVersion = (res: Response, id: string, version: number) => {
    const oneYear = 52 * 24 * 3600000
    return res.cookie(this.key(id), version, { maxAge: oneYear, httpOnly: true })
  }

  static getDismissedVersion = (req: Request, id: string): number => Number(req.cookies[this.key(id)])
}
