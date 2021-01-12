import { Request, Response } from 'express'
import CommunityApiService from '../services/communityApiService'
import OffenderAssessmentsApiService from '../services/offenderAssessmentsApiService'

// fixme: this is just sample code to validate secure API access
export default function IntegrationSamplesRoutes(
  communityApiService: CommunityApiService,
  offenderAssessmentsApiService: OffenderAssessmentsApiService
): {
  viewDeliusUserSample: (req: Request, res: Response) => Promise<void>
  viewOasysAssessmentSample: (req: Request, res: Response) => Promise<void>
} {
  return {
    viewDeliusUserSample: async (req: Request, res: Response) => {
      const deliusUser = await communityApiService.getUserByUsername(req.query.username as string)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(deliusUser))
    },
    viewOasysAssessmentSample: async (req: Request, res: Response) => {
      const hardcodedCRN = 'X320741'
      const assessmentSummary = await offenderAssessmentsApiService.getAssessmentByCRN(hardcodedCRN)
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(assessmentSummary))
    },
  }
}
