import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

describe(InterventionProgressPresenter, () => {
  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null)

      expect(presenter.createActionPlanFormAction).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('returns a title to be displayed', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null)

        expect(presenter.text).toMatchObject({
          title: 'Accommodation',
        })
      })
    })

    describe('actionPlanStatus', () => {
      describe('when there is no action plan', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null)

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.notSubmitted().build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan)

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has been submitted', () => {
        it('returns “Submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.submitted().build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan)

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Submitted' })
        })
      })
    })
  })

  describe('actionPlanStatusStyle', () => {
    describe('when there is no action plan', () => {
      it('returns the inactive style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null)

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan)

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.submitted().build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan)

        expect(presenter.actionPlanStatusStyle).toEqual('active')
      })
    })
  })
})
