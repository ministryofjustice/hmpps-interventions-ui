import { Application } from 'express'
import passport from 'passport'
import OAuth2Strategy from 'passport-oauth2'
import jwtDecode from 'jwt-decode'
import config from '../config'
import generateOauthClientBaiscAuthHeader from './clientCredentials'
import UserService, { UserDetails } from '../services/userService'
import logger from '../../log'

const authConfig = config.apis.hmppsAuth

interface HmmpsAuthUser {
  token: {
    accessToken: string
    roles: string[]
    expiry: number
  }
  username: string
  userId: string
}
export type User = HmmpsAuthUser & UserDetails

export default function passportSetup(app: Application, userService: UserService): void {
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
      async (accessToken, refreshToken, res, profile, verified) => {
        // augment the token response from with extra user details
        try {
          const userDetails = await userService.getUserDetails(accessToken)
          const { exp: expiry, authorities: roles = [] } = jwtDecode(accessToken)

          verified(null, {
            token: {
              accessToken,
              roles,
              expiry,
            },
            username: res.user_name,
            userId: res.user_id,
            authSource: res.auth_source,
            ...userDetails,
          })
        } catch (error) {
          logger.error({ err: error, username: res.user_name }, 'failed to retrieve user details')
          verified(error)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
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
