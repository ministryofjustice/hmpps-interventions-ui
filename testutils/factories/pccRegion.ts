import { Factory } from 'fishery'
import { PCCRegion } from '../../server/services/interventionsService'

export default Factory.define<PCCRegion>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Cheshire',
}))
