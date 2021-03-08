import AddActionPlanActivitiesPresenter from './addActionPlanActivitiesPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'

describe(AddActionPlanActivitiesPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })

  const referralParams = {
    referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
  }

  describe('text', () => {
    describe('title', () => {
      it('includes the name of the service category', () => {
        const socialInclusionServiceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
        const sentReferral = sentReferralFactory.assigned().build(referralParams)
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, socialInclusionServiceCategory)

        expect(presenter.text.title).toEqual('Social inclusion - create action plan')
      })
    })

    describe('subTitle', () => {
      it('includes the name of the service user', () => {
        const sentReferral = sentReferralFactory.assigned().build(referralParams)
        const presenter = new AddActionPlanActivitiesPresenter(sentReferral, serviceCategory)

        expect(presenter.text.subTitle).toEqual('Add suggested activities to Jenny’s action plan')
      })
    })
  })
})
