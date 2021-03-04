import { DeliusServiceUser } from '../../../services/communityApiService'

export default class ActionPlanFormPresenter {
  constructor(readonly serviceUser: DeliusServiceUser) {}

  readonly text = {
    title: 'Create action plan',
  }

  readonly actionPlanStatus = 'NOT SUBMITTED' // this doesn't need to be dynamic for now - since they are filling out the form, the thing isn't submitted.
}
