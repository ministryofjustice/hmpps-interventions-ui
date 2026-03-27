import { configureAllowedScripts } from '@ministryofjustice/hmpps-npm-script-allowlist'

export default configureAllowedScripts({
   allowlist: {
  // Needed by esbuild for watching files during development    
  "node_modules/@parcel/watcher@2.5.1": "ALLOW",
  //Downloads Cypress binary; required for E2E tests
  "node_modules/cypress@15.8.1": "ALLOW",
  //Optional native DTrace bindings; fails gracefully; transitive dependency of Cypress; required for E2E tests
  "node_modules/dtrace-provider@0.8.8": "ALLOW",
  //macOS native file events; standard transitive dep
  "node_modules/fsevents@2.3.3": "ALLOW",
  //NAPI Rust module resolver; standard binary selection for eslint tooling
  "node_modules/unrs-resolver@1.11.1": "ALLOW"
   },
})
