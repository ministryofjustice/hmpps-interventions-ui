import express from 'express'

import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import compression from 'compression'
import flash from 'connect-flash'
import { RedisStore } from 'connect-redis'
import { randomBytes } from 'crypto'
import csurf from 'csurf'
import addRequestId from 'express-request-id'
import session from 'express-session'
import helmet from 'helmet'
import noCache from 'nocache'
import path from 'path'
import { createClient } from 'redis'
import passportSetup from './authentication/passport'
import broadcastMessageConfig from './broadcast-message-config.json'
import config from './config'
import createErrorHandler from './errorHandler'
import indexRoutes from './routes'
import probationPractitionerRoutes, { probationPractitionerUrlPrefix } from './routes/probationPractitionerRoutes'
import serviceEditorRoutes, { serviceEditorUrlPrefix } from './routes/serviceEditorRoutes'
import serviceProviderRoutes, { serviceProviderUrlPrefix } from './routes/serviceProviderRoutes'
import standardRouter from './routes/standardRouter'
import AssessRisksAndNeedsService from './services/assessRisksAndNeedsService'
import DraftsService from './services/draftsService'
import healthcheck from './services/healthCheck'
import HmppsAuthService from './services/hmppsAuthService'
import InterventionsService from './services/interventionsService'
import PrisonAndSecuredChildAgencyService from './services/prisonAndSecuredChildAgencyService'
import PrisonApiService from './services/prisonApiService'
import PrisonRegisterService from './services/prisonRegisterService'
import RamDeliusApiService from './services/ramDeliusApiService'
import ReferenceDataService from './services/referenceDataService'
import UserDataService from './services/userDataService'
import ControllerUtils from './utils/controllerUtils'
import nunjucksSetup from './utils/nunjucksSetup'
import AuditService from './services/auditService'

declare module 'express-session' {
  export interface SessionData {
    dashboardOriginPage: string
    searchText: string
    disableDowntimeBanner: boolean
  }
}

export default function createApp(
  ramDeliusApiService: RamDeliusApiService,
  interventionsService: InterventionsService,
  hmppsAuthService: HmppsAuthService,
  assessRisksAndNeedsService: AssessRisksAndNeedsService,
  referenceDataService: ReferenceDataService,
  prisonRegisterService: PrisonRegisterService,
  prisonApiService: PrisonApiService,
  prisonAndSecuredChildAgencyService: PrisonAndSecuredChildAgencyService,
  redisClient: ReturnType<typeof createClient>,
  auditService: AuditService
): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('query parser', 'extended')

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('view engine', 'njk')

  // Application Insights
  app.locals.applicationInsightsConnectionString = config.applicationInsights.connectionString
  app.locals.applicationInsightsRoleName = config.applicationInsights.cloudRoleName
  nunjucksSetup(app, path)

  // Server Configuration
  app.set('port', config.port)

  Sentry.init({
    environment: config.deploymentEnvironment,
  })

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
            "'sha256-kO+eZShFZU3Fq3BsxyiRjZlNO7gpZPH3odgOhHWCLxo='",
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
            "'sha256-XVaQIYDX9x3FcKfwRYYxmwIQXtOQY8UgJS4/7p/130A='",
            "'sha256-Yx3yl4k4eP+GDjGPt8O/8Lqh4sxAImQ9XEG6gp7wOwM='",
            "'sha256-pu37IY9Ig/H/vwy6rKyd1hbGd0HCmI3jhdUIhUV1l2A='",
            "'sha256-v8tCeJtLZcGYwtw7d1C1rXv3Tv2Clp+NyDAzPWZvtaY='",
            "'sha256-MoTaAoB/V8e6T3/hagtzBDVnvuUwgTboZeP40OVsw4k='",
            "'sha256-5jMuXDZya0nKx/E7KeO2htVzsDvBbBGHk54V7ZEFCwM='",
            "'sha256-ipdQyqTcKGCXb/cJaP4LSDbArTudO6RxvAkOGA8tHbs='",
            "'sha256-UXwdIJk5wwwd2OjraCRUacx+HjafiQK8seY4SljhXlM='",
            "'sha256-uHY6XBH+i96MslTWiwU/4YNk/F9PLXNmYcOLPrNIBAc='",
            "'sha256-cEdxVtpkIBoBZnNyXdIMaiU7rziA6ByNJioKww4vh4E='",
            "'sha256-9b+6KKksVIKVhnnUAGSWD/A+FOQfjTx1I4t7dhhvHDg='",
            "'sha256-ZqwN0G+YEhdmmcKo+zTaipeXu9Iex9tsQRdINwLzhrg='",
            "'sha256-mVhB0scNdTtTt/aOmRKykONFOV4hJa+aNdQO2Obzqig='",
            "'sha256-DWY4ZjS+wfkiCnvHmqAv42nwL2SgDelOl9jdsr8bGF0='",
            "'sha256-T8GG0mM7xjlF3v8OUaEoJYxlIf7UxMsiPqzKf4nDq5M='",
            "'sha256-1cKzDM/GsErWIInvbcYrPPfVrsi2bLJKL43qOwMja1E='",
            "'sha256-5JS2PkGWbRcUgQsFF0ABm71FY0rNntJ6wE5+r3Ky9d4='",
            "'sha256-9/4MG6hPwE88ex9FvVmdNMsoXxQ0c22gmXmVuOpCiO0='",
            "'sha256-NTp5hETD8Hp+vm/938rXjH1kWNCIs2AgDWCYfN7Zo0I='",
            "'sha256-CzfmzoP9nyharrC9zhwT0bBBykRcSpOwudJ5QxwC3gs='",
            "'sha256-8ssayaJXbx2ZEKt32TFTCKpwFv5iJ29ZVHrL/G6dk3M='",
            "'sha256-89VyG/qToDl09Y9Qiq3N/CagE+jiaoJoYT9UYIQ/cS8='",
            'https://www.google-analytics.com',
            'https://ssl.google-analytics.com',
            'https://www.googletagmanager.com/',
            // Used to allow inline script to set Google Analytics uaId in `layout.njk`
            `'nonce-${nonce}'`,
          ],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'https://www.google-analytics.com'],
          connectSrc: ["'self'", 'https://www.google-analytics.com', '*.applicationinsights.azure.com'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  )

  app.use((req, res, next) => {
    res.locals.cspNonce = nonce
    next()
  })

  app.use(addRequestId())
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      cookie: { secure: config.https, sameSite: 'lax', maxAge: config.session.expiryMinutes * 60 * 1000 },
      secret: config.session.secret,
      resave: false, // redis implements touch so shouldn't need this
      saveUninitialized: false,
      rolling: true,
      unset: 'destroy',
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
    '/browser/build',
    '/node_modules/govuk-frontend/govuk/assets',
    '/node_modules/govuk-frontend',
    '/node_modules/@ministryofjustice/frontend/moj/assets',
    '/node_modules/@ministryofjustice/frontend',
    '/node_modules/jquery/dist',
    '/node_modules/accessible-autocomplete/dist',
    '/node_modules/@microsoft/applicationinsights-web/dist/es5',
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
  app.get(['/health/liveness', '/health/readiness'], (_req, res, _next) => {
    const noExternalApiChecks: [] = []
    healthcheck(result => {
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
    }, noExternalApiChecks)
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

  const clock = { now: () => new Date() }
  const draftsService = new DraftsService(redisClient, config.draftsService.expiry, clock)
  const userDataService = new UserDataService(redisClient)

  const services = {
    ramDeliusApiService,
    interventionsService,
    hmppsAuthService,
    assessRisksAndNeedsService,
    draftsService,
    referenceDataService,
    userDataService,
    prisonRegisterService,
    prisonApiService,
    prisonAndSecuredChildAgencyService,
    auditService,
  }

  app.use('/', indexRoutes(standardRouter(), services))
  app.use(serviceProviderUrlPrefix, serviceProviderRoutes(standardRouter(['ROLE_CRS_PROVIDER']), services))
  app.use(probationPractitionerUrlPrefix, probationPractitionerRoutes(standardRouter(['ROLE_PROBATION']), services))
  app.use(serviceEditorUrlPrefix, serviceEditorRoutes(standardRouter(['ROLE_INTERVENTIONS_SERVICE_EDITOR']), services))

  // final regular middleware is for handling 404s
  app.use((req, res, next) => {
    res.status(404)
    return ControllerUtils.renderWithLayout(req, res, { renderArgs: ['errors/notFound', {}] }, null, null)
  })

  Sentry.setupExpressErrorHandler(app)

  app.use(createErrorHandler(config.production))

  return app
}
