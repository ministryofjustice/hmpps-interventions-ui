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

const auditConfig = () => {
  const auditEnabled = get('AUDIT_ENABLED', 'false') === 'true'
  return {
    enabled: auditEnabled,
    queueUrl: get(
      'AUDIT_SQS_QUEUE_URL',
      'http://localhost:4566/000000000000/mainQueue',
      auditEnabled ? requiredInProduction : undefined
    ),
    serviceName: get('AUDIT_SERVICE_NAME', 'UNASSIGNED', auditEnabled ? requiredInProduction : undefined),
    region: get('AUDIT_SQS_REGION', 'eu-west-2'),
  }
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
  whatsNewBannerEnabled: false, // This is a static config flag to control the "What's New" banner globall
  features: {
    serviceProviderReporting: get('FEATURE_SP_REPORTING_ENABLED', 'true') === 'true',
    previouslyApprovedActionPlans: get('FEATURE_PREVIOUSLY_APPROVED_ACTION_PLANS', 'false') === 'true',
  },
  userData: {
    ppDashboardSortOrder: {
      storageDurationInSeconds: 60 * 60 * 24 * 7, // one week
    },
    spDashboardSortOrder: {
      storageDurationInSeconds: 60 * 60 * 24 * 7, // one week
    },
  },
  s3: {
    service: {
      region: 'eu-west-2',
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
    ramDeliusApi: {
      url: get('RAM_DELIUS_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: Number(get('RAM_DELIUS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('RAM_DELIUS_API_TIMEOUT_DEADLINE', 10000)),
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
    },
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://hmpps-auth:8090/auth', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 20000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'interventions', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      loginClientId: get('LOGIN_CLIENT_ID', 'interventions', requiredInProduction),
      loginClientSecret: get('LOGIN_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    hmppsManageUsersApi: {
      url: get('HMPPS_MANAGE_USERS_URL', 'http://localhost:8096', requiredInProduction),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 20000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 20000)),
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
    prisonRegister: {
      url: get(
        'PRISON_REGISTER_API_URL',
        'https://prison-register-dev.hmpps.service.justice.gov.uk',
        requiredInProduction
      ),
      timeout: {
        response: Number(get('PRISON_REGISTER_API_URL_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('PRISON_REGISTER_API_URL_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
    },
    prisonApi: {
      url: get('PRISON_API_URL', 'http://localhost:9092', requiredInProduction),
      timeout: {
        response: Number(get('PRISON_API_URL_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('PRISON_API_URL_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
    },
  },
  dashboards: {
    probationPractitioner: {
      openCases: Number(get('PP_OPEN_CASES_PAGE_SIZE', '500')),
      unassignedCases: Number(get('PP_UNASSIGNED_CASES_PAGE_SIZE', '500')),
      completedCases: Number(get('PP_MY_CASES_PAGE_SIZE', '500')),
      cancelledCases: Number(get('PP_CANCELLED_CASES_PAGE_SIZE', '500')),
    },
    serviceProvider: {
      percentageOfPaginationUsers: Number(get('SP_PERCENTAGE_OF_DASHBOARD_PAGINATION_USERS', '100')),
      myCases: Number(get('SP_MY_CASES_PAGE_SIZE', '500')),
      openCases: Number(get('SP_OPEN_CASES_PAGE_SIZE', '500')),
      unassignedCases: Number(get('SP_UNASSIGNED_CASES_PAGE_SIZE', '500')),
      completedCases: Number(get('SP_COMPLETED_PAGE_SIZE', '500')),
      cancelledCases: Number(get('SP_CANCELLED_PAGE_SIZE', '500')),
    },
  },
  featureFlags: {
    custodyLocationEnabled: get('FLAG_CUSTODY_LOCATION_ENABLED', true),
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  draftsService: {
    expiry: { seconds: Number(get('DRAFTS_EXPIRY_IN_SECONDS', `${24 * 60 * 60}`)) },
  },
  sqs: {
    audit: auditConfig(),
  },
}
