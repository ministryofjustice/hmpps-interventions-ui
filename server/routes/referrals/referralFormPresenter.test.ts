import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe('ReferralFormPresenter', () => {
  describe('sections', () => {
    describe('when the intervention details section has not been completed', () => {
      it('returns an array of section presenters, with a "not started" label for the intervention details', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory
          .serviceCategorySelected(serviceCategory.id)
          .completionDeadlineSet()
          .build()
        const presenter = new ReferralFormPresenter(referral, 'social inclusion')

        const expected = [
          {
            type: 'single',
            title: 'Retrieve service user record',
            number: '1',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Enter service user case identifier', url: null },
              { title: 'Confirm service user details', url: 'service-user-details' },
            ],
          },
          {
            type: 'single',
            title: 'Find and select service user interventions',
            number: '2',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Find and select service user interventions', url: null },
              { title: 'Confirm interventions', url: null },
            ],
          },
          {
            type: 'single',
            title: 'Review service user’s information',
            number: '3',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Service user’s risk information', url: 'risk-information' },
              { title: 'Service user’s needs and requirements', url: 'needs-and-requirements' },
            ],
          },
          {
            type: 'single',
            title: `Add social inclusion referral details`,
            number: '4',
            status: ReferralFormStatus.NotStarted,
            tasks: [
              { title: 'Select the relevant sentence for the social inclusion referral', url: null },
              { title: 'Select desired outcomes', url: 'desired-outcomes' },
              { title: 'Select required complexity level', url: 'complexity-level' },
              {
                title: 'What date does the social inclusion service need to be completed by?',
                url: 'completion-deadline',
              },
              { title: 'Enter RAR days used', url: 'rar-days' },
              { title: 'Further information for service provider', url: 'further-information' },
            ],
          },
          {
            type: 'single',
            title: 'Review responsible officer’s information',
            number: '5',
            status: ReferralFormStatus.NotStarted,
            tasks: [{ title: 'Responsible officer information', url: null }],
          },
          {
            type: 'single',
            title: 'Check your answers',
            number: '6',
            status: ReferralFormStatus.CannotStartYet,
            tasks: [{ title: 'Check your answers', url: null }],
          },
        ]

        expect(presenter.sections).toEqual(expected)
      })
    })

    describe('when the intervention details section has all required fields filled in', () => {
      it('returns an array of section presenters, with a "completed" label for the intervention details, and allows the user to submit the referral', () => {
        const serviceCategory = serviceCategoryFactory.build()
        const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).build({
          createdAt: '2021-01-11T10:32:12.382884Z',
          completionDeadline: '2021-04-01',
          serviceProviderId: '674b47a0-39bf-4514-82ae-61885b9c0cb4',
          serviceCategoryId: '428ee70f-3001-4399-95a6-ad25eaaede16',
          complexityLevelId: 'd0db50b0-4a50-4fc7-a006-9c97530e38b2',
          furtherInformation: 'Some information about the service user',
          desiredOutcomesIds: ['3415a6f2-38ef-4613-bb95-33355deff17e', '5352cfb6-c9ee-468c-b539-434a3e9b506e'],
          additionalNeedsInformation: null,
          accessibilityNeeds: null,
          needsInterpreter: null,
          interpreterLanguage: null,
          hasAdditionalResponsibilities: null,
          whenUnavailable: null,
          additionalRiskInformation: null,
          usingRarDays: false,
          maximumRarDays: null,
        })
        const presenter = new ReferralFormPresenter(referral, 'accommodation')

        const expected = [
          {
            type: 'single',
            title: 'Retrieve service user record',
            number: '1',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Enter service user case identifier', url: null },
              { title: 'Confirm service user details', url: 'service-user-details' },
            ],
          },
          {
            type: 'single',
            title: 'Find and select service user interventions',
            number: '2',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Find and select service user interventions', url: null },
              { title: 'Confirm interventions', url: null },
            ],
          },
          {
            type: 'single',
            title: 'Review service user’s information',
            number: '3',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Service user’s risk information', url: 'risk-information' },
              { title: 'Service user’s needs and requirements', url: 'needs-and-requirements' },
            ],
          },
          {
            type: 'single',
            title: 'Add accommodation referral details',
            number: '4',
            status: ReferralFormStatus.Completed,
            tasks: [
              { title: 'Select the relevant sentence for the accommodation referral', url: null },
              { title: 'Select desired outcomes', url: 'desired-outcomes' },
              { title: 'Select required complexity level', url: 'complexity-level' },
              {
                title: 'What date does the accommodation service need to be completed by?',
                url: 'completion-deadline',
              },
              { title: 'Enter RAR days used', url: 'rar-days' },
              { title: 'Further information for service provider', url: 'further-information' },
            ],
          },
          {
            type: 'single',
            title: 'Review responsible officer’s information',
            number: '5',
            status: ReferralFormStatus.NotStarted,
            tasks: [{ title: 'Responsible officer information', url: null }],
          },
          {
            type: 'single',
            title: 'Check your answers',
            number: '6',
            status: ReferralFormStatus.NotStarted,
            tasks: [{ title: 'Check your answers', url: 'check-answers' }],
          },
        ]

        expect(presenter.sections).toEqual(expected)
      })
    })
  })
})
