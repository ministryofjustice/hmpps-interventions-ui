package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.microsoft.applicationinsights.TelemetryClient
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.InvalidAssumptionError

@Service
class TelemetryService(
  private val telemetryClient: TelemetryClient,
) {
  fun reportInvalidAssumption(assumption: String, information: Map<String, String> = emptyMap(), recoverable: Boolean = true) {
    telemetryClient.trackEvent(
      "InterventionsInvalidAssumption",
      mapOf("assumption" to assumption).plus(information),
      null
    )

    if (!recoverable) {
      throw InvalidAssumptionError(assumption)
    }
  }
}
