/* eslint-disable no-console */

import Writer from './writer'

// This script generates TypeScript interfaces for the arguments of Nunjucks macros,
// using the macro_options.json files that the GOV.UK Frontend library provides.

// We want the output from this script to be fairly readable, but we don’t
// need to worry about outputting _very_ well-formatted code because we run
// Prettier on the output anyway.

Writer.writeDefinitions()
  .then(() => {
    console.log('Wrote definitions.')
  })
  .catch(e => {
    console.log(`Failed to write definitions: ${e.message}`)
  })
