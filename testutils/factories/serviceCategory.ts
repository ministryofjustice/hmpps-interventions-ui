import { Factory } from 'fishery'
import { ServiceCategory } from '../../server/services/interventionsService'

export default Factory.define<ServiceCategory>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'accommodation',
}))
