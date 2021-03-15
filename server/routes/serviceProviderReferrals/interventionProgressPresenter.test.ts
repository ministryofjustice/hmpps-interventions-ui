import InterventionProgressPresenter from './interventionProgressPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import serviceUserFactory from '../../../testutils/factories/deliusServiceUser'
import actionPlanFactory from '../../../testutils/factories/actionPlan'

describe(InterventionProgressPresenter, () => {
  describe('createActionPlanFormAction', () => {
    it('returns the relative URL for creating a draft action plan', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

      expect(presenter.createActionPlanFormAction).toEqual(`/service-provider/referrals/${referral.id}/action-plan`)
    })
  })

  describe('sessionTableRows', () => {
    it('returns an empty list if there are no appointments', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

      expect(presenter.sessionTableRows).toEqual([])
    })

    it('populates the table with formatted session information', () => {
      const referral = sentReferralFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [
        {
          sessionNumber: 1,
          appointmentTime: '2020-12-07T13:00:00.000000Z',
          durationInMinutes: 120,
        },
        {
          sessionNumber: 2,
          appointmentTime: null,
          durationInMinutes: null,
        },
      ])
      expect(presenter.sessionTableRows).toEqual([
        {
          sessionNumber: 1,
          appointmentTime: '2020-12-07T13:00:00.000000Z',
          tagArgs: {
            text: 'SCHEDULED',
            classes: 'govuk-tag--blue',
          },
          linkHtml: '<a class="govuk-link" href="#">Reschedule session</a>',
        },
        {
          sessionNumber: 2,
          appointmentTime: '',
          tagArgs: {
            text: 'NOT SCHEDULED',
            classes: 'govuk-tag--grey',
          },
          linkHtml: '<a class="govuk-link" href="#">Edit session details</a>',
        },
      ])
    })
  })

  describe('text', () => {
    describe('title', () => {
      it('returns a title to be displayed', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

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
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has not been submitted', () => {
        it('returns “Not submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.notSubmitted().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

          expect(presenter.text).toMatchObject({ actionPlanStatus: 'Not submitted' })
        })
      })

      describe('when the action plan has been submitted', () => {
        it('returns “Submitted”', () => {
          const referral = sentReferralFactory.build()
          const serviceCategory = serviceCategoryFactory.build()
          const actionPlan = actionPlanFactory.submitted().build()
          const serviceUser = serviceUserFactory.build()
          const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

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
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has not been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('inactive')
      })
    })

    describe('when the action plan has been submitted', () => {
      it('returns the active style', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.submitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

        expect(presenter.actionPlanStatusStyle).toEqual('active')
      })
    })
  })

  describe('allowActionPlanCreation', () => {
    describe('when there is no action plan', () => {
      it('returns true', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, null, serviceUser, [])

        expect(presenter.allowActionPlanCreation).toEqual(true)
      })
    })

    describe('when there is an action plan', () => {
      it('returns false', () => {
        const referral = sentReferralFactory.build()
        const serviceCategory = serviceCategoryFactory.build()
        const actionPlan = actionPlanFactory.notSubmitted().build()
        const serviceUser = serviceUserFactory.build()
        const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

        expect(presenter.allowActionPlanCreation).toEqual(false)
      })
    })
  })

  describe('referralAssigned', () => {
    it('returns false when the referral has no assignee', () => {
      const referral = sentReferralFactory.unassigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(false)
    })
    it('returns true when the referral has an assignee', () => {
      const referral = sentReferralFactory.assigned().build()
      const serviceCategory = serviceCategoryFactory.build()
      const actionPlan = actionPlanFactory.submitted().build()
      const serviceUser = serviceUserFactory.build()
      const presenter = new InterventionProgressPresenter(referral, serviceCategory, actionPlan, serviceUser, [])

      expect(presenter.referralAssigned).toEqual(true)
    })
  })
})
