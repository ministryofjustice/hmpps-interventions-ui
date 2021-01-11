import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe('ReferralFormPresenter', () => {
  describe('sections', () => {
    // This is not a very exciting test at the moment but will become more useful
    // as the task list starts to handle different referral states.

    it('returns an array of section presenters', () => {
      const serviceCategory = serviceCategoryFactory.build()
      const referral = draftReferralFactory.serviceCategorySelected(serviceCategory.id).completionDeadlineSet().build()
      const presenter = new ReferralFormPresenter(referral)

      const expected = [
        {
          type: 'single',
          title: 'Retrieve service user record',
          number: '1',
          status: ReferralFormStatus.Completed,
          tasks: [
            { title: 'Enter service user case identifier', url: null },
            { title: 'Confirm service user details', url: null },
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
          type: 'multi',
          title: 'Add intervention referrals detail',
          number: '4',
          taskListSections: [
            {
              title: 'Accommodation referral',
              number: '4.1',
              status: ReferralFormStatus.InProgress,
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
          tasks: [{ title: 'Check your answers', url: 'check-answers' }],
        },
      ]

      expect(presenter.sections).toEqual(expected)
    })
  })
})
