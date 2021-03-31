import nunjucks from 'nunjucks'
import express from 'express'
import * as pathModule from 'path'

export default function nunjucksSetup(app: express.Application, path: pathModule.PlatformPath): void {
  nunjucks.configure(
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
}
