/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import initialiseAppInsights from './server/azureAppInsights'
import setUpMocks from './mocks'

initialiseAppInsights()

import app from './server/index'
import config from './server/config'
import log from './log'

app.listen(config.port, async () => {
  log.info(`Server listening on port ${config.port}`)

  if (process.env.NODE_ENV === 'development') {
    
    await setUpMocks()
    log.info('Mocks set up for development')
  }
})
