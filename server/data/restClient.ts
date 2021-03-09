import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'

import Logger from 'bunyan'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import { loggerFactory } from '../../log'

interface GetRequest {
  path?: string
  query?: string | Record<string, unknown>
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export default class RestClient {
  agent: Agent

  logger: Logger

  constructor(private readonly name: string, private readonly config: ApiConfig, private readonly token: string) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
    this.logger = loggerFactory({ client: name }, 'interventions.restClient')
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  defaultErrorLogger(error: UnsanitisedError): void {
    this.logger.warn({ err: error }, 'rest client error')
  }

  async get({ path, query = '', headers = {}, responseType = '', raw = false }: GetRequest): Promise<unknown> {
    this.logger.info(
      {
        path,
        query: JSON.stringify(query),
      },
      'getting using user credentials'
    )
    try {
      const result = await superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err)
            this.logger.info(
              {
                code: err.code,
                message: err.message,
              },
              'retry handler found API error'
            )
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, query, path, verb: 'GET' }, 'rest client error')
      throw sanitiseError(error)
    }
  }

  async post({ path, headers = {}, responseType = '', data = {}, raw = false }: PostRequest = {}): Promise<unknown> {
    this.logger.info({ path }, 'post using user credentials')
    try {
      const result = await superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) this.logger.info({ code: err.code, message: err.message }, 'retry handler found API error')
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, path, verb: 'POST' }, 'rest client error')
      throw sanitiseError(error)
    }
  }

  // This is copied from the post method above
  async patch({ path, headers = {}, responseType = '', data = {}, raw = false }: PostRequest = {}): Promise<unknown> {
    this.logger.info({ path }, 'patch using user credentials')
    try {
      const result = await superagent
        .patch(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) this.logger.info({ code: err.code, message: err.message }, 'retry handler found API error')
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(this.token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, path, verb: 'PATCH' }, 'rest client error')
      throw sanitiseError(error)
    }
  }

  async stream({ path, headers = {}, errorLogger = this.defaultErrorLogger }: StreamRequest = {}): Promise<unknown> {
    this.logger.info({ path }, 'getting using user credentials')
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .auth(this.token, { type: 'bearer' })
        .retry(2, (err, res) => {
          if (err) this.logger.info({ code: err.code, message: err.message }, 'retry handler found API error')
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.timeoutConfig())
        .set(headers)
        .end((error, response) => {
          if (error) {
            errorLogger(error)
            reject(error)
          } else if (response) {
            const s = new Readable()
            // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-empty-function
            s._read = () => {}
            s.push(response.body)
            s.push(null)
            resolve(s)
          }
        })
    })
  }
}
