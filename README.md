# HMPPS Interventions Service

Business/domain API to **find, arrange and monitor an intervention** for service users (offenders).

## Quickstart

### Requirements

- Docker
- Java

Build and test:
```
./gradlew build
```

Run:

First, add the following line to your `/etc/hosts` file to allow hmpps-auth interoperability with other docker services:

```127.0.0.1 hmpps-auth```

Then run:

```
docker-compose pull
docker-compose up -d
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

## Architecture

To see where this service fits in the broader interventions (and probation) architecture, you can browse the HMPPS C4 models [here](https://structurizr.com/share/56937/diagrams#interventions-container).

- [Decisions specific to this application](doc/adr)
- [Decisions relevant to the "interventions" domain](https://github.com/ministryofjustice/hmpps-interventions-docs)

## Code Style

[ktlint](https://github.com/pinterest/ktlint) is the authority on style and is enforced on build.

Run `./gradlew ktlintFormat` to fix formatting errors in your code before commit.
