import ReferralFormPresenter, { ReferralFormStatus } from './referralFormPresenter'

describe('ReferralFormPresenter', () => {
  describe('sections', () => {
    // This is not a very exciting test at the moment but will become more useful
    // as the task list starts to handle different referral states.

    it('returns an array of section presenters', () => {
      const presenter = new ReferralFormPresenter({
        id: '1',
        completionDeadline: '2021-03-01',
        serviceCategory: { id: 'b33c19d1-7414-4014-b543-e543e59c5b39', name: 'social inclusion' },
        complexityLevelId: null,
      })

      const expected = [
        {
          type: 'single',
          title: 'Retrieve service user record',
          number: '1',
          status: ReferralFormStatus.Completed,
          tasks: [
            { title: 'Enter service user case identifier', url: '#' },
            { title: 'Confirm service user details', url: '#' },
          ],
        },
        {
          type: 'single',
          title: 'Find and select service user interventions',
          number: '2',
          status: ReferralFormStatus.Completed,
          tasks: [
            { title: 'Find and select service user interventions', url: '#' },
            { title: 'Confirm interventions', url: '#' },
          ],
        },
        {
          type: 'single',
          title: 'Review service user’s information',
          number: '3',
          status: ReferralFormStatus.Completed,
          tasks: [
            { title: 'Service user’s risk information', url: '#' },
            { title: 'Service user’s needs and requirements', url: '#' },
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
                { title: 'Select the relevant sentence for the accommodation referral', url: '#' },
                { title: 'Select desired outcomes', url: '#' },
                { title: 'Select required complexity level', url: '#' },
                { title: 'What date does the accommodation service need to be completed by?', url: '#' },
                { title: 'Enter RAR days used', url: null },
                { title: 'Further information for service provider', url: null },
              ],
            },
            {
              title: 'Social inclusion referral',
              number: '4.2',
              status: ReferralFormStatus.NotStarted,
              tasks: [
                { title: 'Select the relevant sentence for the social inclusion referral', url: '#' },
                { title: 'Select desired outcomes', url: null },
                { title: 'Select required complexity level', url: null },
                { title: 'What date does the social inclusion service need to be completed by?', url: null },
                { title: 'Enter RAR days used', url: null },
                { title: 'Further information for service provider', url: null },
              ],
            },
          ],
        },
        {
          type: 'single',
          title: 'Review responsible officer’s information',
          number: '5',
          status: ReferralFormStatus.NotStarted,
          tasks: [{ title: 'Responsible officer information', url: '#' }],
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
})
