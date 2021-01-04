plugins {
  id("uk.gov.justice.hmpps.gradle-spring-boot") version "1.1.1"
  kotlin("plugin.spring") version "1.4.10"
  id("org.jetbrains.kotlin.plugin.jpa") version "1.4.20"
}

configurations {
  testImplementation { exclude(group = "org.junit.vintage") }
}

tasks {
  register<Test>("pactTestPublish") {
    description = "Run and publish Pact provider tests"
    group = "verification"

    systemProperty("pact.provider.tag", System.getenv("PACT_PROVIDER_TAG"))
    systemProperty("pact.provider.version", System.getenv("PACT_PROVIDER_VERSION"))

    systemProperty("pact.verifier.publishResults", "true")
    systemProperty("pactbroker.host", System.getenv("PACT_BROKER_HOST"))
    systemProperty("pactbroker.auth.username", System.getenv("PACT_BROKER_USERNAME"))
    systemProperty("pactbroker.auth.password", System.getenv("PACT_BROKER_PASSWORD"))

    useJUnitPlatform()
    filter {
      includeTestsMatching("PactTest")
    }
  }
}

dependencies {
  // errors
  implementation("me.alidg:errors-spring-boot-starter:1.4.0")

  // security
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

  // database
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.hibernate:hibernate-core:5.4.24.Final")
  runtimeOnly("org.flywaydb:flyway-core")
  runtimeOnly("org.postgresql:postgresql")

  testImplementation("au.com.dius.pact.provider:junit5:4.1.11")
  testImplementation("com.h2database:h2:1.4.200")
}
