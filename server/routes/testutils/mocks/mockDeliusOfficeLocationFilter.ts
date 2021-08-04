import DeliusOfficeLocationFilter from '../../../services/deliusOfficeLocationFilter'
import MockReferenceDataService from './mockReferenceDataService'

export default class MockDeliusOfficeLocationFilter extends DeliusOfficeLocationFilter {
  constructor() {
    super(new MockReferenceDataService())
  }
}
