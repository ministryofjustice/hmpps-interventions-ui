import ChangelogPresenter from './changelogPresenter'
import changelog from '../../../../testutils/factories/changeLog'
import { FormValidationError } from '../../../utils/formValidationError'

describe('ChangeLogPresenter', () => {
  const changeLog1 = changelog.build({
    name: 'changelog 1 name',
    topic: 'changelog 1 topic',
    changedAt: 'changelog 1 changedAt',
    reasonForChange: 'changelog 1 reasonForChange',
  })
  const changeLog2 = changelog.build({
    name: 'changelog 2 name',
    topic: 'changelog 2 topic',
    changedAt: 'changelog 2 changedAt',
    reasonForChange: 'changelog 2 reasonForChange',
  })
  const changeLog3 = changelog.build({
    name: 'changelog 3 name',
    topic: 'changelog 3 topic',
    changedAt: 'changelog 3 changedAt',
    reasonForChange: 'changelog 3 reasonForChange',
  })
  const formError: FormValidationError | null = null
  describe('generated links', () => {
    it('check the value changelog object', () => {
      const presenter = new ChangelogPresenter(formError, [changeLog1, changeLog2, changeLog3])
      expect(presenter.changeLogs[0].changeLog.reasonForChange).toEqual(changeLog1.reasonForChange)
      expect(presenter.changeLogs[0].changeLog.topic).toEqual(changeLog1.topic)
      expect(presenter.changeLogs[0].changeLog.name).toEqual(changeLog1.name)
      expect(presenter.changeLogs[0].changeLog.changedAt).toEqual(changeLog1.changedAt)

      expect(presenter.changeLogs[1].changeLog.reasonForChange).toEqual(changeLog2.reasonForChange)
      expect(presenter.changeLogs[1].changeLog.topic).toEqual(changeLog2.topic)
      expect(presenter.changeLogs[1].changeLog.name).toEqual(changeLog2.name)
      expect(presenter.changeLogs[1].changeLog.changedAt).toEqual(changeLog2.changedAt)

      expect(presenter.changeLogs[2].changeLog.reasonForChange).toEqual(changeLog3.reasonForChange)
      expect(presenter.changeLogs[2].changeLog.topic).toEqual(changeLog3.topic)
      expect(presenter.changeLogs[2].changeLog.name).toEqual(changeLog3.name)
      expect(presenter.changeLogs[2].changeLog.changedAt).toEqual(changeLog3.changedAt)
    })
  })
})
