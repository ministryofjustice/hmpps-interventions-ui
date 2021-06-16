import { setup, Contracts, defaultClient, DistributedTracingModes } from 'applicationinsights'
import type { Request } from 'express'
import applicationVersion from './applicationVersion'
import config from './config'
import logger from '../log'

function ignoreExcludedRequestsProcessor(
  envelope: Contracts.EnvelopeTelemetry,
  _contextObjects: { [name: string]: unknown } | undefined
): boolean {
  if (envelope.data.baseType === Contracts.TelemetryTypeString.Request) {
    const requestData = envelope.data.baseData
    if (requestData instanceof Contracts.RequestData) {
      const { excludedRequests } = config.applicationInsights
      for (let i = 0; i < excludedRequests.length; i += 1) {
        const pattern = excludedRequests[i]
        if (requestData.name.match(pattern) !== null) {
          return false
        }
      }
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
      envelope.tags[defaultClient.context.keys.userAuthUserId] = userId
    }
  }
  return true
}

// function errorStatusCodeProcessor(
//   envelope: Contracts.EnvelopeTelemetry,
//   _contextObjects: { [name: string]: unknown } | undefined
// ): boolean {
//   if (envelope.data.baseType === Contracts.TelemetryTypeString.Request && envelope.data.baseData !== undefined) {
//     // eslint-disable-next-line no-param-reassign
//     envelope.data.baseData.success = !(
//       envelope.data.baseData.responseCode in config.applicationInsights.errorStatusCodes
//     )
//   }
//   return true
// }

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
  }
}
