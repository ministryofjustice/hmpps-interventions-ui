import MockedHmppsAuthClient from '../../../data/testutils/hmppsAuthClientSetup'
import OffenderAssessmentsApiService, { OasysAssessment } from '../../../services/offenderAssessmentsApiService'

export = class MockOffenderAssessmentsApiService extends OffenderAssessmentsApiService {
  constructor() {
    super(new MockedHmppsAuthClient())
  }

  async getAssessmentSummaryByCRN(_crn: string): Promise<OasysAssessment> {
    return {
      assessmentId: 1234,
      assessmentStatus: 'OPEN',
      assessmentType: 'LAYER_£',
      assessorName: 'Layer 3',
      childSafeguardingIndicated: true,
      completed: '2020-01-02T16:00:00',
      created: '2020-01-02T16:00:00',
      historicStatus: 'CURRENT',
      layer3SentencePlanNeeds: [
        {
          flaggedAsNeed: true,
          name: 'Accommodation',
          overThreshold: false,
          riskOfHarm: true,
          riskOfReoffending: true,
          section: 'ACCOMMODATION',
          severity: true,
        },
      ],
      refAssessmentId: 1,
      refAssessmentOasysScoringAlgorithmVersion: 1,
      refAssessmentVersionCode: 'LAYER3',
      refAssessmentVersionNumber: 1,
      sections: [
        {
          assessmentId: 0,
          lowScoreAttentionNeeded: 'Y',
          questions: [
            {
              answers: [
                {
                  displayOrder: 1,
                  freeFormText: 'Some answer',
                  oasysAnswerId: 123456,
                  ogpScore: 1,
                  ovpScore: 1,
                  qaRawScore: 2,
                  refAnswerCode: 'NO',
                  refAnswerId: 123456,
                  staticText: 123456,
                },
              ],
              displayOrder: 123456,
              displayScore: 123456,
              oasysQuestionId: 123456,
              questionText: 123456,
              refQuestionCode: 10.98,
              refQuestionId: 123456,
            },
          ],
          refAssessmentVersionCode: 'string',
          refSectionCode: 'string',
          refSectionCrimNeedScoreThreshold: 0,
          refSectionVersionNumber: 'string',
          sectionId: 0,
          sectionOgpRawScore: 0,
          sectionOgpWeightedScore: 0,
          sectionOtherRawScore: 0,
          sectionOtherWeightedScore: 0,
          sectionOvpRawScore: 0,
          sectionOvpWeightedScore: 0,
          status: 'string',
        },
      ],
      sentence: [
        {
          activity: 'string',
          cja: true,
          cjaSupervisionMonths: 0,
          cjaUnpaidHours: 0,
          custodial: true,
          offenceBlockType: {
            code: 'LAYER_3',
            description: 'Full (Layer 3)',
            shortDescription: 'Layer 3',
          },
          offenceDate: 'string',
          orderType: {
            code: 'LAYER_3',
            description: 'Full (Layer 3)',
            shortDescription: 'Layer 3',
          },
          sentenceCode: 'string',
          sentenceDate: 'string',
          sentenceDescription: 'string',
          sentenceLengthCustodyDays: 0,
        },
      ],
      voided: '2020-01-02T16:00:00',
    } as OasysAssessment
  }
}
