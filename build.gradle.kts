plugins {
  id("uk.gov.justice.hmpps.gradle-spring-boot") version "4.1.1"
  kotlin("plugin.spring") version "1.6.10"
  id("org.jetbrains.kotlin.plugin.jpa") version "1.6.10"
}

repositories {
  mavenCentral()
}

configurations {
  testImplementation {
    exclude(group = "org.junit.vintage")
  }
}

tasks {
  test {
    useJUnitPlatform {
      exclude("**/*PactTest*")
    }
  }

  register<Test>("pactTestPublish") {
    description = "Run and publish Pact provider tests"
    group = "verification"

    systemProperty("pact.provider.tag", System.getenv("PACT_PROVIDER_TAG"))
    systemProperty("pact.provider.version", System.getenv("PACT_PROVIDER_VERSION"))
    systemProperty("pact.verifier.publishResults", System.getenv("PACT_PUBLISH_RESULTS") ?: "false")

    useJUnitPlatform {
      include("**/*PactTest*")
    }
  }
}

dependencies {
  // batch processing
  implementation("org.springframework.boot:spring-boot-starter-batch")

  // monitoring and logging
  implementation("io.micrometer:micrometer-registry-prometheus")
  implementation("io.sentry:sentry-spring-boot-starter:5.7.0")
  implementation("io.sentry:sentry-logback:5.7.0")
  implementation("io.github.microutils:kotlin-logging-jvm:2.1.21")
  runtimeOnly("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.13.2") // needed for OffsetDateTime for AppInsights

  // openapi
  implementation("org.springdoc:springdoc-openapi-ui:1.6.5")

  // notifications
  implementation("uk.gov.service.notify:notifications-java-client:3.17.2-RELEASE")

  // aws
  implementation("software.amazon.awssdk:sns:2.17.16")
  implementation("software.amazon.awssdk:s3:2.17.16")

  // security
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("com.nimbusds:oauth2-oidc-sdk:9.29")

  // database
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.hibernate:hibernate-core:5.6.7.Final")
  implementation("com.vladmihalcea:hibernate-types-52:2.14.1")
  runtimeOnly("org.flywaydb:flyway-core")
  runtimeOnly("org.postgresql:postgresql:42.2.25")

  // json and csv
  implementation("com.github.java-json-tools:json-patch:1.13")
  implementation("org.apache.commons:commons-csv:1.9.0")

  testImplementation("au.com.dius.pact.provider:junit5spring:4.3.6")
  testImplementation("com.squareup.okhttp3:okhttp:4.9.3")
  testImplementation("com.squareup.okhttp3:mockwebserver:4.9.3")
  testImplementation("org.mockito:mockito-inline:4.4.0")
}
