import { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import type { Request } from 'express'
import { setup as setupApplicationInsights, defaultClient, DistributedTracingModes } from 'applicationinsights'
import logger from '../log'
import config from './config'
import applicationVersion from './applicationVersion'

function ignoreExcludedRequestsProcessor(
  telemetryItem: TelemetryItem,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (telemetryItem.data?.baseType === 'RequestData') {
    const requestData = telemetryItem.data.baseData
    const { excludedRequests } = config.applicationInsights

    for (let i = 0; i < excludedRequests.length; i += 1) {
      const pattern = excludedRequests[i]
      if (requestData?.name?.match(pattern) !== null) {
        return false
      }
    }
  }
  return true
}

function addUsernameProcessor(
  telemetryItem: TelemetryItem,
  contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (telemetryItem.data?.baseType === 'RequestData') {
    const userId = (contextObjects?.['http.ServerRequest'] as Request)?.user?.userId
    if (userId) {
      // eslint-disable-next-line no-param-reassign
      telemetryItem.tags = telemetryItem?.tags ?? {}
      // eslint-disable-next-line no-param-reassign
      telemetryItem.tags[defaultClient.context.keys.userAuthUserId] = userId
    }
  }
  return true
}

function errorStatusCodeProcessor(
  telemetryItem: TelemetryItem,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (telemetryItem.data?.baseType === 'RequestData' && telemetryItem.data?.baseData) {
    // only mark 5xx response codes as failures. the application serves 4xx
    // responses to indicate authorization/validation errors and the like.
    // eslint-disable-next-line no-param-reassign
    telemetryItem.data.baseData.success = telemetryItem.data.baseData.responseCode < 500
  }
  return true
}

export default function initialiseAppInsights(): void {
  const { connectionString } = config.applicationInsights

  if (connectionString) {
    logger.info('Enabling Application Insights')

    setupApplicationInsights(connectionString).setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()

    const client = defaultClient

    client.context.tags['ai.cloud.role'] = config.applicationInsights.cloudRoleName
    client.context.tags['ai.application.ver'] = applicationVersion.buildNumber

    // Add custom telemetry processors
    client.addTelemetryProcessor(ignoreExcludedRequestsProcessor)
    client.addTelemetryProcessor(addUsernameProcessor)
    client.addTelemetryProcessor(errorStatusCodeProcessor)
  }
}
