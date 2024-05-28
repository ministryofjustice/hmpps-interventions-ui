import SelectExpectedProbationOfficePresenter from './selectExpectedProbationOfficePresenter'
import draftReferralFactory from '../../../../../testutils/factories/draftReferral'

describe(SelectExpectedProbationOfficePresenter, () => {
  const referral = draftReferralFactory.build({
    expectedProbationOffice: 'Norfolk',
    serviceUser: {
      crn: 'crn',
      title: null,
      firstName: 'David',
      lastName: 'Blake',
      dateOfBirth: null,
      gender: null,
      ethnicity: null,
      preferredLanguage: null,
      religionOrBelief: null,
      disabilities: null,
    },
  })
  describe('text', () => {
    it('contains a title and hint text', () => {
      const presenter = new SelectExpectedProbationOfficePresenter(
        referral,
        [
          {
            probationOfficeId: 1,
            name: 'London',
            address: '1A cross street',
            probationRegionId: '3',
            govUkURL: 'url',
            deliusCRSLocationId: '1',
          },
        ],
        false,
        null,
        null
      )

      expect(presenter.text.title).toEqual(`Confirm David Blake's expected probation office`)
      expect(presenter.text.label).toEqual('David Blake (CRN: crn)')
      expect(presenter.text.inputHeading).toEqual('Probation office')
      expect(presenter.text.hint).toEqual('Start typing then choose probation office from the list')
    })
  })

  describe('errorMessage', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new SelectExpectedProbationOfficePresenter(referral, [], false, null, null)

        expect(presenter.errorMessage).toBeNull()
      })
    })
  })

  describe('errorSummary', () => {
    describe('when no error is passed in', () => {
      it('returns null', () => {
        const presenter = new SelectExpectedProbationOfficePresenter(referral, [], false, null, null)

        expect(presenter.errorSummary).toBeNull()
      })
    })
  })

  describe('fields', () => {
    describe('updateProbationPractitionerOffice', () => {
      describe('when no probation practitioner office have been set', () => {
        const referralWithNoPPOffice = draftReferralFactory.build({
          expectedProbationOffice: '',
          serviceUser: {
            crn: 'crn',
            title: null,
            firstName: 'David',
            lastName: 'Blake',
            dateOfBirth: null,
            gender: null,
            ethnicity: null,
            preferredLanguage: null,
            religionOrBelief: null,
            disabilities: null,
          },
        })
        it('uses an empty string value as the field value', () => {
          const presenter = new SelectExpectedProbationOfficePresenter(referralWithNoPPOffice, [], false, null, null)

          expect(presenter.fields.expectedProbationOffice).toEqual('')
        })
      })

      describe('when the probation office is set', () => {
        it('when the referral already has set pp probation office and there is no user input data', () => {
          const presenter = new SelectExpectedProbationOfficePresenter(
            referral,
            [
              {
                probationOfficeId: 1,
                name: 'London',
                address: '1A cross street',
                probationRegionId: '3',
                govUkURL: 'url',
                deliusCRSLocationId: '1',
              },
            ],
            false,
            null,
            null
          )

          expect(presenter.fields.expectedProbationOffice).toEqual('Norfolk')
        })
      })

      describe('when the referral already has nDelius probation practitioner probation office is set and uses that value as the field value', () => {
        it('the pp probation office value is not changed', () => {
          const presenter = new SelectExpectedProbationOfficePresenter(referral, [], false, null, {
            'expected-probation-office': 'London',
          })
          expect(presenter.fields.expectedProbationOffice).toEqual('London')
        })
      })
    })
  })
})
