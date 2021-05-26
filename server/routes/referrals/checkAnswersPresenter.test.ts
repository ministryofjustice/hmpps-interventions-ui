import CheckAnswersPresenter from './checkAnswersPresenter'
import draftReferralFactory from '../../../testutils/factories/draftReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import { ListStyle } from '../../utils/summaryList'

describe(CheckAnswersPresenter, () => {
  describe('serviceUserDetailsSection', () => {
    const referral = draftReferralFactory.build({
      serviceUser: {
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
      },
    })
    const serviceCategory = serviceCategoryFactory.build()
    const presenter = new CheckAnswersPresenter(referral, serviceCategory)

    describe('title', () => {
      it('returns the section title', () => {
        expect(presenter.serviceUserDetailsSection.title).toEqual('Alex’s personal details')
      })
    })

    describe('summary', () => {
      it('returns the service user’s details', () => {
        expect(presenter.serviceUserDetailsSection.summary).toEqual([
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
        ])
      })
    })
  })
})
