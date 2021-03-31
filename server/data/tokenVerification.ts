import superagent from 'superagent'
import { Request } from 'express'
import config from '../config'
import logger from '../../log'
import { User } from '../authentication/passport'

function verifyAccessToken(token: string) {
  return superagent
    .post(`${config.apis.tokenVerification.url}/token/verify`)
    .auth(token, { type: 'bearer' })
    .timeout(config.apis.tokenVerification.timeout)
    .then(response => Boolean(response.body && response.body.active))
    .catch(error => {
      logger.error({ err: error }, 'Error calling tokenVerificationApi')
    })
}

export interface VerifiableRequest extends Request {
  verified?: boolean
  user: User
}

export type TokenVerifier = (request: VerifiableRequest) => Promise<boolean | void>

const tokenVerifier: TokenVerifier = async request => {
  const { user, verified } = request

  if (verified) {
    return true
  }

  if (!config.apis.tokenVerification.enabled) {
    logger.debug('token verification disabled; assuming token is valid')
    return true
  }

  logger.debug({ username: user.username }, 'verifying user access token')

  const result = await verifyAccessToken(user.token.accessToken)
  if (result) {
    request.verified = true
  }
  return result
}

export default tokenVerifier
