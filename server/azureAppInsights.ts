import { defaultClient, DistributedTracingModes } from 'applicationinsights'
import { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import type { Request } from 'express'
import * as appInsights from 'applicationinsights'
import logger from '../log'
import config from './config'
import applicationVersion from './applicationVersion'

function ignoreExcludedRequestsProcessor(
  envelope: TelemetryItem,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data?.baseType === 'RequestData') {
    const requestData = envelope.data.baseData
    const { excludedRequests } = config.applicationInsights

    for (let i = 0; i < excludedRequests.length; i += 1) {
      const pattern = excludedRequests[i]
      if (requestData?.name && requestData.name.match(pattern) !== null) {
        return false
      }
    }
  }
  return true
}

function addUsernameProcessor(
  envelope: TelemetryItem,
  contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data?.baseType === 'RequestData') {
    const userId = (contextObjects?.['http.ServerRequest'] as Request)?.user?.userId
    if (userId) {
      if (envelope.tags === undefined) {
        // eslint-disable-next-line no-param-reassign
        envelope.tags = {}
      }
      // eslint-disable-next-line no-param-reassign
      envelope.tags[defaultClient.context.keys.userAuthUserId] = userId
    }
  }
  return true
}

function errorStatusCodeProcessor(
  envelope: TelemetryItem,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data?.baseType === 'RequestData' && envelope.data?.baseData !== undefined) {
    // only mark 5xx response codes as failures. the application serves 4xx
    // responses to indicate authorization/validation errors and the like.
    // eslint-disable-next-line no-param-reassign
    envelope.data.baseData.success = envelope.data.baseData.responseCode < 500
  }
  return true
}

export default function initialiseAppInsights(): void {
  const { connectionString } = config.applicationInsights

  if (connectionString != null) {
    logger.info('Enabling Application Insights')

    appInsights.setup(connectionString).setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()

    const client = appInsights.defaultClient

    client.context.tags['ai.cloud.role'] = config.applicationInsights.cloudRoleName
    client.context.tags['ai.application.ver'] = applicationVersion.buildNumber

    // Add custom telemetry processors
    client.addTelemetryProcessor(ignoreExcludedRequestsProcessor)
    client.addTelemetryProcessor(addUsernameProcessor)
    client.addTelemetryProcessor(errorStatusCodeProcessor)
  }
}
