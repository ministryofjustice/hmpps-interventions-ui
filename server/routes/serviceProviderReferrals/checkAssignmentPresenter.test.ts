import CheckAssignmentPresenter from './checkAssignmentPresenter'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import hmppsAuthUserFactory from '../../../testutils/factories/hmppsAuthUser'

describe(CheckAssignmentPresenter, () => {
  describe('text', () => {
    it('returns text to be displayed', () => {
      const user = hmppsAuthUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build({ name: 'social inclusion' })
      const presenter = new CheckAssignmentPresenter('', user, '', serviceCategory)

      expect(presenter.text).toEqual({ title: 'Confirm the social inclusion referral assignment' })
    })
  })

  describe('summary', () => {
    describe('when the selected caseworker has a first and last name', () => {
      it('returns a summary of the selected caseworker with both names', () => {
        const user = hmppsAuthUserFactory.build({ firstName: 'John', lastName: 'Smith' })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new CheckAssignmentPresenter('', user, 'john@harmonyliving.org.uk', serviceCategory)

        expect(presenter.summary).toEqual([
          { key: 'Name', lines: ['John Smith'] },
          { key: 'Email address', lines: ['john@harmonyliving.org.uk'] },
        ])
      })
    })

    describe('when the selected caseworker has only a first name', () => {
      it('returns a summary of the selected caseworker with just the first name', () => {
        const user = hmppsAuthUserFactory.build({ firstName: 'John', lastName: '' })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new CheckAssignmentPresenter('', user, 'john@harmonyliving.org.uk', serviceCategory)

        expect(presenter.summary).toEqual([
          { key: 'Name', lines: ['John '] },
          { key: 'Email address', lines: ['john@harmonyliving.org.uk'] },
        ])
      })
    })

    describe('when the selected caseworker has only a last name', () => {
      it('returns a summary of the selected caseworker with just the last name', () => {
        const user = hmppsAuthUserFactory.build({ firstName: '', lastName: 'smith' })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new CheckAssignmentPresenter('', user, 'smith@harmonyliving.org.uk', serviceCategory)

        expect(presenter.summary).toEqual([
          { key: 'Name', lines: [' Smith'] },
          { key: 'Email address', lines: ['smith@harmonyliving.org.uk'] },
        ])
      })
    })

    describe('when the selected caseworker has neither a first or last name', () => {
      it('returns a summary with an empty string for the caseworker name', () => {
        const user = hmppsAuthUserFactory.build({ firstName: '', lastName: '' })
        const serviceCategory = serviceCategoryFactory.build()
        const presenter = new CheckAssignmentPresenter('', user, 'unknown@harmonyliving.org.uk', serviceCategory)

        expect(presenter.summary).toEqual([
          { key: 'Name', lines: [''] },
          { key: 'Email address', lines: ['unknown@harmonyliving.org.uk'] },
        ])
      })
    })
  })

  describe('hiddenFields', () => {
    it('returns a hidden field for the email address', () => {
      const user = hmppsAuthUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new CheckAssignmentPresenter('', user, 'john@harmonyliving.org.uk', serviceCategory)
      expect(presenter.hiddenFields).toEqual({ email: 'john@harmonyliving.org.uk' })
    })
  })

  describe('formAction', () => {
    it('returns a URL for submitting the assignment', () => {
      const user = hmppsAuthUserFactory.build()
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new CheckAssignmentPresenter('1', user, '', serviceCategory)
      expect(presenter.formAction).toEqual('/service-provider/referrals/1/assignment')
    })
  })
})
