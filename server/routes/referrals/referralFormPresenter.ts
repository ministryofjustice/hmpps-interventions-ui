import { DraftReferral } from '../../services/interventionsService'

export default class ReferralFormPresenter {
  constructor(private readonly referral: DraftReferral) {}

  // This is just temporary, will remove it once we get rid of the referral ID output in the template
  get referralID(): string {
    return this.referral.id
  }

  get sections(): ReferralFormSectionPresenter[] {
    return [
      {
        type: 'single',
        title: 'Retrieve service user record',
        number: '1',
        status: ReferralFormStatus.Completed,
        tasks: [
          {
            title: 'Enter service user case identifier',
            url: null,
          },
          {
            title: 'Confirm service user details',
            url: null,
          },
        ],
      },
      {
        type: 'single',
        title: 'Find and select service user interventions',
        number: '2',
        status: ReferralFormStatus.Completed,
        tasks: [
          {
            title: 'Find and select service user interventions',
            url: null,
          },
          {
            title: 'Confirm interventions',
            url: null,
          },
        ],
      },
      {
        type: 'single',
        title: 'Review service user’s information',
        number: '3',
        status: ReferralFormStatus.Completed,
        tasks: [
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
        type: 'multi',
        title: 'Add intervention referrals detail',
        number: '4',
        taskListSections: [
          {
            title: 'Accommodation referral',
            number: '4.1',
            status: ReferralFormStatus.InProgress,
            tasks: [
              {
                title: 'Select the relevant sentence for the accommodation referral',
                url: null,
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
                title: 'What date does the accommodation service need to be completed by?',
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
        ],
      },
      {
        type: 'single',
        title: 'Review responsible officer’s information',
        number: '5',
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
        number: '6',
        status: ReferralFormStatus.CannotStartYet,
        tasks: [
          {
            title: 'Check your answers',
            url: 'check-answers',
          },
        ],
      },
    ]
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
