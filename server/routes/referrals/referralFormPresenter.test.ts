import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import referralFormSectionFactory from '../../../testutils/factories/referralFormSection'
import cohortReferralFormSectionFactory from '../../../testutils/factories/cohortReferralFormSection'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import ServiceCategory from '../../models/serviceCategory'

describe('ReferralFormPresenter', () => {
  describe('for a single referral', () => {
    const serviceCategory = serviceCategoryFactory.build()
    describe('for each referral form section', () => {
      describe('review service user information section', () => {
        describe('when no required values have been set', () => {
          it('should contain a "Not started" label and "server-user-details" url visible', () => {
            const referral = draftReferralFactory.unfilled().build({ serviceCategoryIds: [serviceCategory.id] })
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory.reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information').build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "Service user details" has been set', () => {
          it('should contain a "Not started" label and "risk-information" url visible', () => {
            const referral = draftReferralFactory
              .serviceUserSelected()
              .build({ serviceCategoryIds: [serviceCategory.id] })
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory.reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information').build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "risk information" has been set', () => {
          it('should contain a "Not started" label and "needs-and-requirements" url visible', () => {
            const referral = draftReferralFactory.filledFormUpToRiskInformation([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.NotStarted, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when all required values have been set', () => {
          it('should contain a "Completed" label and service category details section can be started', () => {
            const referral = draftReferralFactory.filledFormUpToNeedsAndRequirements([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence')
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
      })
      describe('service category referral details section', () => {
        describe('when "relevant sentence" has been set', () => {
          it('should contain a "Not Started" label and "complexity-level" url visible', () => {
            const referral = draftReferralFactory.filledFormUpToRelevantSentence([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.NotStarted,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`
                )
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "desired outcomes" has been set', () => {
          it('should contain a "Not Started" label and "desired-outcomes" url visible', () => {
            const referral = draftReferralFactory
              .filledFormUpToRelevantSentence([serviceCategory])
              .addSelectedDesiredOutcomes([serviceCategory])
              .build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.NotStarted,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`,
                  `service-category/${serviceCategory.id}/complexity-level`
                )
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "complexity level" has been set', () => {
          it('should contain a "Not Started" label and "completion-deadline" url visible', () => {
            const referral = draftReferralFactory
              .filledFormUpToRelevantSentence([serviceCategory])
              .addSelectedDesiredOutcomes([serviceCategory])
              .addSelectedComplexityLevel([serviceCategory])
              .build({ serviceCategoryIds: [serviceCategory.id] })
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.NotStarted,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`,
                  `service-category/${serviceCategory.id}/complexity-level`,
                  'completion-deadline'
                )
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "date completed by" has been set', () => {
          it('should contain a "Not Started" label and "rar-days" url visible', () => {
            const referral = draftReferralFactory.filledFormUpToCompletionDate([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.NotStarted,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`,
                  `service-category/${serviceCategory.id}/complexity-level`,
                  'completion-deadline',
                  'rar-days'
                )
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when "rar days" has been set', () => {
          it('should contain a "Not Started" label and "further-information" url visible', () => {
            const referral = draftReferralFactory.filledFormUpToRarDays([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.NotStarted,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`,
                  `service-category/${serviceCategory.id}/complexity-level`,
                  'completion-deadline',
                  'rar-days',
                  'further-information'
                )
                .build(),
              referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when all required values have been set', () => {
          it('should contain a "Completed" label and allow user to submit answers', () => {
            const referral = draftReferralFactory.filledFormUpToFurtherInformation([serviceCategory]).build()
            const presenter = new ReferralFormPresenter(referral, [serviceCategory])
            const expected = [
              referralFormSectionFactory
                .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  ReferralFormStatus.Completed,
                  'relevant-sentence',
                  `service-category/${serviceCategory.id}/desired-outcomes`,
                  `service-category/${serviceCategory.id}/complexity-level`,
                  'completion-deadline',
                  'rar-days',
                  'further-information'
                )
                .build(),
              referralFormSectionFactory
                .checkAnswers(ReferralFormStatus.NotStarted)
                .build({ tasks: [{ title: 'Check your answers', url: 'check-answers' }] }),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
      })
      describe('when "serviceCategoryIds" have not been set on the referral', () => {
        // TODO IC-1686: add more detail when adding links for cohort services to referral form
        it('should display an empty link for selecting desired outcomes and complexity level', () => {
          const referral = draftReferralFactory.filledFormUpToRelevantSentence([serviceCategory]).build({
            serviceCategoryIds: null,
          })

          const presenter = new ReferralFormPresenter(referral, [serviceCategory])
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            referralFormSectionFactory
              .interventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence', null, null)
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
  })
  describe('for a cohort referral', () => {
    const serviceCategories: ServiceCategory[] = [
      serviceCategoryFactory.build({ name: 'accommodation' }),
      serviceCategoryFactory.build({ name: 'social inclusion' }),
    ]
    describe('service category referral details section', () => {
      describe('when "relevant sentence" has been set', () => {
        it('should contain a "Not Started" label and only the first "complexity-level" url is visible', () => {
          const referral = draftReferralFactory.filledFormUpToRelevantSentence(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence', [
                {
                  title: 'accommodation',
                  desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                  complexityLevelUrl: null,
                },
                { title: 'social inclusion', complexityLevelUrl: null, desiredOutcomesUrl: null },
              ])
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "complexity level" has been set for the first service', () => {
        it('should contain a "Not Started" label and only the first "desired-outcomes" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes([serviceCategories[0]])
            .build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence', [
                {
                  title: 'accommodation',
                  desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                  complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                },
                { title: 'social inclusion', complexityLevelUrl: null, desiredOutcomesUrl: null },
              ])
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "desired outcomes" has been set for the first service', () => {
        it('should contain a "Not Started" label and the second "complexity-level" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes([serviceCategories[0]])
            .addSelectedComplexityLevel([serviceCategories[0]])
            .build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence', [
                {
                  title: 'accommodation',
                  desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                  complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                },
                {
                  title: 'social inclusion',
                  desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                  complexityLevelUrl: null,
                },
              ])
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "complexity level" has been set for the second service', () => {
        it('should contain a "Not Started" label and the second "desired-outcomes" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes(serviceCategories)
            .addSelectedComplexityLevel([serviceCategories[0]])
            .build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails('accommodation', ReferralFormStatus.NotStarted, 'relevant-sentence', [
                {
                  title: 'accommodation',
                  desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                  complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                },
                {
                  title: 'social inclusion',
                  desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                  complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                },
              ])
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "desired outcomes" has been set for second service', () => {
        it('should contain a "Not Started" label and "completion-deadline" url visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes(serviceCategories)
            .addSelectedComplexityLevel(serviceCategories)
            .build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'accommodation',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                  },
                ],
                'completion-deadline'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "date completed by" has been set', () => {
        it('should contain a "Not Started" label and "rar-days" url visible', () => {
          const referral = draftReferralFactory.filledFormUpToCompletionDate(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'accommodation',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                  },
                ],
                'completion-deadline',
                'rar-days'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when "rar days" has been set', () => {
        it('should contain a "Not Started" label and "further-information" url visible', () => {
          const referral = draftReferralFactory.filledFormUpToRarDays(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'accommodation',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                  },
                ],
                'completion-deadline',
                'rar-days',
                'further-information'
              )
              .build(),
            referralFormSectionFactory.checkAnswers(ReferralFormStatus.CannotStartYet).build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and allow user to submit answers', () => {
          const referral = draftReferralFactory.filledFormUpToFurtherInformation(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, serviceCategories)
          const expected = [
            referralFormSectionFactory
              .reviewServiceUser(ReferralFormStatus.Completed, 'risk-information', 'needs-and-requirements')
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                  },
                ],
                'completion-deadline',
                'rar-days',
                'further-information'
              )
              .build(),
            referralFormSectionFactory
              .checkAnswers(ReferralFormStatus.NotStarted)
              .build({ tasks: [{ title: 'Check your answers', url: 'check-answers' }] }),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
  })
})
