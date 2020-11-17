import nunjucks from 'nunjucks'
import path from 'path'

import config from '../config'

type Error = {
  href: string
  text: string
}

const { links } = config

export default function configureNunjucks(app: Express.Application): void {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/@ministryofjustice/frontend',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addGlobal('links', links)
}
