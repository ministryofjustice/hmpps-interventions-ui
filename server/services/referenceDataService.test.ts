import ReferenceDataService from './referenceDataService'

describe(ReferenceDataService, () => {
  describe('with valid csv', () => {
    it('should return correct reference data office locations', async () => {
      const referenceDataService = new ReferenceDataService()
      const data = await referenceDataService.getProbationOffices()
      const buxtonOffice = data[1]
      expect(buxtonOffice.probationOfficeId).toEqual(2)
      expect(buxtonOffice.name).toEqual('Derbyshire: Buxton Probation Office')
      expect(buxtonOffice.address).toEqual(
        'Probation Office, Chesterfield House, 25 Hardwick Street, Buxton, Derbyshire, SK17 6DH'
      )
      expect(buxtonOffice.probationRegionId).toEqual('F')
      expect(buxtonOffice.govUkURL).toEqual('https://www.gov.uk/guidance/derbyshire-chesterfield-house')
      expect(buxtonOffice.deliusCRSLocationId).toEqual('CRS0032')
    })
  })
})
