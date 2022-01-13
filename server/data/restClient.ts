import superagent, { HTTPError as SuperagentHttpError } from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import Logger from 'bunyan'
import createError, { HttpError } from 'http-errors'
import { ApiConfig } from '../config'
import { loggerFactory } from '../../log'

interface GetRequest {
  path?: string
  query?: string | Record<string, unknown>
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
  token?: string | null
  timeout?: {
    response: number
    deadline: number
  }
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
  token?: string | null
}

export type RestClientError = HttpError

export default class RestClient {
  agent: Agent

  logger: Logger

  constructor(
    private readonly name: string,
    private readonly config: ApiConfig,
    private readonly token: string | null = null // deprecated: should now be passed to method call e.g. GET, POST
  ) {
    this.agent = config.url.startsWith('https') ? new HttpsAgent(config.agent) : new Agent(config.agent)
    this.logger = loggerFactory({ client: name }, 'interventions.restClient')
  }

  private apiUrl() {
    return this.config.url
  }

  private timeoutConfig() {
    return this.config.timeout
  }

  private static createErrorFromCaughtValue(value: unknown): RestClientError {
    const error = value as SuperagentHttpError

    // some errors thrown by superagent are not HttpError e.g. `RequestBase._timeoutError`
    if (error.status === undefined) {
      throw value
    }

    return createError(error.status, error, { external: true })
  }

  async get({
    path,
    query = '',
    headers = {},
    responseType = '',
    raw = false,
    token = this.token,
    timeout = this.timeoutConfig(),
  }: GetRequest): Promise<unknown> {
    this.logger.info(
      {
        path,
        query: JSON.stringify(query),
      },
      this.logger.info({ path }, this.logMessage(token, 'GET'))
    )

    try {
      const unauthenticatedRequest = superagent
        .get(`${this.apiUrl()}${path}`)
        .agent(this.agent)
        .retry(0)
        .query(query)
        .set(headers)
        .responseType(responseType)
        .timeout(timeout)

      const result =
        token === null ? await unauthenticatedRequest : await unauthenticatedRequest.auth(token, { type: 'bearer' })

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, query, path, verb: 'GET' }, 'rest client error')
      throw RestClient.createErrorFromCaughtValue(error)
    }
  }

  async post({
    path,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
    token = this.token,
  }: PostRequest = {}): Promise<unknown> {
    this.logger.info({ path }, this.logMessage(token, 'POST'))

    try {
      const unauthenticatedRequest = superagent
        .post(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(0)
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      const result =
        token === null ? await unauthenticatedRequest : await unauthenticatedRequest.auth(token, { type: 'bearer' })

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, path, verb: 'POST' }, 'rest client error')
      throw RestClient.createErrorFromCaughtValue(error)
    }
  }

  // This is copied from the post method above
  async patch({
    path,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
    token = this.token,
  }: PostRequest = {}): Promise<unknown> {
    this.logger.info({ path }, this.logMessage(token, 'PATCH'))

    try {
      const unauthenticatedRequest = superagent
        .patch(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(0)
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      const result =
        token === null ? await unauthenticatedRequest : await unauthenticatedRequest.auth(token, { type: 'bearer' })

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, path, verb: 'PATCH' }, 'rest client error')
      throw RestClient.createErrorFromCaughtValue(error)
    }
  }

  // This is copied from the post method above
  async put({
    path,
    headers = {},
    responseType = '',
    data = {},
    raw = false,
    token = this.token,
  }: PostRequest = {}): Promise<unknown> {
    this.logger.info({ path }, this.logMessage(token, 'PUT'))

    try {
      const unauthenticatedRequest = superagent
        .put(`${this.apiUrl()}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(0)
        .set(headers)
        .responseType(responseType)
        .timeout(this.timeoutConfig())

      const result =
        token === null ? await unauthenticatedRequest : await unauthenticatedRequest.auth(token, { type: 'bearer' })

      return raw ? result : result.body
    } catch (error) {
      this.logger.warn({ err: error, path, verb: 'PUT' }, 'rest client error')
      throw RestClient.createErrorFromCaughtValue(error)
    }
  }

  private logMessage(token: string | null, httpVerb: string) {
    return `Making ${token === null ? 'unauthenticated' : 'authenticated'} ${httpVerb} request`
  }
}
