plugins {
  id("uk.gov.justice.hmpps.gradle-spring-boot") version "1.1.1"
  kotlin("plugin.spring") version "1.4.10"
  id("org.jetbrains.kotlin.plugin.jpa") version "1.4.20"
}

configurations {
  testImplementation { exclude(group = "org.junit.vintage") }
}

dependencies {
  // security
  implementation("org.springframework.boot:spring-boot-starter-webflux")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

  // database
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.hibernate:hibernate-core:5.4.24.Final")
  runtimeOnly("org.flywaydb:flyway-core")
  runtimeOnly("org.postgresql:postgresql")

  testImplementation("com.h2database:h2:1.4.200")
}
