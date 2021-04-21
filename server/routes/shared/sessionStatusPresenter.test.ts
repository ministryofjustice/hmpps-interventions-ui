import { SessionStatus } from '../../utils/sessionStatus'
import SessionStatusPresenter from './sessionStatusPresenter'

describe(SessionStatusPresenter, () => {
  describe('text and tagClass', () => {
    it.each([
      {
        status: SessionStatus.didNotAttend,
        text: 'did not attend',
        tagClass: 'govuk-tag--purple',
      },
      {
        status: SessionStatus.scheduled,
        text: 'scheduled',
        tagClass: 'govuk-tag--blue',
      },
      {
        status: SessionStatus.completed,
        text: 'completed',
        tagClass: 'govuk-tag--green',
      },
      {
        status: SessionStatus.notScheduled,
        text: 'not scheduled',
        tagClass: 'govuk-tag--grey',
      },
    ])('returns the correct text and tag class for each status', ({ status, text, tagClass }) => {
      expect(new SessionStatusPresenter(status).text).toEqual(text)
      expect(new SessionStatusPresenter(status).tagClass).toEqual(tagClass)
    })
  })
})
