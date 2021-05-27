import { Factory } from 'fishery'
import {
  ReferralFormSingleListSectionPresenter,
  ReferralFormStatus,
} from '../../server/routes/referrals/referralFormPresenter'

class ReferralFormSectionFactory extends Factory<ReferralFormSingleListSectionPresenter> {
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

  selectedServiceCategories(
    contractName: string,
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    serviceCategoriesUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: 'Choose service categories',
      number: '2',
      status: referralFormStatus,
      tasks: [{ title: `Select service categories for the ${contractName} referral`, url: serviceCategoriesUrl }],
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
        { title: `Confirm the relevant sentence for the ${serviceCategoryName} referral`, url: relevantSentenceUrl },
        { title: 'Select desired outcomes', url: desiredOutcomesUrl },
        { title: 'Select required complexity level', url: complexityLevelUrl },
        {
          title: `Enter when the ${serviceCategoryName} service need to be completed`,
          url: completionDateUrl,
        },
        { title: 'Enter enforceable days used', url: rarDaysUrl },
        { title: 'Further information for service provider', url: furtherInformationUrl },
      ],
    })
  }

  checkAnswers(
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    checkAnswersUrl: string | null = null,
    sectionNumber = '3'
  ) {
    return this.params({
      type: 'single',
      title: 'Check your answers',
      number: sectionNumber,
      status: referralFormStatus,
      tasks: [{ title: 'Check your answers', url: checkAnswersUrl }],
    })
  }
}
type SectionFormType = 'single'
const singleSectionForm: SectionFormType = 'single'

export default ReferralFormSectionFactory.define(() => ({
  type: singleSectionForm,
  title: '',
  number: '1',
  status: ReferralFormStatus.CannotStartYet,
  tasks: [],
}))
