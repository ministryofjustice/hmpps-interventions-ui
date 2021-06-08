import { setup, Contracts, defaultClient, DistributedTracingModes } from 'applicationinsights'
import type { Request } from 'express'
import applicationVersion from './applicationVersion'
import config from './config'
import logger from '../log'

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

function addUsernameProcessor(
  envelope: Contracts.EnvelopeTelemetry,
  contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data.baseType === Contracts.TelemetryTypeString.Request) {
    const userId = (contextObjects?.['http.ServerRequest'] as Request)?.user?.userId
    if (userId) {
      // eslint-disable-next-line no-param-reassign
      envelope.tags['ai.user.authUserId'] = userId
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
    defaultClient.context.tags['ai.cloud.role'] = 'interventions-ui'
    defaultClient.context.tags['ai.application.ver'] = applicationVersion.buildNumber

    // custom processors to fine tune behaviour
    defaultClient.addTelemetryProcessor(ignoreStaticAssetsProcessor)
    defaultClient.addTelemetryProcessor(addUsernameProcessor)
  }
}
