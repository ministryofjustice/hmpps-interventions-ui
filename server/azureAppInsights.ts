import { setup, Contracts, defaultClient, DistributedTracingModes } from 'applicationinsights'
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

function ignoreStaticAssetsProcessor(
  envelope: Contracts.EnvelopeTelemetry,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data.baseType === Contracts.TelemetryTypeString.Request) {
    const requestData = envelope.data.baseData
    if (requestData instanceof Contracts.RequestData && requestData.name.startsWith('GET /assets/')) {
      return false
    }
  }
  return true
}

export default function initialiseAppInsights(): void {
  const { connectionString } = config.applicationInsights
  if (connectionString !== null) {
    logger.info('Enabling Application Insights')

    setup(connectionString).setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()

    // application level properties
    defaultClient.context.tags['ai.cloud.role'] = defaultName()
    defaultClient.context.tags['ai.application.ver'] = version()

    // custom processors to fine tune behaviour
    defaultClient.addTelemetryProcessor(ignoreStaticAssetsProcessor)
  }
}
