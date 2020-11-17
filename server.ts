import app from './server/index'
import log from './log'

app.listen(app.get('port'), () => {
  log.info(`Server listening on port ${app.get('port')}`)
})
