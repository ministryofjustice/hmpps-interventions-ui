import { Factory } from 'fishery'
import { ServiceProvider } from '../../server/services/interventionsService'

export default Factory.define<ServiceProvider>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Harmony Living',
}))
