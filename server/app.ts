import express, { Express } from 'express'
import bunyanRequestLogger from 'bunyan-request-logger'

import createError from 'http-errors'
import path from 'path'

import config from './config'
import errorHandler from './errorHandler'
import healthcheckFactory from './services/healthcheck'
import loggingSerialiser from './loggingSerialiser'
import nunjucksSetup from './utils/nunjucksSetup'

export default function createApp(): Express {
  const app = express()

  app.set('json spaces', 2)

  // Configure Express for running behind proxies
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true)

  // View Engine Configuration
  app.set('view engine', 'html')

  nunjucksSetup(app)

  // Server Configuration
  app.set('port', config.port)

  //  Static Resources Configuration
  const cacheControl = { maxAge: NaN } // fixme, wat

  ;[
    '/assets',
    '/assets/stylesheets',
    '/assets/js',
    `/node_modules/govuk-frontend/govuk/assets`,
    `/node_modules/govuk-frontend`,
    `/node_modules/@ministryofjustice/frontend/`,
  ].forEach(dir => {
    app.use('/assets', express.static(path.join(process.cwd(), dir), cacheControl))
  })
  ;[`/node_modules/govuk_frontend_toolkit/images`].forEach(dir => {
    app.use('/assets/images/icons', express.static(path.join(process.cwd(), dir), cacheControl))
  })

  app.use(bunyanRequestLogger({ name: 'interventions-http', serializers: loggingSerialiser }).requestLogger())

  const healthcheck = healthcheckFactory()

  app.get('/health', (req, res, next) => {
    healthcheck((err, result) => {
      if (err) {
        return next(err)
      }
      if (!result.healthy) {
        res.status(503)
      }
      res.json(result)
      return result
    })
  })

  // GovUK Template Configuration
  app.locals.asset_path = '/assets/'

  app.use((req, res, next) => {
    next(createError(404, 'Not found'))
  })

  app.use(errorHandler(config.production))

  return app
}
