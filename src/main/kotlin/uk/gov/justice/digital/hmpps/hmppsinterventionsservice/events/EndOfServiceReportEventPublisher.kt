package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.EndOfServiceReportController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport

enum class EndOfServiceReportEventType {
  SUBMITTED,
}

class EndOfServiceReportEvent(
  source: Any,
  val type: EndOfServiceReportEventType,
  val endOfServiceReport: EndOfServiceReport,
  val detailUrl: String,
  val referralReference: String,
  val ppUser: AuthUser,
) :
  ApplicationEvent(source) {
  override fun toString(): String {
    return "EndOfServiceReportEvent(type=$type, referral=${endOfServiceReport.id}, detailUrl='$detailUrl', source=$source, referralReference='$referralReference, ppUser='$ppUser)"
  }
}

@Component
class EndOfServiceReportEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper
) {
  fun endOfServiceReportSubmittedEvent(endOfServiceReport: EndOfServiceReport, referralReference: String, ppUser: AuthUser) {
    applicationEventPublisher.publishEvent(
      EndOfServiceReportEvent(
        this, EndOfServiceReportEventType.SUBMITTED,
        endOfServiceReport, getEndOfServiceReportUrl(endOfServiceReport), referralReference, ppUser
      )
    )
  }

  private fun getEndOfServiceReportUrl(endOfServiceReport: EndOfServiceReport): String {
    val path = locationMapper.getPathFromControllerMethod(EndOfServiceReportController::getEndOfServiceReportById)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, endOfServiceReport.id).toString()
  }
}
