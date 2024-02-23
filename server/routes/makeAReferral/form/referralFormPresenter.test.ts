import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../../testutils/factories/draftReferral'
import referralFormSectionFactory from '../../../../testutils/factories/referralFormSection'
import cohortReferralFormSectionFactory from '../../../../testutils/factories/cohortReferralFormSection'
import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'
import ServiceCategory from '../../../models/serviceCategory'
import interventionFactory from '../../../../testutils/factories/intervention'
import draftOasysRiskInformationFactory from '../../../../testutils/factories/draftOasysRiskInformation'
import { CurrentLocationType } from '../../../models/draftReferral'

describe('ReferralFormPresenter', () => {
  describe('for a single referral', () => {
    const nonCohortIntervention = interventionFactory.build({ serviceCategories: [serviceCategoryFactory.build()] })
    const serviceCategory = nonCohortIntervention.serviceCategories[0]
    describe('for each referral form section', () => {
      describe('review service user information section', () => {
        describe('when no required values have been set', () => {
          it('should contain a "Not started" label and "confirm-probation-practitioner-details" url visible', () => {
            const referral = draftReferralFactory.unfilled().build({
              serviceCategoryIds: [serviceCategory.id],
              serviceUser: {
                firstName: 'Bob',
                lastName: 'Wills',
              },
              personCurrentLocationType: CurrentLocationType.custody,
              allocatedCommunityPP: true,
            })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.NotStarted,
                  'confirm-probation-practitioner-details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocationAndExpectedReleaseDate(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '3'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', '4', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when the referral is in community', () => {
          it('The current location and expected date is not available for community referrals', () => {
            const referral = draftReferralFactory.unfilled().build({
              serviceCategoryIds: [serviceCategory.id],
              serviceUser: {
                firstName: 'Bob',
                lastName: 'Wills',
              },
              personCurrentLocationType: CurrentLocationType.community,
              allocatedCommunityPP: true,
              isReferralReleasingIn12Weeks: null,
            })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.NotStarted,
                  'confirm-probation-practitioner-details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocation(
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '2'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', '3', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '4').build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when the referral is an unallocated and the referrer does not know the releasing date', () => {
          it('The expected date is not available for community referrals', () => {
            const referral = draftReferralFactory.unfilled().build({
              serviceCategoryIds: [serviceCategory.id],
              serviceUser: {
                firstName: 'Bob',
                lastName: 'Wills',
              },
              personCurrentLocationType: CurrentLocationType.community,
              isReferralReleasingIn12Weeks: false,
            })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.NotStarted,
                  'confirm-main-point-of-contact',
                  'Confirm main point of contact details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocation(
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '2'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', '3', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '4').build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })
        describe('when the referral is an unallocated and the referrer knows the releasing date', () => {
          it('The current location and expected date is not available for community referrals', () => {
            const referral = draftReferralFactory.unfilled().build({
              serviceCategoryIds: [serviceCategory.id],
              serviceUser: {
                firstName: 'Bob',
                lastName: 'Wills',
              },
              personCurrentLocationType: CurrentLocationType.community,
              isReferralReleasingIn12Weeks: true,
            })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.NotStarted,
                  'confirm-main-point-of-contact',
                  'Confirm main point of contact details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocationAndExpectedReleaseDate(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '2'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', '3', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '4').build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
        })

        describe('when "Confirm probation practitioner details" has been set', () => {
          it('should contain a "Not started" label and "Establishment" url visible', () => {
            const referral = draftReferralFactory.serviceUserSelected().build({
              serviceCategoryIds: [serviceCategory.id],
              ndeliusPPName: 'Bob Wills',
              personCurrentLocationType: CurrentLocationType.custody,
              allocatedCommunityPP: true,
            })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.Completed,
                  'confirm-probation-practitioner-details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocationAndExpectedReleaseDate(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  'submit-current-location'
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '3'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails('accommodation', '4', ReferralFormStatus.CannotStartYet)
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
          describe('with Establishment enabled', () => {
            it('should contain a "Not started" label and "Expected release date" url visible', () => {
              const referral = draftReferralFactory.serviceUserSelected().build({
                serviceCategoryIds: [serviceCategory.id],
                ndeliusPPName: 'Bob Wills',
                personCustodyPrisonId: 'aaa',
                personCurrentLocationType: CurrentLocationType.custody,
                allocatedCommunityPP: true,
              })
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails('accommodation', '4', ReferralFormStatus.CannotStartYet)
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '5').build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with Expected release date is enabled', () => {
            it('should contain a "Not started" label and "Personal details" url visible', () => {
              const referral = draftReferralFactory.serviceUserSelected().build({
                serviceCategoryIds: [serviceCategory.id],
                ndeliusPPName: 'Bob Wills',
                personCustodyPrisonId: 'aaa',
                expectedReleaseDate: '2023-10-10',
                personCurrentLocationType: CurrentLocationType.custody,
                allocatedCommunityPP: true,
              })
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails('accommodation', '4', ReferralFormStatus.CannotStartYet)
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
        })
        describe('when "Personal details" has been set', () => {
          it('should contain a "Not started" label and "risk-information" url visible', () => {
            const referral = draftReferralFactory
              .filledFormUpToExpectedReleaseDate()
              .build({ serviceCategoryIds: [serviceCategory.id], additionalRiskInformation: 'risk info' })
            const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
            const expected = [
              referralFormSectionFactory
                .confirmProbationPractitionerDetails(
                  ReferralFormStatus.Completed,
                  'confirm-probation-practitioner-details'
                )
                .build(),
              referralFormSectionFactory
                .confirmCurrentLocationAndExpectedReleaseDate(
                  ReferralFormStatus.Completed,
                  ReferralFormStatus.Completed,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  'submit-current-location',
                  'expected-release-date'
                )
                .build(),
              referralFormSectionFactory
                .reviewServiceUser(
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.Completed,
                  ReferralFormStatus.NotStarted,
                  referral.serviceUser.firstName,
                  referral.serviceUser.lastName,
                  '3',
                  'service-user-details',
                  'risk-information',
                  'needs-and-requirements'
                )
                .build(),
              referralFormSectionFactory
                .interventionDetails(
                  'accommodation',
                  '4',
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted,
                  ReferralFormStatus.NotStarted
                )
                .build(),
              referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
            ]
            expect(presenter.sections).toEqual(expected)
          })
          describe('with full risk information enabled', () => {
            it('should contain a "Not started" label and "needs and requirements" url visible', () => {
              const referral = draftReferralFactory.serviceUserSelected().build({
                serviceCategoryIds: [serviceCategory.id],
                ndeliusPPName: 'Bob Wills',
                personCustodyPrisonId: 'aaa',
                expectedReleaseDate: '2023-10-10',
                additionalRiskInformation: 'risk info',
                personCurrentLocationType: CurrentLocationType.custody,
                allocatedCommunityPP: true,
              })
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with Needs and requirements is set', () => {
            it('should contain a "Not started" label and "confirm relevant sentence" url visible', () => {
              const referral = draftReferralFactory.serviceUserSelected().build({
                serviceCategoryIds: [serviceCategory.id],
                ndeliusPPName: 'Bob Wills',
                personCustodyPrisonId: 'aaa',
                expectedReleaseDate: '2023-10-10',
                additionalRiskInformation: 'risk info',
                additionalNeedsInformation: 'needs info',
                accessibilityNeeds: 'needed accessibility',
                needsInterpreter: false,
                hasAdditionalResponsibilities: false,
                personCurrentLocationType: CurrentLocationType.custody,
                allocatedCommunityPP: true,
              })
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence'
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
        })
        describe('when "referral details" has been set', () => {
          describe('with relevant sentence set', () => {
            it('should contain a "Not started" label and "desired-outcomes" url visible', () => {
              const referral = draftReferralFactory
                .filledFormUpToRelevantSentence()
                .selectedServiceCategories([serviceCategory])
                .build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with desired outcomes set', () => {
            it('should contain a "Not started" label and "complexity level" url visible', () => {
              const referral = draftReferralFactory
                .filledFormUpToRelevantSentence()
                .selectedServiceCategories([serviceCategory])
                .addSelectedDesiredOutcomes([serviceCategory])
                .build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`,
                    `service-category/${referral.serviceCategoryIds![0]}/complexity-level`
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with complexity level set', () => {
            it('should contain a "Not started" label and "enforceable days" url visible', () => {
              const referral = draftReferralFactory
                .filledFormUpToRelevantSentence()
                .selectedServiceCategories([serviceCategory])
                .addSelectedDesiredOutcomes([serviceCategory])
                .addSelectedComplexityLevel([serviceCategory])
                .build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`,
                    `service-category/${referral.serviceCategoryIds![0]}/complexity-level`,
                    'enforceable-days'
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with enforceable days set', () => {
            it('should contain a "Not started" label and "service completion date" url visible', () => {
              const referral = draftReferralFactory.filledFormUpToEnforceableDays().build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`,
                    `service-category/${referral.serviceCategoryIds![0]}/complexity-level`,
                    'enforceable-days',
                    'completion-deadline'
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with service completion date set', () => {
            it('should contain a "Not started" label and "further information" url visible', () => {
              const referral = draftReferralFactory.filledFormUpToCompletionDate().build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.NotStarted,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`,
                    `service-category/${referral.serviceCategoryIds![0]}/complexity-level`,
                    'enforceable-days',
                    'completion-deadline',
                    'further-information'
                  )
                  .build(),
                referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted).build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
          describe('with further information date set', () => {
            it('should contain a "Not started" label and "check referral information" url visible', () => {
              const referral = draftReferralFactory.filledFormUpToFurtherInformation().build()
              const draftOasysRiskInformation = draftOasysRiskInformationFactory.build()
              const presenter = new ReferralFormPresenter(referral, nonCohortIntervention, draftOasysRiskInformation)
              const expected = [
                referralFormSectionFactory
                  .confirmProbationPractitionerDetails(
                    ReferralFormStatus.Completed,
                    'confirm-probation-practitioner-details'
                  )
                  .build(),
                referralFormSectionFactory
                  .confirmCurrentLocationAndExpectedReleaseDate(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    'submit-current-location',
                    'expected-release-date'
                  )
                  .build(),
                referralFormSectionFactory
                  .reviewServiceUser(
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    referral.serviceUser.firstName,
                    referral.serviceUser.lastName,
                    '3',
                    'service-user-details',
                    'risk-information',
                    'needs-and-requirements'
                  )
                  .build(),
                referralFormSectionFactory
                  .interventionDetails(
                    'accommodation',
                    '4',
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    ReferralFormStatus.Completed,
                    'relevant-sentence',
                    `service-category/${referral.serviceCategoryIds![0]}/desired-outcomes`,
                    `service-category/${referral.serviceCategoryIds![0]}/complexity-level`,
                    'enforceable-days',
                    'completion-deadline',
                    'further-information'
                  )
                  .build(),
                referralFormSectionFactory
                  .checkAllReferralInformation(ReferralFormStatus.NotStarted, '5', 'check-all-referral-information')
                  .build(),
              ]
              expect(presenter.sections).toEqual(expected)
            })
          })
        })
      })
    })
  })
  describe('for a cohort referral', () => {
    const serviceCategories: ServiceCategory[] = [
      serviceCategoryFactory.build({ name: 'accommodation', id: '2' }),
      serviceCategoryFactory.build({ name: 'social inclusion', id: '3' }),
    ]
    const cohortIntervention = interventionFactory.build({
      serviceCategories: [...serviceCategories, serviceCategoryFactory.build({ name: 'personal wellbeing', id: '1' })],
    })

    describe('select service categories section', () => {
      describe('when "needs and requirements" has been set', () => {
        it('should contain a "Not Started" label', () => {
          const referral = draftReferralFactory.filledFormUpToNeedsAndRequirements().build({ serviceCategoryIds: null })
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.NotStarted,
                'service-categories'
              )
              .build(),
            referralFormSectionFactory.disabledCohortInterventionDetails('Accommodation').build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
      describe('when service categories is empty', () => {
        it('should contain a "Not Started" label', () => {
          const referral = draftReferralFactory.filledFormUpToNeedsAndRequirements().build({ serviceCategoryIds: [] })
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.NotStarted,
                'service-categories'
              )
              .build(),
            referralFormSectionFactory.disabledCohortInterventionDetails('Accommodation').build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
    describe('service category referral details section', () => {
      describe('when "selected service categories" has been set', () => {
        it('should always be ordered in same order as selected service cateogries and "relevant-sentence" url is visible', () => {
          const disorderedServiceCategories = [serviceCategories[0], serviceCategories[1]]
          const disorderedCohortIntervention = interventionFactory.build({
            serviceCategories: disorderedServiceCategories,
          })
          const referral = draftReferralFactory
            .filledFormUpToNeedsAndRequirements()
            .selectedServiceCategories(disorderedServiceCategories)
            .build()
          const presenter = new ReferralFormPresenter(referral, disorderedCohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.NotStarted,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: null,
                    complexityLevelUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                  {
                    title: 'social inclusion',
                    complexityLevelUrl: null,
                    desiredOutcomesUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                ],
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.CannotStartYet, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "relevant sentence" has been set', () => {
        it('should contain a "Not Started" label and only the first "desired-outcome" url is visible', () => {
          const referral = draftReferralFactory.filledFormUpToRelevantSentence(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                  {
                    title: 'social inclusion',
                    complexityLevelUrl: null,
                    desiredOutcomesUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                ],
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "desired outcomes" has been set for the first service', () => {
        it('should contain a "Not Started" label and only the first "complexity-level" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes([serviceCategories[0]])
            .build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                  {
                    title: 'social inclusion',
                    complexityLevelUrl: null,
                    desiredOutcomesUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                ],
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "complexity level" has been set for the first service', () => {
        it('should contain a "Not Started" label and the second "desired outcomes" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes([serviceCategories[0]])
            .addSelectedComplexityLevel([serviceCategories[0]])
            .build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: null,
                    desiredOutcomesUrlStatus: ReferralFormStatus.NotStarted,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                ],
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "desired outcomes" has been set for the second service', () => {
        it('should contain a "Not Started" label and the second "complexity level" url is visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes(serviceCategories)
            .addSelectedComplexityLevel([serviceCategories[0]])
            .build({
              ndeliusPPName: 'Bob Wills',
              personCustodyPrisonId: 'aaa',
              expectedReleaseDate: '2023-10-10',
            })

          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.NotStarted,
                  },
                ],
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "complexity level" has been set for second service', () => {
        it('should contain a "Not Started" label and "enforceable-days" url visible', () => {
          const referral = draftReferralFactory
            .filledFormUpToRelevantSentence(serviceCategories)
            .addSelectedDesiredOutcomes(serviceCategories)
            .addSelectedComplexityLevel(serviceCategories)
            .build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                ],
                'enforceable-days',
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "enforceable days" has been set', () => {
        it('should contain a "Not Started" label and "completion-deadline" url visible', () => {
          const referral = draftReferralFactory.filledFormUpToEnforceableDays(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                ],
                'enforceable-days',
                ReferralFormStatus.Completed,
                'completion-deadline',
                ReferralFormStatus.NotStarted,
                null,
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when "date completed by" has been set', () => {
        it('should contain a "Not Started" label and "further-information" url visible', () => {
          const referral = draftReferralFactory.filledFormUpToCompletionDate(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                ],
                'enforceable-days',
                ReferralFormStatus.Completed,
                'completion-deadline',
                ReferralFormStatus.Completed,
                'further-information',
                ReferralFormStatus.NotStarted
              )
              .build(),
            referralFormSectionFactory.checkAllReferralInformation(ReferralFormStatus.NotStarted, '6').build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })

      describe('when all required values have been set', () => {
        it('should contain a "Completed" label and allow user to submit answers', () => {
          const referral = draftReferralFactory.filledFormUpToFurtherInformation(serviceCategories).build()
          const presenter = new ReferralFormPresenter(referral, cohortIntervention)
          const expected = [
            referralFormSectionFactory
              .confirmProbationPractitionerDetails(
                ReferralFormStatus.Completed,
                'confirm-probation-practitioner-details'
              )
              .build(),
            referralFormSectionFactory
              .confirmCurrentLocationAndExpectedReleaseDate(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                'submit-current-location',
                'expected-release-date'
              )
              .build(),
            referralFormSectionFactory
              .reviewServiceUser(
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                ReferralFormStatus.Completed,
                referral.serviceUser.firstName,
                referral.serviceUser.lastName,
                '3',
                'service-user-details',
                'risk-information',
                'needs-and-requirements'
              )
              .build(),
            referralFormSectionFactory
              .selectedServiceCategories(
                cohortIntervention.contractType.name,
                ReferralFormStatus.Completed,
                'service-categories'
              )
              .build(),
            cohortReferralFormSectionFactory
              .cohortInterventionDetails(
                'Accommodation',
                ReferralFormStatus.Completed,
                'relevant-sentence',
                [
                  {
                    title: 'accommodation',
                    desiredOutcomesUrl: `service-category/${serviceCategories[0].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[0].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                  {
                    title: 'social inclusion',
                    desiredOutcomesUrl: `service-category/${serviceCategories[1].id}/desired-outcomes`,
                    complexityLevelUrl: `service-category/${serviceCategories[1].id}/complexity-level`,
                    desiredOutcomesUrlStatus: ReferralFormStatus.Completed,
                    complexityLevelUrlStatus: ReferralFormStatus.Completed,
                  },
                ],
                'enforceable-days',
                ReferralFormStatus.Completed,
                'completion-deadline',
                ReferralFormStatus.Completed,
                'further-information',
                ReferralFormStatus.Completed
              )
              .build(),
            referralFormSectionFactory
              .checkAllReferralInformation(ReferralFormStatus.NotStarted, '6', 'check-all-referral-information')
              .build(),
          ]
          expect(presenter.sections).toEqual(expected)
        })
      })
    })
  })
})
