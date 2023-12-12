import SessionFeedbackInputsPresenter from './sessionFeedbackInputsPresenter'
import SessionFeedbackQuestionnaire from './sessionFeedbackQuestionnaire'

export interface SessionFeedbackPresenter {
  text: { title: string }
  questionnaire: SessionFeedbackQuestionnaire
  inputsPresenter: SessionFeedbackInputsPresenter
  backLinkHref: string | null
}
