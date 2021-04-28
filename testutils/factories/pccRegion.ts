import { Factory } from 'fishery'
import PCCRegion from '../../server/models/pccRegion'

export default Factory.define<PCCRegion>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Cheshire',
}))
