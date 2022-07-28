import ChangelogPresenter from './changelogPresenter'

export default class ChangelogView {
  constructor(readonly presenter: ChangelogPresenter) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return ['amendAReferral/changelog', {}]
  }
}
