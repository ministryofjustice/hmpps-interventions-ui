package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events

import org.springframework.context.ApplicationEvent
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.CaseNoteController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote

enum class CaseNoteEventType {
  SENT,
}

class CaseNoteEvent(
  source: Any,
  val type: CaseNoteEventType,
  val caseNote: CaseNote,
  val detailUrl: String,
) : ApplicationEvent(source)

@Component
class CaseNoteEventPublisher(
  private val applicationEventPublisher: ApplicationEventPublisher,
  private val locationMapper: LocationMapper,
) {
  fun caseNoteSentEvent(caseNote: CaseNote) {
    applicationEventPublisher.publishEvent(
      CaseNoteEvent(
        this,
        CaseNoteEventType.SENT,
        caseNote,
        caseNoteUrl(caseNote)
      )
    )
  }

  private fun caseNoteUrl(caseNote: CaseNote): String {
    val path = locationMapper.getPathFromControllerMethod(CaseNoteController::getCaseNote)
    return locationMapper.expandPathToCurrentRequestBaseUrl(path, caseNote.id).toString()
  }
}
