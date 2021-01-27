import utils from './utils'

const { convertToTitleCase, convertToProperCase } = utils

describe('Convert to title case', () => {
  it('null string', () => {
    expect(convertToTitleCase(null)).toEqual('')
  })
  it('empty string', () => {
    expect(convertToTitleCase('')).toEqual('')
  })
  it('Lower Case', () => {
    expect(convertToTitleCase('robert')).toEqual('Robert')
  })
  it('Upper Case', () => {
    expect(convertToTitleCase('ROBERT')).toEqual('Robert')
  })
  it('Mixed Case', () => {
    expect(convertToTitleCase('RoBErT')).toEqual('Robert')
  })
  it('Multiple words', () => {
    expect(convertToTitleCase('RobeRT SMiTH')).toEqual('Robert Smith')
  })
  it('Leading spaces', () => {
    expect(convertToTitleCase('  RobeRT')).toEqual('  Robert')
  })
  it('Trailing spaces', () => {
    expect(convertToTitleCase('RobeRT  ')).toEqual('Robert  ')
  })
  it('Hyphenated', () => {
    expect(convertToTitleCase('Robert-John SmiTH-jONes-WILSON')).toEqual('Robert-John Smith-Jones-Wilson')
  })
})

describe('Convert to proper case', () => {
  it('empty string', () => {
    expect(convertToProperCase('')).toEqual('')
  })

  it('lower case', () => {
    expect(convertToProperCase('accommodation')).toEqual('Accommodation')
  })

  it('mixed case', () => {
    expect(convertToProperCase('AccomModaTion')).toEqual('Accommodation')
  })

  it('multiple words', () => {
    expect(convertToProperCase('social inclusion')).toEqual('Social inclusion')
  })
})
