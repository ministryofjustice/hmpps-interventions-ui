import express from 'express'

import * as Sentry from '@sentry/node'
import addRequestId from 'express-request-id'
import helmet from 'helmet'
import noCache from 'nocache'
import csurf from 'csurf'
import path from 'path'
import compression from 'compression'
import bodyParser from 'body-parser'
import flash from 'connect-flash'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { randomBytes } from 'crypto'
import indexRoutes from './routes'
import healthcheck from './services/healthCheck'
import nunjucksSetup from './utils/nunjucksSetup'
import config from './config'
import createErrorHandler from './errorHandler'
import standardRouter from './routes/standardRouter'
import CommunityApiService from './services/communityApiService'
import InterventionsService from './services/interventionsService'
import HmppsAuthService from './services/hmppsAuthService'
import passportSetup from './authentication/passport'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'
import ControllerUtils from './utils/controllerUtils'
import broadcastMessageConfig from './broadcast-message-config.json'
import DraftsService from './services/draftsService'

const RedisStore = connectRedis(session)

export default function createApp(
  communityApiService: CommunityApiService,
  interventionsService: InterventionsService,
  hmppsAuthService: HmppsAuthService,
  assessRisksAndNeedsService: AssessRisksAndNeedsService,
  draftsService: DraftsService
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

  const nonce = randomBytes(16).toString('base64')
  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'code.jquery.com',
            // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            'https://www.google-analytics.com',
            'https://ssl.google-analytics.com',
            'https://www.googletagmanager.com/',
            // Used to allow inline script to set Google Analytics uaId in `layout.njk`
            `'nonce-${nonce}'`,
          ],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'https://www.google-analytics.com'],
          connectSrc: ["'self'", 'https://www.google-analytics.com'],
        },
      },
    })
  )

  app.use((req, res, next) => {
    res.locals.cspNonce = nonce
    next()
  })

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

  // Determine whether or not to display broadcast message
  app.use((_req, res, next) => {
    const startTime = new Date(broadcastMessageConfig.start).getTime()
    const endTime = new Date(broadcastMessageConfig.end).getTime()
    const currentTime = Date.now()

    res.locals.broadcastMessage =
      currentTime >= startTime && currentTime <= endTime ? broadcastMessageConfig.message : null
    next()
  })

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
      assessRisksAndNeedsService,
      draftsService,
    })
  )

  // final regular middleware is for handling 404s
  app.use((req, res, next) => {
    res.status(404)
    return ControllerUtils.renderWithLayout(res, { renderArgs: ['errors/notFound', {}] }, null)
  })

  // The Sentry error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())

  app.use(createErrorHandler(config.production))

  return app
}
