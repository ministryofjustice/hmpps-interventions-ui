/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import app from './server/index'
import log from './log'

app.listen(app.get('port'), async () => {
  log.info(`Server listening on port ${app.get('port')}`)

  if (process.env.NODE_ENV === 'development') {
    const { default: setUpMocks } = await import('./mocks')
    await setUpMocks()
    log.info('Mocks set up for development')
  }
})
