import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

export default function nunjucksSetup(app: express.Application, path: pathModule.PlatformPath): void {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  const getMojFilters = require('@ministryofjustice/frontend/moj/filters/all')

  const mojFilters = getMojFilters()
  Object.keys(mojFilters).forEach(filterName => {
    njkEnv.addFilter(filterName, mojFilters[filterName])
  })
}
