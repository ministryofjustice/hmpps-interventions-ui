import { RequestHandler } from 'express'
import { TokenVerifier, VerifiableRequest } from '../data/tokenVerification'
import log from '../../log'

export default function tokenVerificationMiddleware(tokenVerifier: TokenVerifier): RequestHandler {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }

    // give us 10 seconds grace, to avoid a potentially expired token by the time the view is loaded
    // we have an extra check here in the unlikely event that `res.locals.token.expiry` is undefined;
    // `undefined - 10` = NaN, and `number > NaN = false` - leading to potentially invalid tokens
    // being passed through. isn't javascript fantastic.
    const { expiry } = res.locals.user.token
    const tokenExpired = expiry && Math.floor(Date.now() / 1000) > res.locals.user.token.expiry - 10

    if (tokenExpired === false && (await tokenVerifier(req as VerifiableRequest))) {
      return next()
    }

    log.info('access token expired or invalid - redirecting to login')

    req.logout()
    req.session!.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}
