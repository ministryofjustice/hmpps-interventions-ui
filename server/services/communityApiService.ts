import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../log'

export interface DeliusUser {
  userId: string
  username: string
  firstName: string
  surname: string
  email: string
  enabled: boolean
  roles: Array<DeliusRole>
}

export interface DeliusServiceUser {
  // TODO IC-620 validate this data properly
  otherIds: OtherIds
  offenderProfile: OffenderProfile
  title: string | null
  firstName: string | null
  surname: string | null
  dateOfBirth: string | null
  gender: string | null
  contactDetails: ContactDetails
}

interface DeliusRole {
  name: string
}

interface Disability {
  disabilityType: {
    description: string
  }
  endDate: string
  notes: string
  startDate: string
}
interface OtherIds {
  crn: string
}

interface OffenderProfile {
  offenderLanguages: OffenderLanguages
  ethnicity: string
  religion: string
  disabilities: Disability[] | null
}

interface OffenderLanguages {
  primaryLanguage: string
}

interface ContactDetails {
  emailAddresses?: string[] | null
  phoneNumbers?: PhoneNumber[] | null
}

interface PhoneNumber {
  number: string | null
  type: string | null
}

export default class CommunityApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private restClient(token: string): RestClient {
    return new RestClient('Community API Client', config.apis.communityApi, token)
  }

  async getUserByUsername(username: string): Promise<DeliusUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()

    logger.info({ username }, 'getting user details')
    return (await this.restClient(token).get({ path: `/secure/users/${username}/details` })) as DeliusUser
  }

  async getServiceUserByCRN(crn: string): Promise<DeliusServiceUser> {
    const token = await this.hmppsAuthClient.getApiClientToken()
    logger.info({ crn }, 'getting details for offender')
    return (await this.restClient(token).get({ path: `/secure/offenders/crn/${crn}` })) as DeliusServiceUser
  }
}
