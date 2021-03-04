import bunyan from 'bunyan'
import config from './server/config'

const level = config.production ? 'warn' : 'debug'
const log = bunyan.createLogger({
  name: 'interventions',
  level,
  stream: process.stdout,
  serializers: bunyan.stdSerializers,
})

export default log
