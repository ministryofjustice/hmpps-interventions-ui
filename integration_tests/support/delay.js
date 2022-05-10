/* eslint-disable no-restricted-syntax */

// Set CYPRESS_COMMAND_DELAY above zero for demoing to stakeholders,
const CYPRESS_COMMAND_DELAY = Cypress.env('CYPRESS_COMMAND_DELAY') || 0
if (CYPRESS_COMMAND_DELAY > 0) {
  for (const command of ['visit', 'click', 'trigger', 'type', 'clear', 'reload', 'contains', 'get', 'next', 'prev']) {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
      const origVal = originalFn(...args)

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(origVal)
        }, CYPRESS_COMMAND_DELAY)
      })
    })
  }
}
