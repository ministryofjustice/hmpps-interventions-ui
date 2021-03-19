package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.health

import com.microsoft.applicationinsights.extensibility.ContextInitializer
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.boot.info.BuildProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.EventListener

@Configuration
class VersionOutputter(buildProperties: BuildProperties) {
  companion object : KLogging()

  private val version = buildProperties.version

  @EventListener(ApplicationReadyEvent::class)
  fun logVersionOnStartup() {
    logger.info("application started {}", kv("application_version", version))
  }

  @Bean
  fun versionContextInitializer() = ContextInitializer { it.component.setVersion(version) }
}
