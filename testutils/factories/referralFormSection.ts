import { Factory } from 'fishery'
import { ReferralFormStatus, ReferralFormSectionPresenter } from '../../server/routes/referrals/referralFormPresenter'

class ReferralFormSectionFactory extends Factory<ReferralFormSectionPresenter> {
  status(referralFormStatus: ReferralFormStatus) {
    return this.params({ status: referralFormStatus })
  }

  reviewServiceUser() {
    return this.params({
      type: 'single',
      title: 'Review service user’s information',
      number: '1',
      status: ReferralFormStatus.NotStarted,
      tasks: [
        { title: 'Confirm service user’s personal details', url: 'service-user-details' },
        { title: 'Service user’s risk information', url: 'risk-information' },
        { title: 'Service user’s needs and requirements', url: 'needs-and-requirements' },
      ],
    })
  }

  interventionDetails(serviceCategoryName: string) {
    return this.params({
      type: 'single',
      title: `Add ${serviceCategoryName} referral details`,
      number: '2',
      status: ReferralFormStatus.CannotStartYet,
      tasks: [
        { title: 'Select the relevant sentence for the social inclusion referral', url: 'relevant-sentence' },
        { title: 'Select desired outcomes', url: 'desired-outcomes' },
        { title: 'Select required complexity level', url: 'complexity-level' },
        {
          title: 'What date does the social inclusion service need to be completed by?',
          url: 'completion-deadline',
        },
        { title: 'Enter RAR days used', url: 'rar-days' },
        { title: 'Further information for service provider', url: 'further-information' },
      ],
    })
  }

  responsibleOfficerDetails() {
    return this.params({
      type: 'single',
      title: 'Review responsible officer’s information',
      number: '3',
      status: ReferralFormStatus.CannotStartYet,
      tasks: [{ title: 'Responsible officer information', url: null }],
    })
  }

  checkAnswers() {
    return this.params({
      type: 'single',
      title: 'Check your answers',
      number: '4',
      status: ReferralFormStatus.CannotStartYet,
      tasks: [{ title: 'Check your answers', url: null }],
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
