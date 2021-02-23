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
    it('returns a summary of the selected caseworker', () => {
      const user = hmppsAuthUserFactory.build({ name: 'John Smith' })
      const serviceCategory = serviceCategoryFactory.build()
      const presenter = new CheckAssignmentPresenter('', user, 'john@harmonyliving.org.uk', serviceCategory)

      expect(presenter.summary).toEqual([
        { key: 'Name', lines: ['John Smith'], isList: false },
        { key: 'Email address', lines: ['john@harmonyliving.org.uk'], isList: false },
      ])
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
