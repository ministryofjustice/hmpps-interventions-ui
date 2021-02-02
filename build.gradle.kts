plugins {
  id("uk.gov.justice.hmpps.gradle-spring-boot") version "1.1.1"
  kotlin("plugin.spring") version "1.4.10"
  id("org.jetbrains.kotlin.plugin.jpa") version "1.4.20"
}

repositories {
  jcenter()
  mavenCentral()
}

configurations {
  testImplementation {
    exclude(group = "org.junit.vintage")
    exclude("ch.qos.logback")
  }
}

tasks {
  test {
    useJUnitPlatform() {
      excludeTags("pact")
    }
  }

  register<Test>("pactTestPublish") {
    description = "Run and publish Pact provider tests"
    group = "verification"

    systemProperty("pact.provider.tag", System.getenv("PACT_PROVIDER_TAG"))
    systemProperty("pact.provider.version", System.getenv("PACT_PROVIDER_VERSION"))
    systemProperty("pact.verifier.publishResults", System.getenv("PACT_PUBLISH_RESULTS") ?: "false")

    useJUnitPlatform() {
      includeTags("pact")
    }
  }
}

dependencies {
  implementation("uk.gov.service.notify:notifications-java-client:3.17.0-RELEASE")
  implementation("software.amazon.awssdk:sns:2.15.71")

  // security
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")

  // database
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.hibernate:hibernate-core:5.4.24.Final")
  implementation("com.vladmihalcea:hibernate-types-52:2.10.2")
  runtimeOnly("org.flywaydb:flyway-core")
  runtimeOnly("org.postgresql:postgresql")

  testImplementation("au.com.dius.pact.provider:junit5spring:4.1.14")
  testImplementation("com.h2database:h2:1.4.200")
  testImplementation("uk.org.lidalia:slf4j-test:1.0.1")
}
