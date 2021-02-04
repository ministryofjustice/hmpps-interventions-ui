import StaticContentIndexPresenter from './indexPresenter'

describe(StaticContentIndexPresenter, () => {
  describe('rows', () => {
    it('returns rows to be displayed in the table', () => {
      const presenter = new StaticContentIndexPresenter([
        { path: '/foo/bar', template: 'someFolder/someFile', description: 'Some text' },
      ])

      expect(presenter.rows).toEqual([
        { href: '/foo/bar', template: 'server/views/someFolder/someFile.njk', description: 'Some text' },
      ])
    })
  })
})
