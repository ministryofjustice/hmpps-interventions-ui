import draftReferralFactory from '../../../testutils/factories/draftReferral'
import FindStartPresenter from './findStartPresenter'
import loggedInUserFactory from '../../../testutils/factories/loggedInUser'

describe('FindStartPresenter', () => {
  const referrals = [
    draftReferralFactory.createdAt(new Date('2021-01-02T12:00:00Z')).build({
      serviceUser: {
        firstName: 'rob',
        lastName: 'shah-brookes',
      },
      serviceProvider: {
        id: 'testingid1',
        name: 'service provider name 1',
      },
    }),
    draftReferralFactory.createdAt(new Date('2021-01-03T12:00:00Z')).build({
      serviceUser: {
        firstName: 'HARDIP',
        lastName: 'fraiser',
      },
      serviceProvider: {
        id: 'testingid2',
        name: 'service provider name 2',
      },
    }),
    draftReferralFactory.createdAt(new Date('2021-01-01T12:00:00Z')).build({
      serviceUser: {
        firstName: 'Jenny',
        lastName: 'Catherine',
      },
      serviceProvider: {
        id: 'testingid3',
        name: 'service provider name 3',
      },
    }),
  ]
  const loggedInUser = loggedInUserFactory.probationUser().build()

  describe('orderedReferrals', () => {
    it('returns an ordered list of draft referrals with formatted dates and names', () => {
      const presenter = new FindStartPresenter(
        referrals,
        {
          xlsx: 'example.xlsx',
        },
        { bytes: 0 },
        loggedInUser
      )

      expect(presenter.orderedReferrals).toEqual([
        {
          createdAt: '3 Jan 2021',
          providerName: 'service provider name 2',
          serviceUserFullName: 'Hardip Fraiser',
          contractTypeName: 'Accommodation',
          url: '/referrals/2/community-allocated-form',
        },
        {
          createdAt: '2 Jan 2021',
          providerName: 'service provider name 1',
          serviceUserFullName: 'Rob Shah-Brookes',
          contractTypeName: 'Accommodation',
          url: '/referrals/1/community-allocated-form',
        },
        {
          createdAt: '1 Jan 2021',
          providerName: 'service provider name 3',
          serviceUserFullName: 'Jenny Catherine',
          contractTypeName: 'Accommodation',
          url: '/referrals/3/community-allocated-form',
        },
      ])
    })
  })

  describe('fileInformation', () => {
    it('returns the file type and size in KB, rounded to one decimal place', async () => {
      const presenter = new FindStartPresenter(referrals, { xlsx: 'example.xlsx' }, { bytes: 11126 }, loggedInUser)

      expect(presenter.fileInformation).toEqual('XLSX, 10.9KB')
    })
  })

  describe('structuredInterventionsDownloadHrefs', () => {
    it('prepends a slash to the passed-in filepaths', () => {
      const presenter = new FindStartPresenter(referrals, { xlsx: 'example.xlsx' }, { bytes: 0 }, loggedInUser)

      expect(presenter.structuredInterventionsDownloadHrefs).toEqual({
        xlsx: '/example.xlsx',
      })
    })
  })
})
