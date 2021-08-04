import BehaviourFeedbackInputsPresenter from './behaviourFeedbackInputsPresenter'

interface BehaviourText {
  title: string
  behaviourDescription: {
    question: string
    hint: string
  }
  notifyProbationPractitioner: {
    question: string
    explanation: string
    hint: string
  }
}

export interface BehaviourFeedbackPresenter {
  text: BehaviourText
  inputsPresenter: BehaviourFeedbackInputsPresenter
  backLinkHref: string | null
}
