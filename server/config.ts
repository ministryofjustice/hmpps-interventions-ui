import * as dotenv from 'dotenv'

dotenv.config()
const production = process.env.NODE_ENV === 'production'

function get(name: string, fallback, options = { requireInProduction: false }) {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  maxSockets: 100

  maxFreeSockets: 10

  freeSocketTimeout: 30000
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

export default {
  version: Date.now().toString(),
  production,
  testMode: process.env.NODE_ENV === 'test',
  port: get('PORT', 3000),
  https: production,
  staticResourceCacheDuration: 20,
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: get('WEB_SESSION_TIMEOUT_IN_MINUTES', '120'),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000),
        deadline: get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
      clientId: get('CLIENT_ID', 'sentence-plan-client', requiredInProduction),
      clientSecret: get('CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    interventionsService: {
      url: 'http://localhost:8091',
      timeout: {
        response: 10000,
        deadline: 10000,
      },
      agent: new AgentConfig(),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000),
        deadline: get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
}
