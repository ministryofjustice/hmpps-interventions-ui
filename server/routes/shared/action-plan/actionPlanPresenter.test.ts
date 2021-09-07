import actionPlanFactory from '../../../../testutils/factories/actionPlan'
import referralFactory from '../../../../testutils/factories/sentReferral'
import ActionPlanPresenter from './actionPlanPresenter'
import InterventionProgressPresenter from '../../serviceProviderReferrals/interventionProgressPresenter'
import serviceCategoryFactory from '../../../../testutils/factories/serviceCategory'
import approvedActionPlanSummaryFactory from '../../../../testutils/factories/approvedActionPlanSummary'

describe(InterventionProgressPresenter, () => {
  const desiredOutcomes = [
    {
      id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
      description:
        'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
    },
    {
      id: '65924ac6-9724-455b-ad30-906936291421',
      description: 'Service user makes progress in obtaining accommodation',
    },
    {
      id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
      description: 'Service user is helped to secure social or supported housing',
    },
    {
      id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
      description: 'Service user is helped to secure a tenancy in the private rented sector (PRS)',
    },
  ]
  const serviceCategories = [serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })]
  const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]
  const referral = referralFactory.assigned().build({
    referral: {
      serviceCategoryIds: [serviceCategories[0].id],
      serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
      desiredOutcomes: [{ serviceCategoryId: serviceCategories[0].id, desiredOutcomesIds: selectedDesiredOutcomesIds }],
    },
  })

  describe('errorSummary', () => {
    describe('when a validation error is passed in', () => {
      it('should add the error to the error summary and field errors', () => {
        const actionPlan = actionPlanFactory.approved().build({ referralId: referral.id })
        const validationError = {
          errors: [
            {
              errorSummaryLinkedField: 'confirm-approval',
              formFields: ['confirm-approval'],
              message: 'Select the checkbox to confirm before you approve the action plan',
            },
          ],
        }
        const presenter = new ActionPlanPresenter(
          referral,
          actionPlan,
          serviceCategories,

          'service-provider',
          validationError
        )
        expect(presenter.errorSummary).toEqual([
          { field: 'confirm-approval', message: 'Select the checkbox to confirm before you approve the action plan' },
        ])
        expect(presenter.fieldErrors.confirmApproval).toEqual(
          'Select the checkbox to confirm before you approve the action plan'
        )
      })
    })
  })

  describe('desiredOutcomesByServiceCategory', () => {
    it('returns the desired outcomes on the Service Category that match those populated on the SentReferral', () => {
      const actionPlan = actionPlanFactory.justCreated(referral.id).build({ activities: [] })

      const presenter = new ActionPlanPresenter(referral, actionPlan, serviceCategories, 'service-provider')

      expect(presenter.desiredOutcomesByServiceCategory).toEqual([
        {
          serviceCategory: 'Accommodation',
          desiredOutcomes: [
            'All barriers, as identified in the Service user action plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
            'Service user makes progress in obtaining accommodation',
          ],
        },
      ])
    })
  })

  describe('orderedActivities', () => {
    it('returns the activities specified on the draft action plan in date created order', () => {
      const actionPlan = actionPlanFactory.justCreated(referral.id).build({
        activities: [
          {
            id: '1',
            description: 'description 1',
            createdAt: '2021-03-15T10:05:00Z',
          },
          {
            id: '2',
            description: 'description 2',
            createdAt: '2021-03-15T10:00:00Z',
          },
        ],
      })

      const presenter = new ActionPlanPresenter(referral, actionPlan, serviceCategories, 'probation-practitioner')
      expect(presenter.orderedActivities).toEqual([
        {
          id: '2',
          description: 'description 2',
          createdAt: '2021-03-15T10:00:00Z',
        },
        {
          id: '1',
          description: 'description 1',
          createdAt: '2021-03-15T10:05:00Z',
        },
      ])
    })
  })

  describe('probationPractitionerBlockedFromViewing', () => {
    it('should always return false for service providers', () => {
      const newActionPlan = actionPlanFactory.justCreated(referral.id).build()
      const newActionPlanPresenter = new ActionPlanPresenter(
        referral,
        newActionPlan,
        serviceCategories,
        'service-provider'
      )
      expect(newActionPlanPresenter.probationPractitionerBlockedFromViewing).toBe(false)

      const submittedActionPlan = actionPlanFactory.submitted().build()
      const submittedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'service-provider'
      )
      expect(submittedActionPlanPresenter.probationPractitionerBlockedFromViewing).toBe(false)
    })

    it('should return true for probation practitioners when the referral is unsubmitted', () => {
      const newActionPlan = actionPlanFactory.justCreated(referral.id).build()
      const newActionPlanPresenter = new ActionPlanPresenter(
        referral,
        newActionPlan,
        serviceCategories,
        'probation-practitioner'
      )
      expect(newActionPlanPresenter.probationPractitionerBlockedFromViewing).toBe(true)

      const submittedActionPlan = actionPlanFactory.submitted().build()
      const submittedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'probation-practitioner'
      )
      expect(submittedActionPlanPresenter.probationPractitionerBlockedFromViewing).toBe(false)
    })
  })

  describe('showEditButton', () => {
    it('shows for SPs when the action plan has been submitted', () => {
      const submittedActionPlan = actionPlanFactory.submitted().build()
      const submittedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'service-provider'
      )
      expect(submittedActionPlanPresenter.showEditButton).toBe(true)
    })

    it('does not show for SPs when the action plan has been approved', () => {
      const approvedActionPlan = actionPlanFactory.approved().build()
      const approvedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        approvedActionPlan,
        serviceCategories,
        'service-provider'
      )
      expect(approvedActionPlanPresenter.showEditButton).toBe(false)
    })

    it('never shows for PPs', () => {
      const submittedActionPlan = actionPlanFactory.submitted().build()
      const submittedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'probation-practitioner'
      )
      expect(submittedActionPlanPresenter.showEditButton).toBe(false)

      const approvedActionPlan = actionPlanFactory.approved().build()
      const approvedActionPlanPresenter = new ActionPlanPresenter(
        referral,
        approvedActionPlan,
        serviceCategories,
        'probation-practitioner'
      )
      expect(approvedActionPlanPresenter.showEditButton).toBe(false)
    })
  })

  describe('actionPlanVersions', () => {
    it('returns a list of created dates, version numbers, and an href for viewing the action plan (or null for the current version) for approved action plans in descending order by date', () => {
      const viewedActionPlanId = '490cc3a9-28d6-4316-8b89-92d9ccae0e1d'
      const otherActionPlanId = '820f2dfc-06ba-4719-b94f-673b3ef86cbe'
      const latestActionPlanId = 'f12a3dcd-9d8a-4bb9-b65d-b0a99d227f0e'

      const referralWithLatestActionPlan = referralFactory.assigned().build({ actionPlanId: latestActionPlanId })
      const currentlyViewedActionPlan = actionPlanFactory.submitted().build({ id: viewedActionPlanId })
      const approvedActionPlanSummaries = [
        approvedActionPlanSummaryFactory.build({
          id: viewedActionPlanId,
          approvedAt: '2021-06-10:00:00.000000Z',
        }),
        approvedActionPlanSummaryFactory.build({
          id: otherActionPlanId,
          approvedAt: '2021-06-11:00:00.000000Z',
        }),
        approvedActionPlanSummaryFactory.build({
          id: latestActionPlanId,
          approvedAt: '2021-06-12:00:00.000000Z',
        }),
      ]
      const submittedActionPlanPresenter = new ActionPlanPresenter(
        referralWithLatestActionPlan,
        currentlyViewedActionPlan,
        serviceCategories,
        'service-provider',
        null,
        approvedActionPlanSummaries
      )
      expect(submittedActionPlanPresenter.actionPlanVersions).toEqual([
        {
          approvalDate: '12 Jun 2021',
          versionNumber: 3,
          href: `/probation-practitioner/referrals/${referralWithLatestActionPlan.id}/action-plan`,
        },
        {
          approvalDate: '11 Jun 2021',
          versionNumber: 2,
          href: `/probation-practitioner/action-plan/${otherActionPlanId}`,
        },
        { approvalDate: '10 Jun 2021', versionNumber: 1, href: null },
      ])
    })
  })

  describe('showActionPlanVersions', () => {
    it('returns true when there is one or more approved versions of the action plan', () => {
      const submittedActionPlan = actionPlanFactory.build()
      const approvedActionPlanSummaries = approvedActionPlanSummaryFactory.buildList(3)

      const actionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'probation-practitioner',
        null,
        approvedActionPlanSummaries
      )

      expect(actionPlanPresenter.showActionPlanVersions).toEqual(true)
    })

    it('returns false when there are no approved versions of the action plan', () => {
      const submittedActionPlan = actionPlanFactory.build()

      const actionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'probation-practitioner',
        null,
        []
      )

      expect(actionPlanPresenter.showActionPlanVersions).toEqual(false)
    })

    it('returns false for SPs', () => {
      const submittedActionPlan = actionPlanFactory.build()
      const approvedActionPlanSummaries = approvedActionPlanSummaryFactory.buildList(3)

      const actionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'service-provider',
        null,
        approvedActionPlanSummaries
      )

      expect(actionPlanPresenter.showActionPlanVersions).toEqual(false)
    })

    it('returns false by default', () => {
      const submittedActionPlan = actionPlanFactory.build()

      const actionPlanPresenter = new ActionPlanPresenter(
        referral,
        submittedActionPlan,
        serviceCategories,
        'service-provider',
        null
      )

      expect(actionPlanPresenter.showActionPlanVersions).toEqual(false)
    })
  })
})
