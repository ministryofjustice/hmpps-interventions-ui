import ShowReferralPresenter from './showReferralPresenter'
import sentReferralFactory from '../../../testutils/factories/sentReferral'
import serviceCategoryFactory from '../../../testutils/factories/serviceCategory'
import deliusUserFactory from '../../../testutils/factories/deliusUser'

describe(ShowReferralPresenter, () => {
  const serviceCategory = serviceCategoryFactory.build({ name: 'accommodation' })
  const referral = sentReferralFactory.build({
    referral: { serviceCategoryId: serviceCategory.id, serviceUser: { firstName: 'Jenny', lastName: 'Jones' } },
  })
  const deliusUser = deliusUserFactory.build({
    firstName: 'Bernard',
    surname: 'Beaks',
    email: 'bernard.beaks@justice.gov.uk',
  })

  describe('text', () => {
    it('returns text to be displayed', () => {
      const presenter = new ShowReferralPresenter(referral, serviceCategory, deliusUser)

      expect(presenter.text).toEqual({ title: 'Accommodation referral for Jenny Jones' })
    })
  })

  describe('probationPractitionerDetails', () => {
    it('returns a summary list of probation practitioner details', () => {
      const presenter = new ShowReferralPresenter(referral, serviceCategory, deliusUser)

      expect(presenter.probationPractitionerDetails).toEqual([
        { isList: false, key: 'Name', lines: ['Bernard Beaks'] },
        { isList: false, key: 'Email address', lines: ['bernard.beaks@justice.gov.uk'] },
      ])
    })
  })
})
