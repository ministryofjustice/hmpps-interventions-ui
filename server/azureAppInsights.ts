import { setup, defaultClient, DistributedTracingModes } from 'applicationinsights'
import applicationVersion from './applicationVersion'
import config from './config'
import logger from '../log'

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

function version(): string {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export default function initialiseAppInsights(): void {
  const { connectionString } = config.applicationInsights
  if (connectionString !== null) {
    logger.info('Enabling Application Insights')

    setup(connectionString).setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()

    defaultClient.context.tags['ai.cloud.role'] = defaultName()
    defaultClient.context.tags['ai.application.ver'] = version()
  }
}
