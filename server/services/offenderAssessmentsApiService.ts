import type HmppsAuthClient from '../data/hmppsAuthClient'
import RestClient from '../data/restClient'
import config from '../config'
import logger from '../../log'

export interface OasysAssessment {
  assessmentId: number
  assessmentStatus: string
  childSafeguardingIndicated: boolean
  completed: string
  created: string
  historicStatus: string
  layer3SentencePlanNeeds: SentencePlanNeed[]
  refAssessmentId: number
  refAssessmentOasysScoringAlgorithmVersion: number
  refAssessmentVersionCode: string
  refAssessmentVersionNumber: number
  sections: Section[]
  sentence: Sentence[]
  voided: string
}

interface SentencePlanNeed {
  flaggedAsNeed: boolean
  name: string
  overThreshold: boolean
  riskOfHarm: boolean
  riskOfReoffending: boolean
  section: string
  severity: boolean
}

interface Section {
  assessmentId: number
  lowScoreAttentionNeeded: string
  questions: Record<string, unknown>[]
  refAssessmentVersionCode: string
  refSectionCode: string
  refSectionCrimNeedScoreThreshold: number
  refSectionVersionNumber: string
  sectionId: number
  sectionOgpRawScore: number
  sectionOgpWeightedScore: number
  sectionOtherRawScore: number
  sectionOtherWeightedScore: number
  sectionOvpRawScore: number
  sectionOvpWeightedScore: number
  status: string
}

interface Sentence {
  activity: string
  cja: boolean
  cjaSupervisionMonths: number
  cjaUnpaidHours: number
  custodial: true
  offenceBlockType: OffenceBlockType
  offenceDate: string
  orderType: OrderType
  sentenceCode: string
  sentenceDate: string
  sentenceDescription: string
  sentenceLengthCustodyDays: number
}

interface OffenceBlockType {
  code: string
  description: string
  shortDescription: string
}
interface OrderType {
  code: string
  description: string
  shortDescription: string
}

export default class OffenderAssessmentsApiService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  private restClient(token: string): RestClient {
    return new RestClient('Offender Assessments Api Client', config.apis.offenderAssessmentsApi, token)
  }

  async getAssessmentByCRN(crn: string): Promise<OasysAssessment> {
    const token = await this.hmppsAuthClient.getApiClientToken()

    logger.info(`getting user details for CRN ${crn}`)
    return (await this.restClient(token).get({
      path: `/offenders/crn/${crn}/assessments/latest`,
    })) as OasysAssessment
  }
}
