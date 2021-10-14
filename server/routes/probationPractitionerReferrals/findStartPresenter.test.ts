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
    }),
    draftReferralFactory.createdAt(new Date('2021-01-03T12:00:00Z')).build({
      serviceUser: {
        firstName: 'HARDIP',
        lastName: 'fraiser',
      },
    }),
    draftReferralFactory.createdAt(new Date('2021-01-01T12:00:00Z')).build({
      serviceUser: {
        firstName: 'Jenny',
        lastName: 'Catherine',
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
          pdf: 'example.pdf',
        },
        { bytes: 0 },
        loggedInUser
      )

      expect(presenter.orderedReferrals).toEqual([
        expect.objectContaining({ createdAt: '1 Jan 2021', serviceUserFullName: 'Jenny Catherine' }),
        expect.objectContaining({ createdAt: '2 Jan 2021', serviceUserFullName: 'Rob Shah-Brookes' }),
        expect.objectContaining({ createdAt: '3 Jan 2021', serviceUserFullName: 'Hardip Fraiser' }),
      ])
    })
  })

  describe('fileInformation', () => {
    it('returns the file type and size in KB, rounded to one decimal place', async () => {
      const presenter = new FindStartPresenter(
        referrals,
        { xlsx: 'example.xlsx', pdf: 'example.pdf' },
        { bytes: 11126 },
        loggedInUser
      )

      expect(presenter.fileInformation).toEqual('XLSX, 10.9KB')
    })
  })

  describe('structuredInterventionsDownloadHrefs', () => {
    it('prepends a slash to the passed-in filepaths', () => {
      const presenter = new FindStartPresenter(
        referrals,
        { xlsx: 'example.xlsx', pdf: 'example.pdf' },
        { bytes: 0 },
        loggedInUser
      )

      expect(presenter.structuredInterventionsDownloadHrefs).toEqual({
        xlsx: '/example.xlsx',
        pdf: '/example.pdf',
      })
    })
  })
})
