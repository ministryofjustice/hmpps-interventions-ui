import DraftReferral from '../../models/draftReferral'

export default class ReferralFormPresenter {
  constructor(private readonly referral: DraftReferral, private readonly serviceCategoryName: string) {}

  get sections(): ReferralFormSectionPresenter[] {
    return [
      {
        type: 'single',
        title: 'Review service user’s information',
        number: '1',
        status: ReferralFormStatus.Completed,
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
        status: this.determineInterventionDetailsSectionStatus(),
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
        status: ReferralFormStatus.NotStarted,
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
        status: this.canSubmitReferral ? ReferralFormStatus.NotStarted : ReferralFormStatus.CannotStartYet,
        tasks: [
          {
            title: 'Check your answers',
            url: this.canSubmitReferral ? 'check-answers' : null,
          },
        ],
      },
    ]
  }

  private determineInterventionDetailsSectionStatus(): ReferralFormStatus {
    const hasCompletedSection = [
      this.referral.relevantSentenceId,
      this.referral.desiredOutcomesIds,
      this.referral.complexityLevelId,
      this.referral.completionDeadline,
      this.referral.usingRarDays,
    ].every(field => field !== null)

    return hasCompletedSection ? ReferralFormStatus.Completed : ReferralFormStatus.NotStarted
  }

  private get canSubmitReferral(): boolean {
    return this.determineInterventionDetailsSectionStatus() === ReferralFormStatus.Completed
  }
}

type ReferralFormSectionPresenter = ReferralFormSingleListSectionPresenter | ReferralFormMultiListSectionPresenter

interface ReferralFormSingleListSectionPresenter extends ReferralFormTaskListSectionPresenter {
  type: 'single'
}

interface ReferralFormMultiListSectionPresenter {
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
  NotStarted = 'Not started',
  CannotStartYet = 'Cannot start yet',
  InProgress = 'In progress',
  Completed = 'Completed',
}

interface ReferralFormTaskPresenter {
  title: string
  url: string | null
}
