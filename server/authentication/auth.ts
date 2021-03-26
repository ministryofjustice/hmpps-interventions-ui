import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import type { Request, RequestHandler } from 'express'

import config from '../config'
import type { VerifiableRequest, TokenVerifier } from '../data/tokenVerification'
import generateOauthClientBaiscAuthHeader from './clientCredentials'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

export type AuthenticationMiddleware = (tokenVerifier: TokenVerifier) => RequestHandler

const authenticationMiddleware: AuthenticationMiddleware = verifyToken => {
  return async (req, res, next) => {
    if (req.isAuthenticated() && (await verifyToken(req as VerifiableRequest))) {
      return next()
    }
    req.session!.returnTo = req.originalUrl
    return res.redirect('/login')
  }
}

export interface UserDetails {
  username: string
  token: string
  authSource: string
}

export interface UserRequest extends Request {
  user: UserDetails
}

function init(): void {
  const authConfig = config.apis.hmppsAuth
  const strategy = new Strategy(
    {
      authorizationURL: `${authConfig.url}/oauth/authorize`,
      tokenURL: `${authConfig.url}/oauth/token`,
      clientID: authConfig.loginClientId,
      clientSecret: authConfig.loginClientSecret,
      callbackURL: `${config.domain}/login/callback`,
      state: true,
      customHeaders: {
        Authorization: generateOauthClientBaiscAuthHeader(authConfig.loginClientId, authConfig.loginClientSecret),
      },
    },
    (token, refreshToken, params, profile, done) => {
      return done(null, { token, username: params.user_name, authSource: params.auth_source })
    }
  )

  passport.use(strategy)
}

export default {
  authenticationMiddleware,
  init,
}
