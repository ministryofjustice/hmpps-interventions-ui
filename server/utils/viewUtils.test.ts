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

  describe('govukErrorMessage', () => {
    describe('with a non-empty string', () => {
      it('returns an error message object', () => {
        expect(ViewUtils.govukErrorMessage('foo must be in the future')).toEqual({ text: 'foo must be in the future' })
      })
    })

    describe('with an empty string', () => {
      it('returns an error message object', () => {
        expect(ViewUtils.govukErrorMessage('')).toEqual({ text: '' })
      })
    })

    describe('with null', () => {
      it('returns null', () => {
        expect(ViewUtils.govukErrorMessage(null)).toBeNull()
      })
    })

    describe('with undefined', () => {
      it('returns null', () => {
        expect(ViewUtils.govukErrorMessage(undefined)).toBeNull()
      })
    })
  })
})
