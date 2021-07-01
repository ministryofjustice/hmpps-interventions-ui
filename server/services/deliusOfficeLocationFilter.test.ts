import ReferenceDataService from './referenceDataService'
import DeliusOfficeLocationFilter from './deliusOfficeLocationFilter'
import MockReferenceDataService from '../routes/testutils/mocks/mockReferenceDataService'
import interventionFactory from '../../testutils/factories/intervention'
import deliusOfficeLocationFactory from '../../testutils/factories/deliusOfficeLocation'

jest.mock('./interventionsService')
jest.mock('./referenceDataService')

describe(DeliusOfficeLocationFilter, () => {
  const referenceDataService = new MockReferenceDataService() as jest.Mocked<ReferenceDataService>
  const deliusOfficeLocationProvider = new DeliusOfficeLocationFilter(referenceDataService)
  describe('with an intervention having an nps region', () => {
    it('should return an office within the same nps region', async () => {
      const intervention = interventionFactory.build({
        npsRegion: { id: 'B', name: 'North West' },
        pccRegions: [],
      })
      const deliusOfficeLocation = deliusOfficeLocationFactory.build({ probationRegionId: 'B' })
      referenceDataService.getProbationOffices.mockResolvedValue([deliusOfficeLocation])
      const offices = await deliusOfficeLocationProvider.findOfficesByIntervention(intervention)
      expect(offices.length).toEqual(1)
      expect(offices[0].probationRegionId).toEqual('B')
    })
    it('should filter out offices with empty crs location ids', async () => {
      const intervention = interventionFactory.build({
        npsRegion: { id: 'B', name: 'North West' },
        pccRegions: [],
      })
      const emptyOfficeLocation = deliusOfficeLocationFactory.build({
        deliusCRSLocationId: '',
      })
      referenceDataService.getProbationOffices.mockResolvedValue([emptyOfficeLocation])
      const offices = await deliusOfficeLocationProvider.findOfficesByIntervention(intervention)
      expect(offices.length).toEqual(0)
    })
  })
  describe('with an intervention having a pcc region', () => {
    it('should return an office within the same nps region', async () => {
      const intervention = interventionFactory.build({
        npsRegion: null,
        pccRegions: [{ id: 'cheshire', name: 'Cheshire', npsRegion: { id: 'B', name: 'North West' } }],
      })
      const deliusOfficeLocation = deliusOfficeLocationFactory.build({ probationRegionId: 'B' })
      referenceDataService.getProbationOffices.mockResolvedValue([deliusOfficeLocation])
      const offices = await deliusOfficeLocationProvider.findOfficesByIntervention(intervention)
      expect(offices.length).toEqual(1)
      expect(offices[0].probationRegionId).toEqual('B')
    })
  })

  describe('with an intervention containing multiple regions', () => {
    it('should return an an office for each region', async () => {
      const intervention = interventionFactory.build({
        npsRegion: { id: 'A', name: 'North West' },
        pccRegions: [
          { id: 'cheshire', name: 'Cheshire', npsRegion: { id: 'B', name: 'North West' } },
          { id: 'cheshire', name: 'Cheshire', npsRegion: { id: 'C', name: 'North West' } },
        ],
      })
      const deliusOfficeLocationA = deliusOfficeLocationFactory.build({ probationRegionId: 'A' })
      const deliusOfficeLocationB = deliusOfficeLocationFactory.build({ probationRegionId: 'B' })
      const deliusOfficeLocationC = deliusOfficeLocationFactory.build({ probationRegionId: 'C' })
      referenceDataService.getProbationOffices.mockResolvedValue([
        deliusOfficeLocationA,
        deliusOfficeLocationB,
        deliusOfficeLocationC,
      ])
      const offices = await deliusOfficeLocationProvider.findOfficesByIntervention(intervention)
      expect(offices.length).toEqual(3)
      expect(offices[0].probationRegionId).toEqual('A')
      expect(offices[1].probationRegionId).toEqual('B')
      expect(offices[2].probationRegionId).toEqual('C')
    })
  })

  describe('with an intervention having no valid regions', () => {
    it('should return an empty list of offices', async () => {
      const intervention = interventionFactory.build({
        npsRegion: { id: 'UNKNOWN', name: 'Unknown' },
        pccRegions: [{ id: 'unknown', name: 'Unknown', npsRegion: { id: 'UNKNOWN', name: 'Unknown' } }],
      })
      const deliusOfficeLocation = deliusOfficeLocationFactory.build({ probationRegionId: 'B' })
      referenceDataService.getProbationOffices.mockResolvedValue([deliusOfficeLocation])
      const offices = await deliusOfficeLocationProvider.findOfficesByIntervention(intervention)
      expect(offices.length).toEqual(0)
    })
  })
})
