import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import draftActionPlan from '../../../testutils/factories/draftActionPlan'

describe(AddActionPlanActivitiesPresenter, () => {
  describe('text', () => {
    const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })

    const referralParams = {
      referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
    }

    describe('title', () => {
      it('includes the name of the service category', () => {
        const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const sentReferral = sentReferralFactory.assigned().build(referralParams)
        const actionPlan = draftActionPlan.justCreated(sentReferral.id).build()
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, socialInclusionServiceCategory, actionPlan)

        expect(presenter.text.title).toEqual('Social inclusion - create action plan')
      })
    })

    describe('subTitle', () => {
      it('includes the name of the service user', () => {
        const sentReferral = sentReferralFactory.assigned().build(referralParams)
        const actionPlan = draftActionPlan.justCreated(sentReferral.id).build()

        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory, actionPlan)

        expect(presenter.text.subTitle).toEqual('Add suggested activities to Jenny’s action plan')
      })
    })
  })

  describe('desiredOutcomes', () => {
    it('returns the desired outcomes on the Service Category that match those populated on the SentReferral', () => {
      const desiredOutcomes = [
        {
          id: '301ead30-30a4-4c7c-8296-2768abfb59b5',
          description:
            'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
        },
        {
          id: '65924ac6-9724-455b-ad30-906936291421',
          description: 'Service User makes progress in obtaining accommodation',
        },
        {
          id: '9b30ffad-dfcb-44ce-bdca-0ea49239a21a',
          description: 'Service User is helped to secure social or supported housing',
        },
        {
          id: 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d',
          description: 'Service User is helped to secure a tenancy in the private rented sector (PRS)',
        },
      ]
      const selectedDesiredOutcomesIds = [desiredOutcomes[0].id, desiredOutcomes[1].id]

      const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation', desiredOutcomes })

      const referralParams = {
        referral: {
          serviceCategoryId: serviceCategory.id,
          serviceUser: { firstName: 'Jenny', lastName: 'Jones' },
          desiredOutcomesIds: selectedDesiredOutcomesIds,
        },
      }

      const sentReferral = sentReferralFactory.assigned().build(referralParams)
      const actionPlan = draftActionPlan.justCreated(sentReferral.id).build()

      const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory, actionPlan)

      expect(presenter.desiredOutcomes).toEqual([
        {
          description:
            'All barriers, as identified in the Service User Action Plan (for example financial, behavioural, physical, mental or offence-type related), to obtaining or sustaining accommodation are successfully removed',
          addActivityAction: `/service-provider/action-plan/${actionPlan.id}/add-activity`,
          id: selectedDesiredOutcomesIds[0],
        },
        {
          description: 'Service User makes progress in obtaining accommodation',
          addActivityAction: `/service-provider/action-plan/${actionPlan.id}/add-activity`,
          id: selectedDesiredOutcomesIds[1],
        },
      ])
    })
  })
})
