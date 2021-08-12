import BehaviourFeedbackInputsPresenter from './behaviourFeedbackInputsPresenter'
import BehaviourFeedbackQuestionnaire from './behaviourFeedbackQuestionnaire'

export interface BehaviourFeedbackPresenter {
  text: { title: string }
  questionnaire: BehaviourFeedbackQuestionnaire
  inputsPresenter: BehaviourFeedbackInputsPresenter
  backLinkHref: string | null
}
