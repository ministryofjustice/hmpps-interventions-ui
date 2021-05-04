import DraftReferral from '../../models/draftReferral'

export default class ReferralFormPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategoryName: string) {}

  get sections(): ReferralFormSectionPresenter[] {
    const serviceUserSectionFormStatus = this.referralFormStatus(this.requiredServiceUserFormValues)
    const interventionDetailsSectionFormStatus = this.referralFormStatus(
      this.requiredInterventionFormValues,
      serviceUserSectionFormStatus
    )
    const responsibleOfficerDetailsSectionFormStatus = this.referralFormStatus(
      this.requiredResponsibleOfficerFormValues,
      interventionDetailsSectionFormStatus
    )
    const checkAnswersSectionFormStatus = this.referralFormStatus(
      this.requiredCheckAnswersFormValues,
      responsibleOfficerDetailsSectionFormStatus
    )

    return [
      {
        type: 'single',
        title: 'Review service user’s information',
        number: '1',
        status: serviceUserSectionFormStatus,
        tasks: [
          {
            title: 'Confirm service user’s personal details',
            url: 'service-user-details',
          },
          {
            title: 'Service user’s risk information',
            url: 'risk-information',
          },
          {
            title: 'Service user’s needs and requirements',
            url: 'needs-and-requirements',
          },
        ],
      },
      {
        type: 'single',
        title: `Add ${this.serviceCategoryName} referral details`,
        number: '2',
        status: interventionDetailsSectionFormStatus,
        tasks: [
          {
            title: `Select the relevant sentence for the ${this.serviceCategoryName} referral`,
            url: 'relevant-sentence',
          },
          {
            title: 'Select desired outcomes',
            url: 'desired-outcomes',
          },
          {
            title: 'Select required complexity level',
            url: 'complexity-level',
          },
          {
            title: `What date does the ${this.serviceCategoryName} service need to be completed by?`,
            url: 'completion-deadline',
          },
          {
            title: 'Enter RAR days used',
            url: 'rar-days',
          },
          {
            title: 'Further information for service provider',
            url: 'further-information',
          },
        ],
      },
      {
        type: 'single',
        title: 'Review responsible officer’s information',
        number: '3',
        status: responsibleOfficerDetailsSectionFormStatus,
        tasks: [
          {
            title: 'Responsible officer information',
            url: null,
          },
        ],
      },
      {
        type: 'single',
        title: 'Check your answers',
        number: '4',
        status: checkAnswersSectionFormStatus,
        tasks: [
          {
            title: 'Check your answers',
            url: checkAnswersSectionFormStatus !== ReferralFormStatus.CannotStartYet ? 'check-answers' : null,
          },
        ],
      },
    ]
  }

  private referralFormStatus(
    draftReferralValues: DraftReferralValues,
    previousFormStatus: ReferralFormStatus = ReferralFormStatus.Completed
  ): ReferralFormStatus {
    if (previousFormStatus !== ReferralFormStatus.Completed) {
      return ReferralFormStatus.CannotStartYet
    }
    const hasCompleted = draftReferralValues.every(field => {
      if (field === null) {
        return false
      }
      return Array.isArray(field) ? field.length !== 0 : true
    })
    if (hasCompleted) {
      return ReferralFormStatus.Completed
    }
    return ReferralFormStatus.NotStarted
  }

  private get requiredServiceUserFormValues(): DraftReferralValues {
    return [
      this.referral.serviceUser.crn,
      this.referral.serviceUser.title,
      this.referral.serviceUser.firstName,
      this.referral.serviceUser.lastName,
      this.referral.serviceUser.dateOfBirth,
      this.referral.serviceUser.gender,
      this.referral.serviceUser.ethnicity,
      this.referral.serviceUser.preferredLanguage,
      this.referral.serviceUser.religionOrBelief,
      this.referral.needsInterpreter,
      this.referral.hasAdditionalResponsibilities,
    ]
  }

  private get requiredInterventionFormValues(): DraftReferralValues {
    return [
      this.referral.relevantSentenceId,
      this.referral.desiredOutcomesIds,
      this.referral.complexityLevelId,
      this.referral.completionDeadline,
      this.referral.usingRarDays,
    ]
  }

  /* TODO: Page form values need to be defined */
  private get requiredResponsibleOfficerFormValues(): DraftReferralValues {
    return []
  }

  /* TODO: Page form values need to be defined */
  private get requiredCheckAnswersFormValues(): DraftReferralValues {
    return []
  }
}

export type ReferralFormSectionPresenter =
  | ReferralFormSingleListSectionPresenter
  | ReferralFormMultiListSectionPresenter

export interface ReferralFormSingleListSectionPresenter extends ReferralFormTaskListSectionPresenter {
  type: 'single'
}

export interface ReferralFormMultiListSectionPresenter {
  type: 'multi'
  title: string
  number: string
  taskListSections: ReferralFormTaskListSectionPresenter[]
}

interface ReferralFormTaskListSectionPresenter {
  title: string
  number: string
  tasks: ReferralFormTaskPresenter[]
  status: ReferralFormStatus
}

export enum ReferralFormStatus {
  CannotStartYet = 'Cannot start yet',
  NotStarted = 'Not started',
  InProgress = 'In progress',
  Completed = 'Completed',
}

interface ReferralFormTaskPresenter {
  title: string
  url: string | null
}

type DraftReferralValues = (string | string[] | boolean | number | null)[]
