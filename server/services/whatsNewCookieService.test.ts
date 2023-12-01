import { Request, Response } from 'express'
import md5 from 'md5'
import WhatsNewCookieService from './whatsNewCookieService'

describe('WhatsNew cookie', () => {
  let res: Response
  let req: Request

  const id = '123'
  const hashedKey = md5(`whats-new-banner-${id}`)

  beforeEach(() => {
    res = { cookie: jest.fn() } as unknown as Response
    req = { cookies: { [hashedKey]: 1 } } as unknown as Request
  })

  it('should store cookie correctly', () => {
    WhatsNewCookieService.persistDismissedVersion(res, id, 1)
    expect(res.cookie).toHaveBeenCalledWith(hashedKey, 1, {
      httpOnly: true,
      maxAge: 4492800000,
    })
  })

  it('should find matching cookie', () => {
    expect(WhatsNewCookieService.getDismissedVersion(req, id)).toEqual(1)
  })
})
