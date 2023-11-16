import { Request, Response } from 'express'
import NotificationCookieService from './whatsNewCookieService'

describe('WhatsNew cookie', () => {
  let res: Response
  let req: Request
  const notificationCookieService = new NotificationCookieService()

  beforeEach(() => {
    res = { cookie: jest.fn() } as unknown as Response
    req = { cookies: { 'whats-new-banner': 1 } } as unknown as Request
  })

  it('should store cookie correctly', () => {
    notificationCookieService.persistDismissedVersion(res, 1)
    expect(res.cookie).toHaveBeenCalledWith('whats-new-banner', 1, {
      httpOnly: true,
      maxAge: 4492800000,
    })
  })

  it('should find matching cookie', () => {
    expect(notificationCookieService.getDismissedVersion(req)).toEqual(1)
  })
})
