import { Factory } from 'fishery'
import { ReferralFormSectionPresenter, ReferralFormStatus } from '../../server/routes/referrals/referralFormPresenter'

class ReferralFormSectionFactory extends Factory<ReferralFormSectionPresenter> {
  reviewServiceUser(
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    riskInformationUrl: string | null = null,
    needsAndRequirementsUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: 'Review service user’s information',
      number: '1',
      status: referralFormStatus,
      tasks: [
        { title: 'Confirm service user’s personal details', url: 'service-user-details' },
        { title: 'Service user’s risk information', url: riskInformationUrl },
        { title: 'Service user’s needs and requirements', url: needsAndRequirementsUrl },
      ],
    })
  }

  interventionDetails(
    serviceCategoryName: string,
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantSentenceUrl: string | null = null,
    desiredOutcomesUrl: string | null = null,
    complexityLevelUrl: string | null = null,
    completionDateUrl: string | null = null,
    rarDaysUrl: string | null = null,
    furtherInformationUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: `Add ${serviceCategoryName} referral details`,
      number: '2',
      status: referralFormStatus,
      tasks: [
        { title: 'Select the relevant sentence for the social inclusion referral', url: relevantSentenceUrl },
        { title: 'Select desired outcomes', url: desiredOutcomesUrl },
        { title: 'Select required complexity level', url: complexityLevelUrl },
        {
          title: 'What date does the social inclusion service need to be completed by?',
          url: completionDateUrl,
        },
        { title: 'Enter RAR days used', url: rarDaysUrl },
        { title: 'Further information for service provider', url: furtherInformationUrl },
      ],
    })
  }

  checkAnswers(
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    checkAnswersUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: 'Check your answers',
      number: '3',
      status: referralFormStatus,
      tasks: [{ title: 'Check your answers', url: checkAnswersUrl }],
    })
  }
}
type SectionFormType = 'single' | 'multi'
const singleSectionForm: SectionFormType = 'single'
export default ReferralFormSectionFactory.define(() => ({
  type: singleSectionForm,
  title: '',
  number: '1',
  tasks: [],
  status: ReferralFormStatus.CannotStartYet,
}))
