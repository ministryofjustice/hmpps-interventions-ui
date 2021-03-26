import { Router } from 'express'

import loginRedirectMiddleware from '../middleware/loginRedirectMiddleware'
import tokenVerificationMiddleware from '../middleware/tokenVerificationMiddleware'
import tokenVerifier from '../data/tokenVerification'
import authorisationMiddleware from '../middleware/authorisationMiddleware'

export default function standardRouter(authorisedRoles: string[] = []): Router {
  const router = Router({ mergeParams: true })

  router.use(loginRedirectMiddleware())
  router.use(tokenVerificationMiddleware(tokenVerifier))
  router.use(authorisationMiddleware(authorisedRoles))

  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  return router
}
