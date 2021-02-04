import ServiceUserDetailsPresenter from './serviceUserDetailsPresenter'

describe(ServiceUserDetailsPresenter, () => {
  const serviceUser = {
    crn: 'X862134',
    title: 'Mr',
    firstName: 'Alex',
    lastName: 'River',
    contactDetails: {
      email: 'alex.river@example.com',
      mobile: '07123456789',
    },
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
    contactDetails: {
      mobile: null,
      email: null,
    },
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
        { key: 'CRN', lines: [serviceUser.crn], isList: false },
        { key: 'Title', lines: [serviceUser.title], isList: false },
        { key: 'First name', lines: [serviceUser.firstName], isList: false },
        { key: 'Last name', lines: [serviceUser.lastName], isList: false },
        { key: 'Date of birth', lines: [serviceUser.dateOfBirth], isList: false },
        { key: 'Gender', lines: [serviceUser.gender], isList: false },
        { key: 'Ethnicity', lines: [serviceUser.ethnicity], isList: false },
        { key: 'Preferred language', lines: [serviceUser.preferredLanguage], isList: false },
        { key: 'Religion or belief', lines: [serviceUser.religionOrBelief], isList: false },
        { key: 'Disabilities', lines: serviceUser.disabilities || [], isList: true },
      ])
    })

    it('returns an empty values in lines for nullable fields on the Service User', () => {
      const presenter = new ServiceUserDetailsPresenter(nullFieldsServiceUser)

      expect(presenter.summary).toEqual([
        { key: 'CRN', lines: ['X862134'], isList: false },
        { key: 'Title', lines: [''], isList: false },
        { key: 'First name', lines: [''], isList: false },
        { key: 'Last name', lines: [''], isList: false },
        { key: 'Date of birth', lines: [''], isList: false },
        { key: 'Gender', lines: [''], isList: false },
        { key: 'Ethnicity', lines: [''], isList: false },
        { key: 'Preferred language', lines: [''], isList: false },
        { key: 'Religion or belief', lines: [''], isList: false },
        { key: 'Disabilities', lines: [], isList: true },
      ])
    })
  })
})
