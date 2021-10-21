plugins {
  id("uk.gov.justice.hmpps.gradle-spring-boot") version "3.3.10"
  kotlin("plugin.spring") version "1.5.31"
  id("org.jetbrains.kotlin.plugin.jpa") version "1.5.31"
}

repositories {
  jcenter()
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
  implementation("io.sentry:sentry-spring-boot-starter:5.2.4")
  implementation("io.sentry:sentry-logback:5.2.4")
  implementation("io.github.microutils:kotlin-logging-jvm:2.0.11")

  // openapi
  implementation("org.springdoc:springdoc-openapi-ui:1.5.11")

  // notifications
  implementation("uk.gov.service.notify:notifications-java-client:3.17.2-RELEASE")

  // aws
  implementation("software.amazon.awssdk:sns:2.17.16")
  implementation("software.amazon.awssdk:s3:2.17.16")

  // security
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("com.nimbusds:oauth2-oidc-sdk:9.19")
  // Issue with 4.1.67.Final from spring-boot-starter-webflux
  implementation("io.netty:netty-codec:4.1.69.Final")

  // database
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.hibernate:hibernate-core:5.6.0.Final")
  implementation("com.vladmihalcea:hibernate-types-52:2.13.0")
  runtimeOnly("org.flywaydb:flyway-core")
  runtimeOnly("org.postgresql:postgresql")

  // json
  implementation("com.github.java-json-tools:json-patch:1.13")

  testImplementation("au.com.dius.pact.provider:junit5spring:4.2.14")
  testImplementation("com.squareup.okhttp3:okhttp:4.9.2")
  testImplementation("com.squareup.okhttp3:mockwebserver:4.9.2")
}
