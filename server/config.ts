import * as dotenv from 'dotenv'

dotenv.config()
const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  const fromEnv = process.env[name]
  if (fromEnv !== undefined) {
    return fromEnv
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  maxSockets = 100

  maxFreeSockets = 10

  freeSocketTimeout = 30000
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
  port: Number(get('PORT', 3000)),
  https: production,
  staticResourceCacheDuration: 20,
  deploymentEnvironment: get('DEPLOYMENT_ENV', 'local', requiredInProduction),
  googleAnalyticsTrackingId: get('GA_ID', '', requiredInProduction),
  features: {
    serviceProviderReporting: get('FEATURE_SP_REPORTING_ENABLED', 'false') === 'true',
    previouslyApprovedActionPlans: get('FEATURE_PREVIOUSLY_APPROVED_ACTION_PLANS', 'false') === 'true',
  },
  s3: {
    service: {
      region: 'eu-west-2',
      accessKeyId: get('AWS_S3_ACCESSKEYID', 'test', requiredInProduction),
      secretAccessKey: get('AWS_S3_SECRETACCESSKEY', 'test', requiredInProduction),
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
      endpoint: production ? undefined : 'http://localhost:4566',
    },
    bucket: {
      name: get('AWS_S3_BUCKET_NAME', 'interventions-bucket-local', requiredInProduction),
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  applicationInsights: {
    connectionString: get('APPLICATIONINSIGHTS_CONNECTION_STRING', null, requiredInProduction),
    cloudRoleName: 'interventions-ui',
    excludedRequests: [/^GET \/assets\/.*/, /^GET \/health.*/],
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', '120')),
  },
  apis: {
    communityApi: {
      url: get('COMMUNITY_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: Number(get('COMMUNITY_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('COMMUNITY_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    assessRisksAndNeedsApi: {
      url: get('ASSESS_RISKS_AND_NEEDS_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: Number(get('ASSESS_RISKS_AND_NEEDS_API_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('ASSESS_RISKS_AND_NEEDS_API_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(),
      riskSummaryEnabled: get('ASSESS_RISKS_AND_NEEDS_API_RISK_SUMMARY_ENABLED', 'false') === 'true',
    },
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://hmpps-auth:8090/auth', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'interventions', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      loginClientId: get('LOGIN_CLIENT_ID', 'interventions', requiredInProduction),
      loginClientSecret: get('LOGIN_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    interventionsService: {
      url: get('INTERVENTIONS_SERVICE_URL', 'http://localhost:9092', requiredInProduction),
      // the interventions-service <-> community-api worst case timeout is 20s, this is intentionally just slightly higher
      // fixme: this is too long
      timeout: {
        response: 22000,
        deadline: 22000,
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'interventions', requiredInProduction),
      dashboardPageSize: {
        pp: {
          openCases: get('PP_OPEN_CASES_PAGE_SIZE', '50'),
          unassignedCases: get('PP_UNASSIGNED_CASES_PAGE_SIZE', '50'),
          completedCases: get('PP_MY_CASES_PAGE_SIZE', '50'),
          cancelledCases: get('PP_CANCELLED_CASES_PAGE_SIZE', '50'),
        },
      },
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:8100', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  draftsService: {
    expiry: { seconds: Number(get('DRAFTS_EXPIRY_IN_SECONDS', `${24 * 60 * 60}`)) },
  },
}
