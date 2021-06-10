import { ListStyle } from '../../utils/summaryList'
import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'
import deliusServiceUserFactory from '../../../testutils/factories/deliusServiceUser'

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

  const deliusServiceUser = deliusServiceUserFactory.build()
  const nullFieldsDeliusServiceUser = deliusServiceUserFactory.build({
    contactDetails: { emailAddresses: null, phoneNumbers: null },
  })

  describe('title', () => {
    it("returns a title for the page with the service user's name", () => {
      const presenter = new ServiceUserDetailsPresenter(serviceUser, deliusServiceUser)

      expect(presenter.title).toEqual("Alex's information")
    })

    it("falls back to an empty string if the service user's name is null", () => {
      const presenter = new ServiceUserDetailsPresenter(nullFieldsServiceUser, nullFieldsDeliusServiceUser)

      expect(presenter.title).toEqual("Service user's information")
    })
  })

  describe('summary', () => {
    it('returns an array of summary list items for each field on the Service user', () => {
      const presenter = new ServiceUserDetailsPresenter(serviceUser)

      expect(presenter.summary).toEqual([
        { key: 'CRN', lines: ['X862134'] },
        { key: 'Title', lines: ['Mr'] },
        { key: 'First name', lines: ['Alex'] },
        { key: 'Last name', lines: ['River'] },
        { key: 'Date of birth', lines: ['1 January 1980'] },
        { key: 'Gender', lines: ['Male'] },
        { key: 'Ethnicity', lines: ['British'] },
        { key: 'Preferred language', lines: ['English'] },
        { key: 'Religion or belief', lines: ['Agnostic'] },
        { key: 'Disabilities', lines: ['Autism spectrum condition', 'sciatica'], listStyle: ListStyle.noMarkers },
        { key: 'Email address', lines: ['alex.river@example.com'], listStyle: ListStyle.bulleted },
        { key: 'Phone number', lines: ['0123456789'], listStyle: ListStyle.bulleted },
      ])
    })

    it('returns an empty values in lines for nullable fields on the Service user', () => {
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
        { key: 'Email address', lines: [], listStyle: ListStyle.bulleted },
        { key: 'Phone number', lines: [], listStyle: ListStyle.bulleted },
      ])
    })
    it('returns an empty values for phone number when number is null', () => {
      const nullNumberDeliusServiceUser = deliusServiceUserFactory.build({
        contactDetails: { emailAddresses: null, phoneNumbers: [{ number: null, type: null }] },
      })
      const presenter = new ServiceUserDetailsPresenter(nullFieldsServiceUser, nullNumberDeliusServiceUser)

      expect(presenter.summary).toContainEqual({ key: 'Phone number', lines: [], listStyle: ListStyle.bulleted })
    })
  })
})
