# HMPPS Interventions UI

## Quickstart 

### Requirements 

- nvm (optional)
- Node.js >= 14
- npm >= 6
- Docker

### Build & Run 

```
docker-compose pull
docker-compose up -d 
(nvm use)
npm install 
npm run start:dev
```

Navigate to `http://localhost:3000` and login to the application using HMPPS Auth dev credentials e.g. `AUTH_ADM/password123456`

### Test

`npm run test`

### Lint

`npm run lint`
 
## Dependencies

- hmpps-auth - for authentication
- redis - session store and token caching


## Integration tests

For local running, start a test db, redis, and wiremock instance by:

`docker-compose -f docker-compose-test.yml up`

Then run the server in test mode by:

`npm run start-feature` (or `npm run start-feature:dev` to run with nodemon)

And then either, run tests in headless mode with:

`npm run int-test`
 
Or run tests with the Cypress UI:

`npm run int-test-ui`
