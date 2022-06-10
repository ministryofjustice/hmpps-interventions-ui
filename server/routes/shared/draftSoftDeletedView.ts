import { BackLinkArgs } from '../../utils/govukFrontendTypes'

type BackLink = {
  target?: string
  message?: string
}
export default class DraftSoftDeletedView {
  constructor(private readonly backLink?: BackLink, private readonly softDeletedUserMessage?: string) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/draftSoftDeleted',
      {
        backLinkArgs: this.backLinkArgs,
        softDeletedUserMessage: this.softDeletedUserMessage,
      },
    ]
  }

  private get backLinkArgs(): BackLinkArgs {
    return {
      text: this.backLink?.message || 'return to the dashboard',
      href: this.backLink?.target || '/',
    }
  }
}
