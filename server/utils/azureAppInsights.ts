import { setup, defaultClient, TelemetryClient, DistributedTracingModes } from 'applicationinsights'
import applicationVersion from '../applicationVersion'
import config from '../config'

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

export function initialiseAppInsights(): void {
  if (config.applicationInsights.connectionString !== 'dummy') {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup(config.applicationInsights.connectionString)
      .setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C)
      .start()
  }
}

export function buildAppInsightsClient(name = defaultName()): TelemetryClient | null {
  if (config.applicationInsights.connectionString !== 'dummy') {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
    return defaultClient
  }
  return null
}
