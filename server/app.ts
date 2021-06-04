import express from 'express'

import * as Sentry from '@sentry/node'
import addRequestId from 'express-request-id'
import helmet from 'helmet'
import noCache from 'nocache'
import csurf from 'csurf'
import path from 'path'
import compression from 'compression'
import bodyParser from 'body-parser'
import createError from 'http-errors'
import flash from 'connect-flash'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'

import indexRoutes from './routes'
import healthcheck from './services/healthCheck'
import nunjucksSetup from './utils/nunjucksSetup'
import config from './config'
import errorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import CommunityApiService from './services/communityApiService'
import InterventionsService from './services/interventionsService'
import HmppsAuthService from './services/hmppsAuthService'
import passportSetup from './authentication/passport'
import authErrorHandler from './authentication/authErrorHandler'

const RedisStore = connectRedis(session)

export default function createApp(
  communityApiService: CommunityApiService,
  interventionsService: InterventionsService,
  hmppsAuthService: HmppsAuthService
): express.Application {
  const app = express()

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  // Server Configuration
  app.set('port', config.port)

  // Reads config from SENTRY_DSN env variable, if exists
  Sentry.init({ environment: config.deploymentEnvironment })

  // The Sentry request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler())

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", 'code.jquery.com', "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
    })
  )

  app.use(addRequestId())

  const client = redis.createClient({
    port: config.redis.port,
    password: config.redis.password,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true' ? {} : false,
  })

  app.use(
    session({
      store: new RedisStore({ client }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
    })
  )

  // Request Processing Configuration
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // authentication configuration
  passportSetup(app, hmppsAuthService)

  app.use(flash())

  // Resource Delivery Configuration
  app.use(compression())

  // Cachebusting version string
  if (config.production) {
    // Version only changes on reboot
    app.locals.version = config.version
  } else {
    // Version changes every request
    app.use((req, res, next) => {
      res.locals.version = Date.now().toString()
      return next()
    })
  }

  //  Static Resources Configuration
  const cacheControl = { maxAge: config.staticResourceCacheDuration * 1000 }
  ;[
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    '/node_modules/govuk-frontend/govuk/assets',
    '/node_modules/govuk-frontend',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
  ].forEach(dir => {
    app.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/govuk_frontend_toolkit/images'].forEach(dir => {
    app.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;['/node_modules/jquery/dist/jquery.min.js'].forEach(dir => {
    app.use('/assets/js/jquery.min.js', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  // Express Routing Configuration
  app.get('/health', (req, res, next) => {
    healthcheck(result => {
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
    })
  })

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'

  // Don't cache dynamic resources
  app.use(noCache())

  // CSRF protection
  if (!config.testMode) {
    app.use(csurf())
  }

  // Update a value in the cookie so that the set-cookie will be sent.
  // Only changes every minute so that it's not sent with every request.
  app.use((req, res, next) => {
    req.session!.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  app.use(
    '/',
    indexRoutes(standardRouter(), {
      communityApiService,
      interventionsService,
      hmppsAuthService,
    })
  )

  app.use((req, res, next) => next(createError(404, 'Not found')))

  app.use(authErrorHandler)

  // The Sentry error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())
  app.use(errorHandler(config.production))

  return app
}
