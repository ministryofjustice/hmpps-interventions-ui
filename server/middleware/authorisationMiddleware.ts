import { RequestHandler } from 'express'
import logger from '../../log'
import { AuthError, ErrorType } from '../authentication/authErrorHandler'

export default function authorisationMiddleware(authorisedRoles: string[] = []): RequestHandler {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }

    if (authorisedRoles.length && !res.locals.user.token.roles.some((role: string) => authorisedRoles.includes(role))) {
      logger.error({ authorisedRoles }, 'user does not have the required role to access this page')
      throw new AuthError(ErrorType.INVALID_ROLES)
    }

    return next()
  }
}
