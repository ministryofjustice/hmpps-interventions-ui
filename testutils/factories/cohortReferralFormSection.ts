import { Factory } from 'fishery'
import {
  ReferralFormMultiListSectionPresenter,
  ReferralFormStatus,
} from '../../server/routes/makeAReferral/form/referralFormPresenter'
import utils from '../../server/utils/utils'

class CohortReferralFormSectionFactory extends Factory<ReferralFormMultiListSectionPresenter> {
  cohortInterventionDetails(
    contractName: string,
    relevantSentenceFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantSentenceUrl: string | null = null,
    cohortUrls:
      | {
          title: string
          desiredOutcomesUrl: string | null
          complexityLevelUrl: string | null
          desiredOutcomesUrlStatus: ReferralFormStatus
          complexityLevelUrlStatus: ReferralFormStatus
        }[]
      | null = [],
    enforceableDaysUrl: string | null = null,
    enforceableDaysReferralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    completionDateUrl: string | null = null,
    completionDateFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    furtherInformationUrl: string | null = null,
    furtherInformationStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet
  ) {
    return this.params({
      type: 'multi',
      title: `Add ${utils.convertToProperCase(contractName)} referral details`,
      number: '5',
      taskListSections: [
        {
          tasks: [
            {
              title: `Confirm the relevant sentence for the ${utils.convertToProperCase(contractName)} referral`,
              url: relevantSentenceUrl,
              status: relevantSentenceFormStatus,
            },
          ],
        },
      ]
        .concat(
          cohortUrls === null
            ? []
            : cohortUrls.map(cohortUrl => {
                return {
                  title: utils.convertToProperCase(cohortUrl.title),
                  tasks: [
                    {
                      title: 'Select desired outcomes',
                      url: cohortUrl.desiredOutcomesUrl,
                      status: cohortUrl.desiredOutcomesUrlStatus,
                    },
                    {
                      title: 'Select required complexity level',
                      url: cohortUrl.complexityLevelUrl,
                      status: cohortUrl.complexityLevelUrlStatus,
                    },
                  ],
                }
              })
        )
        .concat([
          {
            tasks: [
              {
                title: 'Enter enforceable days used',
                url: enforceableDaysUrl,
                status: enforceableDaysReferralFormStatus,
              },
              {
                title: `Enter when the ${utils.convertToProperCase(contractName)} referral needs to be completed`,
                url: completionDateUrl,
                status: completionDateFormStatus,
              },
              {
                title: 'Further information for service provider',
                url: furtherInformationUrl,
                status: furtherInformationStatus,
              },
            ],
          },
        ]),
    })
  }
}
type MultiFormType = 'multi'
const multiSectionForm: MultiFormType = 'multi'

export default CohortReferralFormSectionFactory.define(() => ({
  type: multiSectionForm,
  title: '',
  number: '1',
  taskListSections: [],
}))
