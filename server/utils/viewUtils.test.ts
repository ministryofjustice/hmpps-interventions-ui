import { ListStyle } from './summaryList'
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
      it('returns an error message object, suitable to pass as the errorMessage property in the arguments of a GOV.UK Frontend macro', () => {
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

  describe('govukErrorSummaryArgs', () => {
    describe('with null', () => {
      it('returns null', () => {
        expect(ViewUtils.govukErrorSummaryArgs(null)).toBeNull()
      })
    })

    describe('with an error', () => {
      it('returns an error summary object, suitable to pass to the govukErrorSummary macro', () => {
        expect(
          ViewUtils.govukErrorSummaryArgs([
            { field: 'field-1', message: 'Message 1' },
            { field: 'field-2', message: 'Message 2' },
          ])
        ).toEqual({
          errorList: [
            { href: '#field-1', text: 'Message 1' },
            { href: '#field-2', text: 'Message 2' },
          ],
          titleText: 'There is a problem',
        })
      })
    })
  })

  describe('summaryListArgs', () => {
    it('returns a summary list args object for passing to the govukSummaryList macro', () => {
      expect(
        ViewUtils.summaryListArgs([
          { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], listStyle: ListStyle.noMarkers },
          { key: 'Needs', lines: ['Accommodation', 'Social inclusion'], listStyle: ListStyle.bulleted },
          { key: 'Gender', lines: ['Male'] },
          { key: 'Address', lines: ['Flat 2', '27 Test Walk', 'SY16 1AQ'] },
        ])
      ).toEqual({
        rows: [
          {
            key: {
              text: 'Needs',
            },
            value: {
              html: `<ul class="govuk-list"><li>Accommodation</li>\n<li>Social inclusion</li></ul>`,
            },
          },
          {
            key: {
              text: 'Needs',
            },
            value: {
              html: `<ul class="govuk-list govuk-list--bullet"><li>Accommodation</li>\n<li>Social inclusion</li></ul>`,
            },
          },
          {
            key: {
              text: 'Gender',
            },
            value: {
              text: 'Male',
            },
          },
          {
            key: {
              text: 'Address',
            },
            value: {
              html: '<p class="govuk-body">Flat 2</p>\n<p class="govuk-body">27 Test Walk</p>\n<p class="govuk-body">SY16 1AQ</p>',
            },
          },
        ],
      })
    })
  })

  it('escapes special characters passed iin', () => {
    expect(
      ViewUtils.summaryListArgs([
        { key: 'Needs', lines: ['Accommodation&', 'Social inclusion'], listStyle: ListStyle.noMarkers },
        { key: 'Address', lines: ['Flat 2', "27 St James's Road", 'SY16 1AQ'] },
      ])
    ).toEqual({
      rows: [
        {
          key: {
            text: 'Needs',
          },
          value: {
            html: `<ul class="govuk-list"><li>Accommodation&amp;</li>\n<li>Social inclusion</li></ul>`,
          },
        },
        {
          key: {
            text: 'Address',
          },
          value: {
            html: '<p class="govuk-body">Flat 2</p>\n<p class="govuk-body">27 St James&#39;s Road</p>\n<p class="govuk-body">SY16 1AQ</p>',
          },
        },
      ],
    })
  })
})
