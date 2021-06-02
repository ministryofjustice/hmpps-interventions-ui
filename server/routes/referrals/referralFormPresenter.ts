/* eslint max-classes-per-file: 0 */
import DraftReferral from '../../models/draftReferral'
import Intervention from '../../models/intervention'
import utils from '../../utils/utils'

export default class ReferralFormPresenter {
  private readonly taskValues: TaskValues

  private readonly sectionValues: SectionValues

  private readonly formSectionBuilder: FormSectionBuilder

  constructor(private readonly referral: DraftReferral, private readonly intervention: Intervention) {
    this.taskValues = new TaskValues(referral)
    this.sectionValues = new SectionValues(this.taskValues)
    this.formSectionBuilder = new FormSectionBuilder(referral, intervention, this.taskValues, this.sectionValues)
  }

  get isCohortIntervention(): boolean {
    return this.intervention.serviceCategories.length > 1
  }

  get sections(): ReferralFormSectionPresenter[] {
    if (this.isCohortIntervention) {
      return this.formSectionBuilder.buildCohortReferralSections()
    }
    return this.formSectionBuilder.buildSingleReferralSections()
  }
}

class FormSectionBuilder {
  constructor(
    private referral: DraftReferral,
    private intervention: Intervention,
    private taskValues: TaskValues,
    private sectionValues: SectionValues
  ) {}

  buildSingleReferralSections(): ReferralFormSectionPresenter[] {
    const reviewServiceUserInformationSection = this.buildReviewServiceUserInformationSection()
    const referralDetailsSection = this.buildSingleReferralDetailsSection(reviewServiceUserInformationSection)
    const checkYourAnswersSection = this.buildCheckYourAnswersSection(referralDetailsSection, false)
    return [reviewServiceUserInformationSection, referralDetailsSection, checkYourAnswersSection]
  }

  buildCohortReferralSections() {
    const reviewServiceUserInformationSection = this.buildReviewServiceUserInformationSection()
    const selectServiceCategoriesSection = this.buildSelectServiceCategoriesSection(reviewServiceUserInformationSection)
    const referralDetailsSection = this.buildCohortReferralDetailsSection(selectServiceCategoriesSection)
    const checkYourAnswersSection = this.buildCheckYourAnswersSection(referralDetailsSection, true)
    return [
      reviewServiceUserInformationSection,
      selectServiceCategoriesSection,
      referralDetailsSection,
      checkYourAnswersSection,
    ]
  }

  private buildReviewServiceUserInformationSection(): ReferralFormSingleListSectionPresenter {
    return {
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
  }

  private buildSelectServiceCategoriesSection(
    reviewServiceUserInformationSection: ReferralFormSingleListSectionPresenter
  ): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: 'Choose service categories',
      number: '2',
      status: this.calculateStatus(
        this.sectionValues.cohortServiceCategories,
        reviewServiceUserInformationSection.status
      ),
      tasks: [
        {
          title: `Select service categories for the ${utils.convertToProperCase(
            this.intervention.contractType.name
          )} referral`,
          url: this.calculateTaskUrl('service-categories', this.taskValues.needsAndRequirements),
        },
      ],
    }
  }

  private buildSingleReferralDetailsSection(
    reviewServiceUserInformationSection: ReferralFormSingleListSectionPresenter
  ): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: `Add ${utils.convertToProperCase(this.intervention.serviceCategories[0].name)} referral details`,
      number: '2',
      status: this.calculateStatus(
        this.sectionValues.serviceCategoryReferralDetails,
        reviewServiceUserInformationSection.status!
      ),
      tasks: [
        {
          title: `Confirm the relevant sentence for the ${utils.convertToProperCase(
            this.intervention.serviceCategories[0].name
          )} referral`,
          url: this.calculateTaskUrl('relevant-sentence', this.taskValues.needsAndRequirements),
        },
        {
          title: 'Select desired outcomes',
          url: this.calculateTaskUrl(
            this.referral.serviceCategoryIds && this.referral.serviceCategoryIds.length > 0
              ? `service-category/${this.referral.serviceCategoryIds[0]}/desired-outcomes`
              : null,
            this.taskValues.relevantSentence
          ),
        },
        {
          title: 'Select required complexity level',
          url: this.calculateTaskUrl(
            this.referral.serviceCategoryIds && this.referral.serviceCategoryIds.length > 0
              ? `service-category/${this.referral.serviceCategoryIds[0]}/complexity-level`
              : null,
            this.taskValues.allDesiredOutcomes
          ),
        },
        {
          title: `Enter when the ${utils.convertToProperCase(
            this.intervention.serviceCategories[0].name
          )} service needs to be completed`,
          url: this.calculateTaskUrl('completion-deadline', this.taskValues.allComplexityLevels),
        },
        {
          title: 'Enter enforceable days used',
          url: this.calculateTaskUrl('rar-days', this.taskValues.completionDeadline),
        },
        {
          title: 'Further information for service provider',
          url: this.calculateTaskUrl('further-information', this.taskValues.rarDays),
        },
      ],
    }
  }

  private buildCohortReferralDetailsSection(
    selectServiceCategoriesSection: ReferralFormSingleListSectionPresenter
  ): ReferralFormMultiListSectionPresenter {
    return {
      type: 'multi',
      title: `Add ${utils.convertToProperCase(this.intervention.contractType.name)} referral details`,
      number: '3',
      status: this.calculateStatus(
        this.sectionValues.serviceCategoryReferralDetails,
        selectServiceCategoriesSection.status!
      ),
      taskListSections: [
        {
          tasks: [
            {
              title: `Confirm the relevant sentence for the ${utils.convertToProperCase(
                this.intervention.contractType.name
              )} referral`,
              url: this.calculateTaskUrl('relevant-sentence', this.taskValues.cohortServiceCategories),
            },
          ],
        },
      ]
        .concat(
          this.intervention.serviceCategories
            .filter(serviceCat => {
              if (this.referral.serviceCategoryIds !== null) {
                return this.referral.serviceCategoryIds.some(id => id === serviceCat.id)
              }
              return false
            })
            .map((serviceCat, index) => {
              return {
                title: utils.convertToProperCase(serviceCat.name),
                tasks: [
                  {
                    title: `Select desired outcomes`,
                    url: this.calculateTaskUrl(
                      `service-category/${serviceCat.id}/desired-outcomes`,
                      index === 0
                        ? this.taskValues.relevantSentence
                        : this.taskValues.complexityLevel(this.intervention.serviceCategories[index - 1].id)
                    ),
                  },
                  {
                    title: `Select required complexity level`,
                    url: this.calculateTaskUrl(
                      `service-category/${serviceCat.id}/complexity-level`,
                      this.taskValues.desiredOutcomes(serviceCat.id)
                    ),
                  },
                ],
              }
            })
        )
        .concat([
          {
            tasks: [
              {
                title: `Enter when the ${utils.convertToProperCase(
                  this.intervention.contractType.name
                )} referral needs to be completed`,
                url: this.calculateTaskUrl('completion-deadline', this.taskValues.allComplexityLevels),
              },
              {
                title: 'Enter enforceable days used',
                url: this.calculateTaskUrl('rar-days', this.taskValues.completionDeadline),
              },
              {
                title: 'Further information for service provider',
                url: this.calculateTaskUrl('further-information', this.taskValues.rarDays),
              },
            ],
          },
        ]),
    }
  }

  private buildCheckYourAnswersSection(
    referralDetailsSection: ReferralFormSectionPresenter,
    isCohort: boolean
  ): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: 'Check your answers',
      number: isCohort ? '4' : '3',
      status: this.calculateStatus(this.sectionValues.checkYourAnswers, referralDetailsSection.status),
      tasks: [
        {
          title: 'Check your answers',
          url: this.calculateTaskUrl('check-answers', this.taskValues.furtherInformation),
        },
      ],
    }
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

  private calculateTaskUrl(url: string | null, displayCriteria: DraftReferralValues): string | null {
    const everyFieldHasValues = displayCriteria.every(field => {
      if (field === null) {
        return false
      }
      return Array.isArray(field) ? field.length !== 0 : true
    })
    return everyFieldHasValues ? url : null
  }
}
class SectionValues {
  constructor(private taskValues: TaskValues) {}

  get reviewServiceUserInformation(): DraftReferralValues {
    return this.taskValues.serviceUserDetails && this.taskValues.riskInformation && this.taskValues.needsAndRequirements
  }

  get cohortServiceCategories(): DraftReferralValues {
    return this.taskValues.cohortServiceCategories
  }

  get serviceCategoryReferralDetails(): DraftReferralValues {
    return (
      this.taskValues.relevantSentence &&
      this.taskValues.allDesiredOutcomes &&
      this.taskValues.allComplexityLevels &&
      this.taskValues.completionDeadline &&
      this.taskValues.rarDays &&
      this.taskValues.furtherInformation
    )
  }

  get checkYourAnswers(): DraftReferralValues {
    return this.taskValues.checkAnswers
  }
}
class TaskValues {
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

  get cohortServiceCategories(): DraftReferralValues {
    if (this.referral.serviceCategoryIds === null) {
      return [null]
    }
    return this.referral.serviceCategoryIds
  }

  get allComplexityLevels(): DraftReferralValues {
    if (this.referral.serviceCategoryIds === null || this.referral.serviceCategoryIds.length === 0) {
      return [null]
    }
    const complexityLevelIds = this.referral.serviceCategoryIds.map(serviceCategoryId => {
      return this.complexityLevel(serviceCategoryId)
    })
    return complexityLevelIds.reduce((acc, list) => acc.concat(list), [])
  }

  complexityLevel(serviceCategoryId: string): DraftReferralValues {
    const complexityLevelId = this.referral.complexityLevels?.find(
      complexityLevel => complexityLevel.serviceCategoryId === serviceCategoryId
    )?.complexityLevelId
    if (complexityLevelId === undefined) {
      return [null]
    }
    return [complexityLevelId]
  }

  get allDesiredOutcomes(): DraftReferralValues {
    if (this.referral.serviceCategoryIds === null || this.referral.serviceCategoryIds.length === 0) {
      return [null]
    }
    const desiredOutcomesIds = this.referral.serviceCategoryIds.map(serviceCategoryId => {
      return this.desiredOutcomes(serviceCategoryId)
    })
    return desiredOutcomesIds.reduce((acc, list) => acc.concat(list), [])
  }

  desiredOutcomes(serviceCategoryId: string): DraftReferralValues {
    const desiredOutcomeIds = this.referral.desiredOutcomes?.find(
      desiredOutcome => desiredOutcome.serviceCategoryId === serviceCategoryId
    )?.desiredOutcomesIds
    if (desiredOutcomeIds === undefined) {
      return [null]
    }
    return desiredOutcomeIds
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
  status: ReferralFormStatus
  taskListSections: ReferralFormTaskListSectionPresenter[]
}

interface ReferralFormTaskListSectionPresenter {
  title?: string
  number?: string
  status?: ReferralFormStatus
  tasks: ReferralFormTaskPresenter[]
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
