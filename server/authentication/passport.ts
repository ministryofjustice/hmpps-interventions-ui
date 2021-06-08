import { Application } from 'express'
import passport from 'passport'
import OAuth2Strategy from 'passport-oauth2'
import jwtDecode from 'jwt-decode'
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
        callbackURL: `${config.domain}/login/callback`,
        state: true, // see https://auth0.com/docs/protocols/state-parameters
        customHeaders: {
          Authorization: generateOauthClientBaiscAuthHeader(authConfig.loginClientId, authConfig.loginClientSecret),
        },
      },
      async (accessToken, refreshToken, res, profile, verified: (err?: Error | null, user?: LoggedInUser) => void) => {
        try {
          const {
            exp: expiry,
            authorities: roles = [],
            user_name: username,
            user_id: userId,
            auth_source: authSource,
          } = jwtDecode(accessToken)

          // augment the token response from with extra user details
          const user: User = { username, userId, authSource }
          const { name } = await hmppsAuthService.getUserDetails(accessToken)
          const organizations = await hmppsAuthService.getUserOrganizations(accessToken, user)
          const loggedInUser: LoggedInUser = {
            token: {
              accessToken,
              roles,
              expiry,
            },
            ...user,
            name,
            organizations,
          }

          verified(null, loggedInUser)
        } catch (error) {
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

  app.get('/login', passport.authenticate('oauth2'))

  app.get(
    '/login/callback',
    passport.authenticate('oauth2', {
      successReturnToOrRedirect: '/',
      failureRedirect: '/login',
    })
  )

  app.get('/logout', (req, res) => {
    const { redirectUrl } = req.query
    const logoutUrl = `${authConfig.url}/logout?client_id=${authConfig.loginClientId}&redirect_uri=${config.domain}${
      redirectUrl || '/logout/success'
    }`

    if (req.isAuthenticated()) {
      req.logout()
      req.session!.destroy(() => res.redirect(logoutUrl))
    } else {
      res.redirect(logoutUrl)
    }
  })

  app.get('/logout/success', (req, res) => {
    res.render('logoutSuccess')
  })
}
