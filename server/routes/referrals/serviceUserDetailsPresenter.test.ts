import { ListStyle } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'

describe(ServiceUserDetailsPresenter, () => {
  const serviceUser = {
    crn: 'X862134',
    title: 'Mr',
    firstName: 'Alex',
    lastName: 'River',
    dateOfBirth: '1980-01-01',
    gender: 'Male',
    ethnicity: 'British',
    preferredLanguage: 'English',
    religionOrBelief: 'Agnostic',
    disabilities: ['Autism spectrum condition', 'sciatica'],
  }

  const nullFieldsServiceUser = {
    crn: 'X862134',
    title: null,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    gender: null,
    ethnicity: null,
    preferredLanguage: null,
    religionOrBelief: null,
    disabilities: null,
  }

  describe('title', () => {
    it("returns a title for the page with the service user's name", () => {
      const presenter = new ServiceUserDetailsPresenter(serviceUser)

      expect(presenter.title).toEqual("Alex's information")
    })

    it("falls back to an empty string if the service user's name is null", () => {
      const presenter = new ServiceUserDetailsPresenter(nullFieldsServiceUser)

      expect(presenter.title).toEqual("Service user's information")
    })
  })

  describe('summary', () => {
    it('returns an array of summary list items for each field on the Service User', () => {
      const presenter = new ServiceUserDetailsPresenter(serviceUser)

      expect(presenter.summary).toEqual([
        { key: 'CRN', lines: ['X862134'] },
        { key: 'Title', lines: ['Mr'] },
        { key: 'First name', lines: ['Alex'] },
        { key: 'Last name', lines: ['River'] },
        { key: 'Date of birth', lines: ['1980-01-01'] },
        { key: 'Gender', lines: ['Male'] },
        { key: 'Ethnicity', lines: ['British'] },
        { key: 'Preferred language', lines: ['English'] },
        { key: 'Religion or belief', lines: ['Agnostic'] },
        { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
      ])
    })

    it('returns an empty values in lines for nullable fields on the Service User', () => {
      const presenter = new ServiceUserDetailsPresenter(nullFieldsServiceUser)

      expect(presenter.summary).toEqual([
        { key: 'CRN', lines: ['X862134'] },
        { key: 'Title', lines: [''] },
        { key: 'First name', lines: [''] },
        { key: 'Last name', lines: [''] },
        { key: 'Date of birth', lines: [''] },
        { key: 'Gender', lines: [''] },
        { key: 'Ethnicity', lines: [''] },
        { key: 'Preferred language', lines: [''] },
        { key: 'Religion or belief', lines: [''] },
        { key: 'Disabilities', lines: [], listStyle: ListStyle.noMarkers },
      ])
    })
  })
})
