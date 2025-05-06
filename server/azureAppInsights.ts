import { setup, defaultClient, DistributedTracingModes } from 'applicationinsights'
import type { Request } from 'express'
import { TelemetryItem } from 'applicationinsights/out/src/declarations/generated'
import applicationVersion from './applicationVersion'
import config from './config'
import logger from '../log'

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
  if (connectionString !== null) {
    logger.info('Enabling Application Insights')

    setup(connectionString).setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()

    // application level properties
    defaultClient.context.tags[defaultClient.context.keys.cloudRole] = config.applicationInsights.cloudRoleName
    defaultClient.context.tags[defaultClient.context.keys.applicationVersion] = applicationVersion.buildNumber

    // custom processors to fine tune behaviour
    defaultClient.addTelemetryProcessor(ignoreExcludedRequestsProcessor)
    defaultClient.addTelemetryProcessor(addUsernameProcessor)
    defaultClient.addTelemetryProcessor(errorStatusCodeProcessor)
  }
}
