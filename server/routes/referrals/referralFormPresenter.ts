/* eslint max-classes-per-file: 0 */
import DraftReferral from '../../models/draftReferral'

export default class ReferralFormPresenter {
  private readonly taskValues: typeof ReferralFormPresenter.TaskValues.prototype

  private readonly sectionValues: typeof ReferralFormPresenter.SectionValues.prototype

  constructor(private readonly referral: DraftReferral, private readonly serviceCategoryName: string) {
    this.taskValues = new ReferralFormPresenter.TaskValues(referral)
    this.sectionValues = new ReferralFormPresenter.SectionValues(this.taskValues)
  }

  get sections(): ReferralFormSectionPresenter[] {
    const reviewServiceUserInformation: ReferralFormSingleListSectionPresenter = {
      type: 'single',
      title: 'Review service user’s information',
      number: '1',
      status: this.calculateStatus(this.sectionValues.reviewServiceUserInformation),
      tasks: [
        {
          title: 'Confirm service user’s personal details',
          url: 'service-user-details',
        },
        {
          title: 'Service user’s risk information',
          url: this.calculateTaskUrl('risk-information', this.taskValues.serviceUserDetails),
        },
        {
          title: 'Service user’s needs and requirements',
          url: this.calculateTaskUrl('needs-and-requirements', this.taskValues.riskInformation),
        },
      ],
    }
    const serviceCategoryReferralDetails: ReferralFormSingleListSectionPresenter = {
      type: 'single',
      title: `Add ${this.serviceCategoryName} referral details`,
      number: '2',
      status: this.calculateStatus(
        this.sectionValues.serviceCategoryReferralDetails,
        reviewServiceUserInformation.status
      ),
      tasks: [
        {
          title: `Select the relevant sentence for the ${this.serviceCategoryName} referral`,
          url: this.calculateTaskUrl('relevant-sentence', this.taskValues.needsAndRequirements),
        },
        {
          title: 'Select desired outcomes',
          url: this.calculateTaskUrl('desired-outcomes', this.taskValues.relevantSentence),
        },
        {
          title: 'Select required complexity level',
          url: this.calculateTaskUrl('complexity-level', this.taskValues.desiredOutcomes),
        },
        {
          title: `What date does the ${this.serviceCategoryName} service need to be completed by?`,
          url: this.calculateTaskUrl('completion-deadline', this.taskValues.complexityLevel),
        },
        {
          title: 'Enter RAR days used',
          url: this.calculateTaskUrl('rar-days', this.taskValues.completionDeadline),
        },
        {
          title: 'Further information for service provider',
          url: this.calculateTaskUrl('further-information', this.taskValues.rarDays),
        },
      ],
    }
    const checkYourAnswers: ReferralFormSingleListSectionPresenter = {
      type: 'single',
      title: 'Check your answers',
      number: '3',
      status: this.calculateStatus(this.sectionValues.checkYourAnswers, serviceCategoryReferralDetails.status),
      tasks: [
        {
          title: 'Check your answers',
          url: this.calculateTaskUrl('check-answers', this.taskValues.furtherInformation),
        },
      ],
    }
    return [reviewServiceUserInformation, serviceCategoryReferralDetails, checkYourAnswers]
  }

  private calculateTaskUrl(url: string | null, displayCriteria: DraftReferralValues): string | null {
    const everyFieldHasValues = displayCriteria.every(field => {
      if (field === null) {
        return false
      }
      return Array.isArray(field) ? field.length !== 0 : true
    })
    return everyFieldHasValues ? url : null
  }

  private calculateStatus(
    draftReferralValues: DraftReferralValues,
    previousSectionStatus: ReferralFormStatus = ReferralFormStatus.Completed
  ): ReferralFormStatus {
    if (previousSectionStatus !== ReferralFormStatus.Completed) {
      return ReferralFormStatus.CannotStartYet
    }
    const allFieldsHaveValues = draftReferralValues.every(field => {
      if (field === null) {
        return false
      }
      return Array.isArray(field) ? field.length !== 0 : true
    })
    if (allFieldsHaveValues) {
      return ReferralFormStatus.Completed
    }
    return ReferralFormStatus.NotStarted
  }

  private static SectionValues = class {
    constructor(private taskValues: typeof ReferralFormPresenter.TaskValues.prototype) {}

    get reviewServiceUserInformation(): DraftReferralValues {
      return (
        this.taskValues.serviceUserDetails && this.taskValues.riskInformation && this.taskValues.needsAndRequirements
      )
    }

    get serviceCategoryReferralDetails(): DraftReferralValues {
      return (
        this.taskValues.relevantSentence &&
        this.taskValues.desiredOutcomes &&
        this.taskValues.complexityLevel &&
        this.taskValues.completionDeadline &&
        this.taskValues.rarDays &&
        this.taskValues.furtherInformation
      )
    }

    get checkYourAnswers(): DraftReferralValues {
      return this.taskValues.checkAnswers
    }
  }

  private static TaskValues = class {
    constructor(private referral: DraftReferral) {}

    // TODO: IC-1676. We need a field to confirm that the user has "checked" service user details.
    get serviceUserDetails(): DraftReferralValues {
      return []
    }

    get riskInformation(): DraftReferralValues {
      return [this.referral.additionalRiskInformation]
    }

    get needsAndRequirements(): DraftReferralValues {
      return [
        this.referral.additionalNeedsInformation,
        this.referral.accessibilityNeeds,
        this.referral.needsInterpreter,
        this.referral.hasAdditionalResponsibilities,
      ]
    }

    get relevantSentence(): DraftReferralValues {
      return [this.referral.relevantSentenceId]
    }

    get desiredOutcomes(): DraftReferralValues {
      return [this.referral.desiredOutcomesIds]
    }

    get complexityLevel(): DraftReferralValues {
      return [this.referral.complexityLevelId]
    }

    get completionDeadline(): DraftReferralValues {
      return [this.referral.completionDeadline]
    }

    get rarDays(): DraftReferralValues {
      return [this.referral.usingRarDays]
    }

    get furtherInformation(): DraftReferralValues {
      return [this.referral.furtherInformation]
    }

    // null is used to ensure that section is never in a `completed` status. This is because there are no fields to confirm a user has checked the answers.
    get checkAnswers(): DraftReferralValues {
      return [null]
    }
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
