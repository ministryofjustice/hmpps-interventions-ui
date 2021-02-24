# HMPPS Interventions Service

[![API docs](https://img.shields.io/badge/API_docs-view-85EA2D.svg?logo=swagger)](https://hmpps-interventions-service-dev.apps.live-1.cloud-platform.service.justice.gov.uk/swagger-ui.html)

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

### Running with AWS LocalStack for SNS (Simple Notification Service)

- Install the AWS CLI with Homebrew: `brew install awscli`
- Configure the CLI for localstack: `aws configure --profile localstack` and set `AWS Access Key ID = test`, `AWS Secret Access Key = test`, `Default region name = eu-west-2`, `Default output format = json`
- Run localstack with docker-compose: `docker-compose -f docker-compose-localstack.yml up`
- Create an SNS topic: `aws --profile localstack --endpoint-url=http://localhost:4566 sns create-topic --name intervention-events-local`
- Validate the topic ARN matches: `arn:aws:sns:eu-west-2:000000000000:intervention-events-local`, if not modify the ARN in `application-local.yml`
- Subscribe to topic: `aws --profile localstack --endpoint-url=http://localhost:4566 sns subscribe --topic-arn arn:aws:sns:eu-west-2:000000000000:intervention-events-local --protocol http --notification-endpoint http://host.docker.internal:5000`
- Output notifications: `npx http-echo-server 5000`
- Run the application with the following environment var `AWS_SNS_ENABLED=true`

## Architecture

To see where this service fits in the broader interventions (and probation) architecture, you can browse the HMPPS C4 models [here](https://structurizr.com/share/56937/diagrams#interventions-container).

- [Decisions specific to this application](doc/adr)
- [Decisions relevant to the "interventions" domain](https://github.com/ministryofjustice/hmpps-interventions-docs)

## Code Style

[ktlint](https://github.com/pinterest/ktlint) is the authority on style and is enforced on build.

Run `./gradlew ktlintFormat` to fix formatting errors in your code before commit.

### OpenAPI

OpenAPI documentation is auto-generated. To view it start the application and visit /swagger-ui.html in your browser.
