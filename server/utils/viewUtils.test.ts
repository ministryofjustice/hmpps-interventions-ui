import ViewUtils from './viewUtils'

describe('ViewUtils', () => {
  describe('escape', () => {
    it('escapes HTML tags', () => {
      expect(ViewUtils.escape('<ul class="foo">')).toBe('&lt;ul class=&quot;foo&quot;&gt;')
    })

    it('escapes HTML reserved characters', () => {
      expect(ViewUtils.escape('It’s a great day for you & me')).toBe('It’s a great day for you &amp; me')
    })
  })
})
