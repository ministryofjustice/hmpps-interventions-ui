package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import ch.qos.logback.classic.spi.ILoggingEvent
import ch.qos.logback.core.read.ListAppender

class LoggingMemoryAppender : ListAppender<ILoggingEvent>() {
  val logEvents: List<ILoggingEvent>
    get() = list

  fun reset() {
    list.clear()
  }
}
