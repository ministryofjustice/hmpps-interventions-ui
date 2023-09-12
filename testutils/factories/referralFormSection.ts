import { Factory } from 'fishery'
import {
  ReferralFormSingleListSectionPresenter,
  ReferralFormStatus,
} from '../../server/routes/makeAReferral/form/referralFormPresenter'
import utils from '../../server/utils/utils'

class ReferralFormSectionFactory extends Factory<ReferralFormSingleListSectionPresenter> {
  confirmProbationPractitionerDetails(
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    linkUrl: string | null = null,
    title = 'Confirm probation practitioner details'
  ) {
    return this.params({
      type: 'single',
      title,
      number: '1',
      tasks: [{ title: 'Name,email address and location', url: linkUrl, status: referralFormStatus }],
    })
  }

  confirmCurrentLocationAndExpectedReleaseDate(
    establishmentReferralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    expectedReleaseDateReferralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    userFirstName: string | null = null,
    userLastName: string | null = null,
    establishmentUrl: string | null = null,
    expectedReleaseDateUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: `Confirm ${utils.convertToTitleCase(
        `${userFirstName} ${userLastName}`
      )}'s location and expected release date`,
      number: '2',
      tasks: [
        { title: 'Establishment', url: establishmentUrl, status: establishmentReferralFormStatus },
        { title: 'Expected release date', url: expectedReleaseDateUrl, status: expectedReleaseDateReferralFormStatus },
      ],
    })
  }

  confirmCurrentLocation(
    establishmentReferralFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    userFirstName: string | null = null,
    userLastName: string | null = null,
    establishmentUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: `Confirm ${utils.convertToTitleCase(`${userFirstName} ${userLastName}`)}'s location`,
      number: '2',
      tasks: [{ title: 'Establishment', url: establishmentUrl, status: establishmentReferralFormStatus }],
    })
  }

  reviewServiceUser(
    serviceUserDetailsFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    riskFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    needsAndRequirementFormStatus: ReferralFormStatus = ReferralFormStatus.NotStarted,
    userFirstName: string | null = null,
    userLastName: string | null = null,
    orderNumber = '2',
    serviceUserDetailsUrl: string | null = null,
    riskInformationUrl: string | null = null,
    needsAndRequirementsUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: `Confirm ${utils.convertToTitleCase(`${userFirstName} ${userLastName}`)}'s information`,
      number: orderNumber,
      tasks: [
        { title: 'Personal details', url: serviceUserDetailsUrl, status: serviceUserDetailsFormStatus },
        { title: 'Risk information', url: riskInformationUrl, status: riskFormStatus },
        { title: 'Needs and requirements', url: needsAndRequirementsUrl, status: needsAndRequirementFormStatus },
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
      title: 'Choose service types',
      number: '4',
      tasks: [
        {
          title: `Select service types for the ${utils.convertToProperCase(contractName)} referral`,
          url: serviceCategoriesUrl,
          status: referralFormStatus,
        },
      ],
    })
  }

  interventionDetails(
    serviceCategoryName: string,
    orderNumber = '4',
    relevantSentenceReferralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantDesiredOutcomesFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantComplexityLevelFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantEnforceableDaysFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantCompletionDeadLineFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    relevantSentenceUrl: string | null = null,
    desiredOutcomesUrl: string | null = null,
    complexityLevelUrl: string | null = null,
    enforceableDaysUrl: string | null = null,
    completionDateUrl: string | null = null,
    furtherInformationUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: `Add ${utils.convertToProperCase(serviceCategoryName)} referral details`,
      number: orderNumber,
      tasks: [
        {
          title: `Confirm the relevant sentence for the ${utils.convertToProperCase(serviceCategoryName)} referral`,
          url: relevantSentenceUrl,
          status: relevantSentenceReferralFormStatus,
        },
        { title: 'Select desired outcomes', url: desiredOutcomesUrl, status: relevantDesiredOutcomesFormStatus },
        {
          title: 'Select required complexity level',
          url: complexityLevelUrl,
          status: relevantComplexityLevelFormStatus,
        },
        { title: 'Enter enforceable days used', url: enforceableDaysUrl, status: relevantEnforceableDaysFormStatus },
        {
          title: `Enter when the ${utils.convertToProperCase(serviceCategoryName)} service needs to be completed`,
          url: completionDateUrl,
          status: relevantCompletionDeadLineFormStatus,
        },
        { title: 'Further information for service provider', url: furtherInformationUrl, status: referralFormStatus },
      ],
    })
  }

  disabledCohortInterventionDetails(contractName: string) {
    return this.params({
      type: 'single',
      title: `Add ${utils.convertToProperCase(contractName)} referral details`,
      number: '5',
      tasks: [
        {
          title: `Details of this part will depend on the services you choose`,
          url: null,
          status: ReferralFormStatus.CannotStartYet,
        },
      ],
    })
  }

  checkAllReferralInformation(
    referralFormStatus: ReferralFormStatus = ReferralFormStatus.CannotStartYet,
    sectionNumber = '5',
    checkAnswersUrl: string | null = null
  ) {
    return this.params({
      type: 'single',
      title: 'Check all referral information and submit referral',
      number: sectionNumber,
      tasks: [{ title: 'Check referral information', url: checkAnswersUrl, status: referralFormStatus }],
    })
  }
}
type SectionFormType = 'single'
const singleSectionForm: SectionFormType = 'single'

export default ReferralFormSectionFactory.define(() => ({
  type: singleSectionForm,
  title: '',
  number: '1',
  tasks: [],
}))
