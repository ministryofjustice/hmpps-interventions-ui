import dotenv from 'dotenv'
import moment from 'moment'

dotenv.config()

const production = process.env.NODE_ENV === 'production'

function getEnv(name: string, fallback: string, requiredInProduction: boolean): string {
  if (process.env[name]) {
    return process.env[name]
  }

  if (production && requiredInProduction) {
    throw new Error(`Missing env var ${name}`)
  }

  return fallback
}

export = {
  domain: getEnv('INGRESS_URL', 'http://localhost:3000', true),
  https: production,
  links: {
    emailUrl: getEnv('EMAIL_LOCATION_URL', '/', true),
    exitUrl: getEnv('EXIT_LOCATION_URL', '/', true),
  },
  port: getEnv('PORT', '3000', false),
  production,
  testMode: process.env.NODE_ENV === 'test',
  version: moment.now().toString(),
}
