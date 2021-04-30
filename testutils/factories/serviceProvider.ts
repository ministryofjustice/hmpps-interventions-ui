import { Factory } from 'fishery'
import ServiceProvider from '../../server/models/serviceProvider'

export default Factory.define<ServiceProvider>(({ sequence }) => ({
  id: sequence.toString(),
  name: 'Harmony Living',
}))
