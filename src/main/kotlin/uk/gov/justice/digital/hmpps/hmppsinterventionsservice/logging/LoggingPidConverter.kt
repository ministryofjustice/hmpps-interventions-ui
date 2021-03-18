package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.logging

import ch.qos.logback.classic.pattern.ClassicConverter
import ch.qos.logback.classic.spi.ILoggingEvent

// used by the <pattern> section of the logback LoggingEventCompositeJsonEncoder
// and no, i couldn't find a simpler way to do this...
class LoggingPidConverter : ClassicConverter() {
  private val pid: String = ProcessHandle.current().pid().toString()

  override fun convert(event: ILoggingEvent): String {
    return pid
  }
}
