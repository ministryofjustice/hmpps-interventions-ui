# HMPPS Interventions UI

## Quickstart 

### Requirements 

- nvm (optional)
- Node.js >= 14
- npm >= 6
- Docker

### Initial setup

```
docker-compose pull
(nvm use)
npm install
```

You'll also need to add the following line to your `/etc/hosts` file:

```
127.0.0.1 hmpps-auth
```

### Running the app

```
docker-compose up -d
npm run start:dev
```

Navigate to `http://localhost:3000` and log in:

- To log in as a service provider user, use HMPPS Auth dev credentials e.g. `AUTH_ADM/password123456`
- To log in as a probation practitioner user, use [Community API dev credentials](https://github.com/ministryofjustice/community-api/blob/main/src/main/resources/schema.ldif) e.g. `bernard.beaks/secret`.

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
