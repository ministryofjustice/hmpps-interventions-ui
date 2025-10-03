import { setup, defaultClient, DistributedTracingModes } from 'applicationinsights'
import type { Request } from 'express'
import applicationVersion from './applicationVersion'
import config from './config'
import logger from '../log'

interface TelemetryEnvelope {
  data?: {
    baseType?: string
    baseData?: {
      responseCode?: number
      success?: boolean
      [key: string]: unknown
    }
  }
  tags?: { [key: string]: string }
}

function ignoreExcludedRequestsProcessor(
  envelope: TelemetryEnvelope,
  _contextObjects?: { [name: string]: unknown }
): boolean {
  if (envelope.data?.baseType === 'RequestData') {
    const requestData = envelope.data.baseData as { name?: string }

    if (requestData?.name) {
      const { excludedRequests } = config.applicationInsights

      const isExcluded = excludedRequests.some(pattern => requestData.name?.match(pattern) !== null)

      if (isExcluded) {
        return false
      }
    }
  }
  return true
}

/* eslint-disable no-param-reassign */
function addUsernameProcessor(envelope: TelemetryEnvelope, contextObjects?: { [name: string]: unknown }): boolean {
  if (envelope.data?.baseType === 'RequestData') {
    const userId = (contextObjects?.['http.ServerRequest'] as Request)?.user?.userId

    if (userId) {
      // clone tags so we’re not reassigning envelope directly
      const newTags = { ...(envelope.tags ?? {}) }
      newTags[defaultClient.context.keys.userAuthUserId] = userId
      // eslint-disable no-param-reassign
      envelope.tags = newTags
    }
  }
  return true
}
/* eslint-disable no-param-reassign */

function errorStatusCodeProcessor(envelope: TelemetryEnvelope, _contextObjects?: { [name: string]: unknown }): boolean {
  if (envelope.data?.baseType === 'RequestData' && envelope.data.baseData) {
    const { baseData } = envelope.data

    // only mark 5xx response codes as failures.
    // 4xx codes remain "successful" because they're expected (auth/validation).
    if (typeof baseData.responseCode === 'number') {
      baseData.success = baseData.responseCode < 500
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
    defaultClient.context.tags[defaultClient.context.keys.cloudRole] = config.applicationInsights.cloudRoleName
    defaultClient.context.tags[defaultClient.context.keys.applicationVersion] = applicationVersion.buildNumber

    // custom processors to fine tune behaviour
    defaultClient.addTelemetryProcessor(ignoreExcludedRequestsProcessor)
    defaultClient.addTelemetryProcessor(addUsernameProcessor)
    defaultClient.addTelemetryProcessor(errorStatusCodeProcessor)
  }
}
