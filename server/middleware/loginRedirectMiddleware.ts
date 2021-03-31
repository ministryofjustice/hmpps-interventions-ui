import { RequestHandler } from 'express'

export default function loginRedirectMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }

    req.session!.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
