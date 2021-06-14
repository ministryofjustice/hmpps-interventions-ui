import { RequestHandler } from 'express'
import createError from 'http-errors'

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }

    if (authorisedRoles.length && !res.locals.user.token.roles.some((role: string) => authorisedRoles.includes(role))) {
      throw createError(403, 'user does not have the required role to access this page')
    }

    return next()
  }
}
