export default class StaticContentIndexPresenter {
  constructor(private readonly pages: { path: string; template: string; description: string }[]) {}

  get rows(): { href: string; template: string; description: string }[] {
    return this.pages.map(page => ({
      href: page.path,
      template: `server/views/${page.template}.njk`,
      description: page.description,
    }))
  }
}
