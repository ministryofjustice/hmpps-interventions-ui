import express, { Router, Express } from 'express'
import bodyParser from 'body-parser'
import cookieSession from 'cookie-session'
import path from 'path'

import indexRoutes, { Services } from '../index'
import serviceProviderRoutes, { serviceProviderUrlPrefix } from '../serviceProviderRoutes'
import nunjucksSetup from '../../utils/nunjucksSetup'
import createErrorHandler from '../../errorHandler'
import standardRouter from '../standardRouter'
import MockCommunityApiService from './mocks/mockCommunityApiService'
import InterventionsService from '../../services/interventionsService'
import MockedHmppsAuthService from '../../services/testutils/hmppsAuthServiceSetup'
import LoggedInUserFactory from '../../../testutils/factories/loggedInUser'
import AssessRisksAndNeedsService from '../../services/assessRisksAndNeedsService'
import config from '../../config'

export enum AppSetupUserType {
  probationPractitioner = 'delius',
  serviceProvider = 'auth',
}

function appSetup(
  indexRouter: Router,
  serviceProviderRouter: Router,
  production: boolean,
  userType: AppSetupUserType
): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  const user = LoggedInUserFactory.build()
  user.authSource = userType
  if (userType === AppSetupUserType.serviceProvider) {
    user.organizations = [{ id: 'HARMONY_LIVING', name: 'Harmony Living' }]
  }

  app.use((req, res, next) => {
    req.user = user
    req.isAuthenticated = () => {
      return true
    }
    res.locals = {}
    res.locals.user = req.user
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use('/', indexRouter)
  app.use(serviceProviderUrlPrefix, serviceProviderRouter)
  app.use(createErrorHandler(production))

  config.apis.assessRisksAndNeedsApi.riskSummaryEnabled = true

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
  // auth.default.authenticationMiddleware = () => (req, res, next) => next()
  const services = {
    communityApiService: new MockCommunityApiService(),
    interventionsService: {} as InterventionsService,
    hmppsAuthService: new MockedHmppsAuthService(),
    assessRisksAndNeedsService: {} as AssessRisksAndNeedsService,
    ...overrides,
  }

  return appSetup(
    indexRoutes(standardRouter(), services),
    serviceProviderRoutes(standardRouter(), services),
    production,
    userType
  )
}
