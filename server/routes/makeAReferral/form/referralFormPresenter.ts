/* eslint max-classes-per-file: 0 */
import InterventionDecorator from '../../../decorators/interventionDecorator'
import DraftReferral, { CurrentLocationType } from '../../../models/draftReferral'
import Intervention from '../../../models/intervention'
import utils from '../../../utils/utils'
import { DraftOasysRiskInformation } from '../../../models/draftOasysRiskInformation'
import config from '../../../config'

export default class ReferralFormPresenter {
  private readonly taskValues: TaskValues

  private readonly sectionValues: SectionValues

  private readonly formSectionBuilder: FormSectionBuilder

  readonly backLinkUrl: string

  constructor(
    private readonly referral: DraftReferral,
    private readonly intervention: Intervention,
    private readonly draftOasysRiskInformation: DraftOasysRiskInformation | null = null
  ) {
    this.taskValues = new TaskValues(referral, draftOasysRiskInformation)
    this.sectionValues = new SectionValues(this.taskValues)
    this.formSectionBuilder = new FormSectionBuilder(referral, intervention, this.taskValues, this.sectionValues)
    this.backLinkUrl =
      this.referral.isReferralReleasingIn12Weeks !== null
        ? `/referrals/${referral.id}/prison-release-form`
        : `/referrals/${referral.id}/referral-type-form`
  }

  readonly crnDescription = `${this.referral.serviceUser?.firstName} ${this.referral.serviceUser?.lastName} (CRN: ${this.referral.serviceUser?.crn})`

  readonly description = 'This information will be sent to the service provider.'

  get sections(): ReferralFormSectionPresenter[] {
    if (new InterventionDecorator(this.intervention).isCohortIntervention) {
      return this.formSectionBuilder.buildCohortReferralSections()
    }
    return this.formSectionBuilder.buildSingleReferralSections()
  }
}

class FormSectionBuilder {
  private markPersonDetailsCompleted: ReferralFormStatus = ReferralFormStatus.NotStarted

  constructor(
    private referral: DraftReferral,
    private intervention: Intervention,
    private taskValues: TaskValues,
    private sectionValues: SectionValues
  ) {}

  buildSingleReferralSections(): ReferralFormSectionPresenter[] {
    const probationPractitionerDetailSection = this.buildConfirmProbationPractitionerDetailsSection()
    const reviewServiceUserInformationSection = this.buildReviewServiceUserInformationSection()
    const referralDetailsSection = this.buildSingleReferralDetailsSection()
    const checkAllReferralInformationSection = this.buildCheckAllReferralInformationSection(
      referralDetailsSection,
      false
    )
    const referralFormSections: ReferralFormSectionPresenter[] = []
    referralFormSections.push(probationPractitionerDetailSection)

    if (
      (this.referral.allocatedCommunityPP && this.referral.personCurrentLocationType === CurrentLocationType.custody) ||
      this.referral.isReferralReleasingIn12Weeks
    ) {
      referralFormSections.push(this.buildCurrentLocationAndExpectedReleaseDateSection())
    } else if (
      !this.referral.isReferralReleasingIn12Weeks &&
      this.referral.personCurrentLocationType === CurrentLocationType.custody
    ) {
      referralFormSections.push(this.buildCurrentLocationSection())
    }
    referralFormSections.push(reviewServiceUserInformationSection)
    referralFormSections.push(referralDetailsSection)
    referralFormSections.push(checkAllReferralInformationSection)
    return referralFormSections
  }

  buildCohortReferralSections() {
    const probationPractitionerDetailSection = this.buildConfirmProbationPractitionerDetailsSection()
    const reviewServiceUserInformationSection = this.buildReviewServiceUserInformationSection()
    const selectServiceCategoriesSection = this.buildSelectServiceCategoriesSection()
    const referralDetailsSection = this.buildCohortReferralDetailsSection(selectServiceCategoriesSection)
    const checkAllReferralInformationSection = this.buildCheckAllReferralInformationSection(
      referralDetailsSection,
      true
    )
    const referralFormSections: ReferralFormSectionPresenter[] = []
    referralFormSections.push(probationPractitionerDetailSection)
    if (
      (this.referral.allocatedCommunityPP && this.referral.personCurrentLocationType === CurrentLocationType.custody) ||
      this.referral.isReferralReleasingIn12Weeks
    ) {
      referralFormSections.push(this.buildCurrentLocationAndExpectedReleaseDateSection())
    } else if (
      !this.referral.isReferralReleasingIn12Weeks &&
      this.referral.personCurrentLocationType === CurrentLocationType.custody
    ) {
      referralFormSections.push(this.buildCurrentLocationSection())
    }
    referralFormSections.push(reviewServiceUserInformationSection)
    referralFormSections.push(selectServiceCategoriesSection)
    referralFormSections.push(referralDetailsSection)
    referralFormSections.push(checkAllReferralInformationSection)
    return referralFormSections
  }

  private buildReviewServiceUserInformationSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: `Review ${utils.convertToTitleCase(
        `${this.referral.serviceUser.firstName} ${this.referral.serviceUser.lastName}`
      )}'s information`,
      number: this.referral.personCurrentLocationType === CurrentLocationType.custody ? '3' : '2',
      tasks: [
        {
          title: 'Personal details',
          url: this.calculateTaskUrl('service-user-details', this.calculateDraftReferralValue),
          status: this.calculateStatus(this.taskValues.needsAndRequirements),
        },
        {
          title: 'Risk information',
          url: this.calculateTaskUrl('risk-information', this.taskValues.riskInformation),
          status: this.calculateStatus(this.taskValues.riskInformation),
        },
        {
          title: 'Needs and requirements',
          url: this.calculateTaskUrl('needs-and-requirements', this.taskValues.riskInformation),
          status: this.calculateStatus(this.taskValues.needsAndRequirements),
        },
      ],
    }
  }

  private get calculateDraftReferralValue(): DraftReferralValues {
    if (this.referral.isReferralReleasingIn12Weeks !== null && this.referral.isReferralReleasingIn12Weeks) {
      return this.taskValues.expectedReleaseDateDetails
    }
    if (this.referral.isReferralReleasingIn12Weeks !== null && !this.referral.isReferralReleasingIn12Weeks) {
      return this.taskValues.currentLocationDetails
    }
    if (this.referral.personCurrentLocationType === CurrentLocationType.custody) {
      return this.taskValues.expectedReleaseDateDetails
    }
    return this.sectionValues.reviewProbationPractitionerInformation
  }

  private buildConfirmProbationPractitionerDetailsSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: this.referral.allocatedCommunityPP
        ? 'Confirm probation practitioner details'
        : 'Confirm main point of contact details',
      number: '1',
      tasks: [
        {
          title: 'Name, email address and location',
          url: this.referral.allocatedCommunityPP
            ? 'confirm-probation-practitioner-details'
            : 'confirm-main-point-of-contact',
          status: this.referral.allocatedCommunityPP
            ? this.calculateStatus(this.sectionValues.reviewProbationPractitionerInformation)
            : this.calculateStatus(this.sectionValues.reviewMainPointOfContactDetails),
        },
      ],
    }
  }

  private buildCurrentLocationAndExpectedReleaseDateSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: `Confirm ${utils.convertToTitleCase(
        `${this.referral.serviceUser.firstName} ${this.referral.serviceUser.lastName}`
      )}'s location and expected release date`,
      number: '2',
      tasks: [
        {
          title: 'Establishment',
          url: this.calculateTaskUrl(
            'submit-current-location',
            this.referral.isReferralReleasingIn12Weeks === null
              ? this.taskValues.probationPractitionerDetails
              : this.taskValues.mainPointOfContactDetails
          ),
          status: this.calculateStatus(this.taskValues.currentLocationDetails),
        },
        {
          title: 'Expected release date',
          url: this.calculateTaskUrl('expected-release-date', this.taskValues.currentLocationDetails),
          status: this.calculateStatus(this.taskValues.expectedReleaseDateDetails),
        },
      ],
    }
  }

  private buildCurrentLocationSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: `Confirm ${utils.convertToTitleCase(
        `${this.referral.serviceUser.firstName} ${this.referral.serviceUser.lastName}`
      )}'s location`,
      number: '2',
      tasks: [
        {
          title: 'Establishment',
          url: this.calculateTaskUrl(
            'submit-current-location',
            this.referral.isReferralReleasingIn12Weeks === null
              ? this.taskValues.probationPractitionerDetails
              : this.taskValues.mainPointOfContactDetails
          ),
          status: this.calculateStatus(this.taskValues.currentLocationDetails),
        },
      ],
    }
  }

  private buildSelectServiceCategoriesSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: 'Choose service types',
      number: this.referral.personCurrentLocationType === CurrentLocationType.custody ? '4' : '3',
      tasks: [
        {
          title: `Select service types for the ${utils.convertToProperCase(
            this.intervention.contractType.name
          )} referral`,
          url: this.calculateTaskUrl('service-categories', this.taskValues.needsAndRequirements),
          status: this.calculateTaskStatus(
            this.sectionValues.cohortServiceCategories,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
      ],
    }
  }

  private buildSingleReferralDetailsSection(): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: `Add ${utils.convertToProperCase(this.intervention.serviceCategories[0].name)} referral details`,
      number: this.referral.personCurrentLocationType === CurrentLocationType.custody ? '4' : '3',
      tasks: [
        {
          title: `Confirm the relevant sentence for the ${utils.convertToProperCase(
            this.intervention.serviceCategories[0].name
          )} referral`,
          url: this.calculateTaskUrl('relevant-sentence', this.taskValues.needsAndRequirements),
          status: this.calculateTaskStatus(
            this.taskValues.relevantSentence,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
        {
          title: 'Select desired outcomes',
          url: this.calculateTaskUrl(
            this.referral.serviceCategoryIds && this.referral.serviceCategoryIds.length > 0
              ? `service-category/${this.referral.serviceCategoryIds[0]}/desired-outcomes`
              : null,
            this.taskValues.relevantSentence
          ),
          status: this.calculateTaskStatus(
            this.taskValues.allDesiredOutcomes,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
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
          status: this.calculateTaskStatus(
            this.taskValues.allComplexityLevels,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
        {
          title: 'Enter enforceable days used',
          url: this.calculateTaskUrl('enforceable-days', this.taskValues.allComplexityLevels),
          status: this.calculateTaskStatus(
            this.taskValues.enforceableDays,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
        {
          title: `Enter when the ${utils.convertToProperCase(
            this.intervention.serviceCategories[0].name
          )} service needs to be completed`,
          url: this.calculateTaskUrl('completion-deadline', this.taskValues.enforceableDays),
          status: this.calculateTaskStatus(
            this.taskValues.completionDeadline,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
        {
          title: 'Reason for referral and further information for service provider',
          url: this.calculateTaskUrl('reason-for-referral', this.taskValues.completionDeadline),
          status: this.calculateTaskStatus(
            this.taskValues.reasonForReferral,
            this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
          ),
        },
      ],
    }
  }

  private buildCohortReferralDetailsSection(
    selectServiceCategoriesSection: ReferralFormSingleListSectionPresenter
  ): ReferralFormSectionPresenter {
    if (selectServiceCategoriesSection.tasks[0].status !== ReferralFormStatus.Completed) {
      return {
        type: 'single',
        title: `Add ${utils.convertToProperCase(this.intervention.contractType.name)} referral details`,
        number: this.referral.personCurrentLocationType === CurrentLocationType.custody ? '5' : '4',
        tasks: [
          {
            title: 'Details of this part will depend on the services you choose',
            url: null,
            status: ReferralFormStatus.CannotStartYet,
          },
        ],
      }
    }
    return {
      type: 'multi',
      title: `Add ${utils.convertToProperCase(this.intervention.contractType.name)} referral details`,
      number: this.referral.personCurrentLocationType === CurrentLocationType.custody ? '5' : '4',
      taskListSections: [
        {
          tasks: [
            {
              title: `Confirm the relevant sentence for the ${utils.convertToProperCase(
                this.intervention.contractType.name
              )} referral`,
              url: this.calculateTaskUrl('relevant-sentence', this.taskValues.cohortServiceCategories),
              status: this.calculateTaskStatus(
                this.taskValues.relevantSentence,
                this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
              ),
            },
          ],
        },
      ]
        .concat(
          this.intervention.serviceCategories
            .sort((a, b) => a.id.localeCompare(b.id))
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
                        : this.taskValues.complexityLevel(
                            this.referral.serviceCategoryIds!.sort((a, b) => a.localeCompare(b))[index - 1]
                          )
                    ),
                    status: this.calculateTaskStatus(
                      this.taskValues.desiredOutcomes(`${serviceCat.id}`),
                      this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
                    ),
                  },
                  {
                    title: `Select required complexity level`,
                    url: this.calculateTaskUrl(
                      `service-category/${serviceCat.id}/complexity-level`,
                      this.taskValues.desiredOutcomes(serviceCat.id)
                    ),
                    status: this.calculateTaskStatus(
                      this.taskValues.complexityLevel(`${serviceCat.id}`),
                      this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
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
                title: 'Enter enforceable days used',
                url: this.calculateTaskUrl('enforceable-days', this.taskValues.allComplexityLevels),
                status: this.calculateTaskStatus(
                  this.taskValues.enforceableDays,
                  this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
                ),
              },
              {
                title: `Enter when the ${utils.convertToProperCase(
                  this.intervention.contractType.name
                )} referral needs to be completed`,
                url: this.calculateTaskUrl('completion-deadline', this.taskValues.enforceableDays),
                status: this.calculateTaskStatus(
                  this.taskValues.completionDeadline,
                  this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
                ),
              },
              {
                title: 'Reason for referral and further information for service provider',
                url: this.calculateTaskUrl('reason-for-referral', this.taskValues.completionDeadline),
                status: this.calculateTaskStatus(
                  this.taskValues.reasonForReferral,
                  this.buildReviewServiceUserInformationSection().tasks.flatMap(it => it.status!)
                ),
              },
            ],
          },
        ]),
    }
  }

  private buildCheckAllReferralInformationSection(
    referralDetailsSection: ReferralFormSectionPresenter,
    isCohort: boolean
  ): ReferralFormSingleListSectionPresenter {
    return {
      type: 'single',
      title: 'Check all referral information and submit referral',
      number: this.calculateTheOrderNumber(isCohort),
      tasks: [
        {
          title: 'Check referral information',
          url: this.calculateTaskUrl('check-all-referral-information', this.taskValues.reasonForReferral),
          status: this.calculateTaskStatus(
            this.sectionValues.checkAllReferralInformation,
            this.retrieveStatus(isCohort)
          ),
        },
      ],
    }
  }

  private calculateTheOrderNumber(isCohort: boolean) {
    if (isCohort && this.referral.personCurrentLocationType === CurrentLocationType.custody) {
      return '6'
    }
    if (
      (isCohort && this.referral.personCurrentLocationType === CurrentLocationType.community) ||
      this.referral.personCurrentLocationType === CurrentLocationType.custody
    ) {
      return '5'
    }
    return '4'
  }

  private retrieveStatus(isCohort: boolean): ReferralFormStatus[] {
    if (isCohort) {
      const cohortReferralDetailsSection = this.buildCohortReferralDetailsSection(
        this.buildSelectServiceCategoriesSection()
      )
      if (cohortReferralDetailsSection.type === 'single') {
        return cohortReferralDetailsSection.tasks.flatMap(it => it.status!)
      }
      return cohortReferralDetailsSection.taskListSections.flatMap(it => it.tasks.flatMap(task => task.status!))
    }
    return this.buildSingleReferralDetailsSection().tasks.flatMap(it => it.status!)
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

  private calculateTaskStatus(
    draftReferralValues: DraftReferralValues,
    previousSectionStatuses: ReferralFormStatus[]
  ): ReferralFormStatus {
    const allFieldStatuses = previousSectionStatuses.every(
      status => status === ReferralFormStatus.NotStarted || status === ReferralFormStatus.CannotStartYet
    )
    if (allFieldStatuses) return ReferralFormStatus.CannotStartYet
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
    if (config.featureFlags.custodyLocationEnabled) {
      return (
        this.taskValues.serviceUserDetails &&
        this.taskValues.riskInformation &&
        this.taskValues.needsAndRequirements &&
        this.taskValues.currentLocation
      )
    }
    return this.taskValues.serviceUserDetails && this.taskValues.riskInformation && this.taskValues.needsAndRequirements
  }

  get reviewProbationPractitionerInformation(): DraftReferralValues {
    return this.taskValues.probationPractitionerDetails
  }

  get reviewMainPointOfContactDetails(): DraftReferralValues {
    return this.taskValues.mainPointOfContactDetails
  }

  get cohortServiceCategories(): DraftReferralValues {
    return this.taskValues.cohortServiceCategories
  }

  get serviceCategoryReferralDetails(): DraftReferralValues {
    return (
      this.taskValues.relevantSentence &&
      this.taskValues.allDesiredOutcomes &&
      this.taskValues.allComplexityLevels &&
      this.taskValues.enforceableDays &&
      this.taskValues.completionDeadline &&
      this.taskValues.furtherInformation
    )
  }

  get checkAllReferralInformation(): DraftReferralValues {
    return this.taskValues.checkAllReferralInformation
  }
}
class TaskValues {
  constructor(
    private referral: DraftReferral,
    private draftOasysRiskInfo: DraftOasysRiskInformation | null | undefined
  ) {}

  get serviceUserDetails(): DraftReferralValues {
    return [
      this.referral.serviceUser.firstName,
      this.referral.serviceUser.lastName,
      this.referral.serviceUser.dateOfBirth,
      this.referral.serviceUser.gender,
    ]
  }

  get currentLocation(): DraftReferralValues {
    return [this.referral.personCurrentLocationType]
  }

  get probationPractitionerDetails(): DraftReferralValues {
    return [this.referral.ndeliusPPName || this.referral.ppName]
  }

  get mainPointOfContactDetails(): DraftReferralValues {
    return [this.referral.ppName, this.referral.roleOrJobTitle, this.referral.ppEmailAddress]
  }

  get currentLocationDetails(): DraftReferralValues {
    return [this.referral.personCustodyPrisonId]
  }

  get expectedReleaseDateDetails(): DraftReferralValues {
    return [this.referral.expectedReleaseDate || this.referral.expectedReleaseDateMissingReason ? true : null]
  }

  // TODO: remove this.referral.additionalRiskInformation once switched over to full risk information
  get riskInformation(): DraftReferralValues {
    return [this.draftOasysRiskInfo || this.referral.additionalRiskInformation ? true : null]
  }

  get needsAndRequirements(): DraftReferralValues {
    return [
      this.referral.additionalNeedsInformation,
      this.referral.accessibilityNeeds,
      this.referral.needsInterpreter,
      this.referral.hasAdditionalResponsibilities,
    ]
  }

  get cohortServiceCategories(): DraftReferralValues {
    if (this.referral.serviceCategoryIds === null || this.referral.serviceCategoryIds.length === 0) {
      return [null]
    }
    return this.referral.serviceCategoryIds
  }

  get relevantSentence(): DraftReferralValues {
    return [this.referral.relevantSentenceId]
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

  get enforceableDays(): DraftReferralValues {
    return [this.referral.maximumEnforceableDays]
  }

  get furtherInformation(): DraftReferralValues {
    return [this.referral.furtherInformation]
  }

  get reasonForReferral(): DraftReferralValues {
    return [this.referral.reasonForReferral]
  }

  // null is used to ensure that section is never in a `completed` status. This is because there are no fields to confirm a user has checked the answers.
  get checkAllReferralInformation(): DraftReferralValues {
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
  status?: ReferralFormStatus
}

type DraftReferralValues = (string | string[] | boolean | number | null)[]
