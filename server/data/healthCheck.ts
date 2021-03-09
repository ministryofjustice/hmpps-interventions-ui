import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { loggerFactory } from '../../log'
import { AgentConfig } from '../config'

export type ServiceCheck = () => Promise<string>

export class ServiceTimeout {
  response = 1500

  deadline = 2000
}

export function serviceCheckFactory(
  name: string,
  url: string,
  agentOptions: AgentConfig,
  serviceTimeout: ServiceTimeout = new ServiceTimeout()
): ServiceCheck {
  const keepaliveAgent = url.startsWith('https') ? new HttpsAgent(agentOptions) : new Agent(agentOptions)
  const logger = loggerFactory({ service: name })

  return () =>
    new Promise((resolve, reject) => {
      superagent
        .get(url)
        .agent(keepaliveAgent)
        .retry(2, (err, res) => {
          if (err)
            logger.info(
              {
                code: err.code,
                message: err.message,
              },
              'retry handler found API error'
            )
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(serviceTimeout)
        .end((error, result) => {
          if (error) {
            logger.error({ err: error }, 'error calling service')
            reject(error)
          } else if (result.status === 200) {
            resolve('OK')
          } else {
            reject(result.status)
          }
        })
    })
}
