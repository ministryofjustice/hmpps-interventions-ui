# HMPPS Interventions UI

test

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

### Unit Test

`npm run test`

### Lint

`npm run lint`

### Integration Test

The integration tests require a different docker-compose stack and a different application configuration. Run each of the following commands in its own shell. 

`docker-compose -f docker-compose-test.yml up`

`npm run start:test`

`npm run int-test(-ui)`
 
## Dependencies

- hmpps-auth - for authentication
- redis - session store and token caching
