# HMPPS Interventions Service

This is the HMPPS Interventions Service

## Quickstart

### Requirements

- Docker 
- Java

Build and test:
```
./gradlew build
```

Run:
```
docker-compose pull
docker-compose up -d
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun
```

## Architecture

To see where this service fits in the broader interventions (and probation) architecture, you can browse the HMPPS C4 models [here](https://structurizr.com/share/56937/diagrams#interventions-container).

## Code Style

[ktlint](https://github.com/pinterest/ktlint) is the authority on style and is enforced on build.

Run `./gradlew ktlintFormat` to fix formatting errors in your code before commit.
