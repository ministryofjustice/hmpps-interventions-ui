package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.event.ApplicationEventMulticaster
import org.springframework.context.event.SimpleApplicationEventMulticaster
import org.springframework.core.task.SimpleAsyncTaskExecutor

@Configuration
class EventsConfiguration {
  @Bean(name = ["applicationEventMulticaster"])
  fun simpleApplicationEventMulticaster(): ApplicationEventMulticaster {
    // enables async processing of spring events
    val eventMulticaster = SimpleApplicationEventMulticaster()
    eventMulticaster.setTaskExecutor(SimpleAsyncTaskExecutor())
    return eventMulticaster
  }
}
