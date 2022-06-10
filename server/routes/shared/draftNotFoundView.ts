import { BackLinkArgs } from '../../utils/govukFrontendTypes'

type BackLink = {
  target?: string
  message?: string
}
export default class DraftNotFoundView {
  constructor(private readonly backLink?: BackLink, private readonly notFoundUserMessage?: string) {}

  get renderArgs(): [string, Record<string, unknown>] {
    return [
      'shared/draftNotFound',
      {
        backLinkArgs: this.backLinkArgs,
        notFoundUserMessage: this.notFoundUserMessage,
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
