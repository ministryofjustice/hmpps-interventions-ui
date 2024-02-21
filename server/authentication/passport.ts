import { Application } from 'express'
import passport from 'passport'
import OAuth2Strategy from 'passport-oauth2'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import type { Request, Response, NextFunction } from 'express'
import config from '../config'
import generateOauthClientBaiscAuthHeader from './clientCredentials'
import logger from '../../log'
import LoggedInUser from '../models/loggedInUser'
import HmppsAuthService from '../services/hmppsAuthService'
import User from '../models/hmppsAuth/user'

const authConfig = config.apis.hmppsAuth

// the following code defines the Express.User type which allows @types/passport
// to correctly augment Express.Request with the LoggedInUser created below
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends LoggedInUser {}
  }
}

interface JwtPayloadExtended extends JwtPayload {
  authorities: string[]
  user_name: string
  user_id: string
  auth_source: string
}

export default function passportSetup(app: Application, hmppsAuthService: HmppsAuthService): void {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: `${authConfig.url}/oauth/authorize`,
        tokenURL: `${authConfig.url}/oauth/token`,
        clientID: authConfig.loginClientId,
        clientSecret: authConfig.loginClientSecret,
        callbackURL: `${config.domain}/sign-in/callback`,
        state: true, // see https://auth0.com/docs/protocols/state-parameters
        customHeaders: {
          Authorization: generateOauthClientBaiscAuthHeader(authConfig.loginClientId, authConfig.loginClientSecret),
        },
      },
      async (accessToken, refreshToken, res, profile, verified: (err?: Error | null, user?: LoggedInUser) => void) => {
        try {
          const {
            exp: expiry = 0,
            authorities: roles = [],
            user_name: username,
            user_id: userId,
            auth_source: authSource,
          } = jwtDecode<JwtPayloadExtended>(accessToken)

          // augment the token response from with extra user details
          const user: User = { username, userId, authSource }
          const { name } = await hmppsAuthService.getUserDetails(accessToken)
          const { email } = await hmppsAuthService.getUserEmail(accessToken)
          const clientCredToken = await hmppsAuthService.getApiClientToken()
          const organizations = await hmppsAuthService.getUserOrganizations(clientCredToken, user)
          const loggedInUser: LoggedInUser = {
            token: {
              accessToken,
              roles,
              expiry,
            },
            ...user,
            name,
            email,
            organizations,
          }

          verified(null, loggedInUser)
        } catch (error) {
          // It almost certainly is an Error, but we need to convince the compiler
          // so we can pass it to the callback
          if (!(error instanceof Error)) {
            throw new Error(`${error} is not an Error`)
          }

          logger.error({ err: error, username: res.user_name }, 'failed to decode token or get user details')
          verified(error)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user)
  })

  app.use((req, res, next) => {
    res.locals.user = req.user

    next()
  })

  const signIn = passport.authenticate('oauth2')
  app.get('/sign-in', signIn)

  const signInCallback = (redirectUri: string) =>
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: '/',
      failureRedirect: redirectUri,
      keepSessionInfo: true,
    })
  app.get('/sign-in/callback', signInCallback('/sign-in'))

  const signOut = (logoutTerm: string, req: Request, res: Response, next: NextFunction) => {
    const { redirectUrl } = req.query
    const logoutUrl = `${authConfig.url}/${logoutTerm}?client_id=${authConfig.loginClientId}&redirect_uri=${
      config.domain
    }${redirectUrl || `/${logoutTerm}/success`}`
    if (req.isAuthenticated()) {
      req.logout(err => {
        if (err) {
          return next(err)
        }
        return res.redirect(logoutUrl)
      })
    } else {
      res.redirect(logoutUrl)
    }
  }
  app.get('/sign-out', (req, res, next) => {
    signOut('sign-out', req, res, next)
  })

  const signOutSuccess = (req: Request, res: Response) => {
    res.render('logoutSuccess')
  }
  app.get('/sign-out/success', signOutSuccess)

  // deprecated endpoints that we need to keep around due to bookmarks etc.
  app.get('/login', signIn)
  app.get('/login/callback', signInCallback('/sign-in'))
  app.get('/logout', (req, res, next) => {
    signOut('sign-out', req, res, next)
  })
}
