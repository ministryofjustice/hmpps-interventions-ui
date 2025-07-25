import express, { Router, Express } from 'express'
import bodyParser from 'body-parser'
// eslint-disable-next-line import/no-extraneous-dependencies
import cookieSession from 'cookie-session'
import path from 'path'
import helmet from 'helmet'
import { randomBytes } from 'crypto'

import indexRoutes, { Services } from '../index'
import serviceProviderRoutes, { serviceProviderUrlPrefix } from '../serviceProviderRoutes'
import nunjucksSetup from '../../utils/nunjucksSetup'
import createErrorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import InterventionsService from '../../services/interventionsService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import LoggedInUserFactory from '../../../testutils/factories/loggedInUser'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import config from '../../config'
import probationPractitionerRoutes, { probationPractitionerUrlPrefix } from '../probationPractitionerRoutes'
import DraftsService from '../../services/draftsService'
import ReferenceDataService from '../../services/referenceDataService'
import UserDataService from '../../services/userDataService'
import PrisonRegisterService from '../../services/prisonRegisterService'
import PrisonApiService from '../../services/prisonApiService'
import PrisonAndSecuredChildAgencyService from '../../services/prisonAndSecuredChildAgencyService'
import MockRamDeliusApiService from './mocks/mockRamDeliusApiService'
import AuditService from '../../services/auditService'

export enum AppSetupUserType {
  probationPractitioner = 'delius',
  serviceProvider = 'auth',
}

function appSetup(
  indexRouter: Router,
  serviceProviderRouter: Router,
  probationPractitionerRouter: Router,
  production: boolean,
  userType: AppSetupUserType
): Express {
  const app = express()

  app.set('view engine', 'njk')
  app.set('query parser', 'extended')

  nunjucksSetup(app, path)

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
          connectSrc: [
            "'self'",
            'https://www.google-analytics.com',
            '*.google-analytics.com',
            '*.analytics.google.com',
            '*.applicationinsights.azure.com',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  )

  const user = LoggedInUserFactory.build()
  user.authSource = userType
  if (userType === AppSetupUserType.serviceProvider) {
    user.organizations = [{ id: 'HARMONY_LIVING', name: 'Harmony Living' }]
  }

  app.use((req, res, next) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).isAuthenticated = () => true
    req.user = user
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use('/', indexRouter)
  app.use(serviceProviderUrlPrefix, serviceProviderRouter)
  app.use(probationPractitionerUrlPrefix, probationPractitionerRouter)
  app.use(createErrorHandler(production))

  return app
}

export default function appWithAllRoutes({
  production = false,
  overrides = {},
  userType,
}: {
  production?: boolean
  overrides?: Partial<Services>
  userType: AppSetupUserType
}): Express {
  config.features.serviceProviderReporting = true
  // auth.default.authenticationMiddleware = () => (req, res, next) => next()
  const services = {
    ramDeliusApiService: new MockRamDeliusApiService(),
    interventionsService: {} as InterventionsService,
    hmppsAuthService: new MockedHmppsAuthService(),
    assessRisksAndNeedsService: {} as AssessRisksAndNeedsService,
    draftsService: {} as DraftsService,
    referenceDataService: {} as ReferenceDataService,
    userDataService: {} as UserDataService,
    prisonRegisterService: {} as PrisonRegisterService,
    prisonApiService: {} as PrisonApiService,
    prisonAndSecuredChildAgencyService: {} as PrisonAndSecuredChildAgencyService,
    auditService: {} as AuditService, // Use the imported auditService directly
    ...overrides,
  }

  return appSetup(
    indexRoutes(standardRouter(), services),
    serviceProviderRoutes(standardRouter(), services),
    probationPractitionerRoutes(standardRouter(), services),
    production,
    userType
  )
}
