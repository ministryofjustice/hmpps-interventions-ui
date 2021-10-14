# Quickstart

## Requirements

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

## Running with AWS LocalStack for SNS (Simple Notification Service) or S3

- Install the AWS CLI with Homebrew: `brew install awscli`
- Configure the CLI for localstack: `aws configure --profile localstack` and set `AWS Access Key ID = test`, `AWS Secret Access Key = test`, `Default region name = eu-west-2`, `Default output format = json`
- Run localstack with docker-compose: `docker-compose -f docker-compose-localstack.yml up`

### SNS

- Create an SNS topic: `aws --profile localstack --endpoint-url=http://localhost:4566 sns create-topic --name intervention-events-local`
- Validate the topic ARN matches: `arn:aws:sns:eu-west-2:000000000000:intervention-events-local`, if not modify the ARN in `application-local.yml`
- Subscribe to topic: `aws --profile localstack --endpoint-url=http://localhost:4566 sns subscribe --topic-arn arn:aws:sns:eu-west-2:000000000000:intervention-events-local --protocol http --notification-endpoint http://host.docker.internal:5000`
- Output notifications: `npx http-echo-server 5000`
- Run the application with the following environment var `AWS_SNS_ENABLED=true`

### S3

- Create new buckets on startup: Edit 'script/localstack/buckets.sh' e.g. `awslocal s3 mb s3://new-bucket-name`
- List the contents of a bucket: `aws --profile localstack --endpoint-url=http://localhost:4566 s3 ls s3://new-bucket-name --recursive`

## Connecting to local database

If you want to connect to your local interventions service database, first exec onto the postgres container with:
```
docker exec -it ${containerId} /bin/sh
```
and then run:
```
psql -h localhost -d interventions -U postgres
```

## Seeding the local database

If you want to populate your local database with seeded values from [local data setup](/src/main/resources/db/local) then run:
```
SPRING_PROFILES_ACTIVE=local,seed ./gradlew bootRun
```
