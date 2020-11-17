import buildInfo from '../../build-info.json'

export = function healthcheckFactory() {
  // this list is used to check health of services we depend on
  const checks = []

  return callback =>
    Promise.all(checks.map(fn => fn())).then(checkResults => {
      const allOk = checkResults.every(item => item.status === 'ok')
      const result = {
        healthy: allOk,
        checks: checkResults.reduce(gatherCheckInfo, {}),
      }
      callback(null, addAppInfo(result))
    })
}

function gatherCheckInfo(total, currentValue) {
  return { ...total, [currentValue.name]: currentValue.message }
}

function addAppInfo(result) {
  const buildInformation = {
    uptime: process.uptime(),
    build: buildInfo,
    version: buildInfo && buildInfo.buildNumber,
  }

  return { ...result, ...buildInformation }
}
