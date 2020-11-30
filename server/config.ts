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
    communityApi: {
      url: get('COMMUNITY_API_URL', 'http://localhost:8091', requiredInProduction),
      timeout: {
        response: get('COMMUNITY_API_TIMEOUT_RESPONSE', 10000),
        deadline: get('COMMUNITY_API_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
    },
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:8090/auth', requiredInProduction),
      timeout: {
        response: get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000),
        deadline: get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'interventions', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      loginClientId: get('LOGIN_CLIENT_ID', 'interventions', requiredInProduction),
      loginClientSecret: get('LOGIN_CLIENT_SECRET', 'clientsecret', requiredInProduction),
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
