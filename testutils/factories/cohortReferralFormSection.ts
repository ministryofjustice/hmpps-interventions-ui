import { Factory } from 'fishery'
import {
  ReferralFormMultiListSectionPresenter,
  ReferralFormStatus,
} from '../../server/routes/referrals/referralFormPresenter'

class CohortReferralFormSectionFactory extends Factory<ReferralFormMultiListSectionPresenter> {
  cohortInterventionDetails(
    contractName: string,
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantSentenceUrl: string | null = null,
    cohortUrls: { title: string; desiredOutcomesUrl: string | null; complexityLevelUrl: string | null }[] | null = [],
    completionDateUrl: string | null = null,
    rarDaysUrl: string | null = null,
    furtherInformationUrl: string | null = null
  ) {
    return this.params({
      type: 'multi',
      title: `Add ${contractName} referral details`,
      number: '3',
      status: referralFormStatus,
      taskListSections: [
        {
          tasks: [
            { title: `Confirm the relevant sentence for the ${contractName} referral`, url: relevantSentenceUrl },
          ],
        },
      ]
        .concat(
          cohortUrls === null
            ? []
            : cohortUrls.map(cohortUrl => {
                return {
                  title: cohortUrl.title,
                  tasks: [
                    { title: 'Select desired outcomes', url: cohortUrl.desiredOutcomesUrl },
                    { title: 'Select required complexity level', url: cohortUrl.complexityLevelUrl },
                  ],
                }
              })
        )
        .concat([
          {
            tasks: [
              {
                title: `Enter when the ${contractName} referral need to be completed`,
                url: completionDateUrl,
              },
              { title: 'Enter enforceable days used', url: rarDaysUrl },
              { title: 'Further information for service provider', url: furtherInformationUrl },
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
  status: ReferralFormStatus.CannotStartYet,
  taskListSections: [],
}))
