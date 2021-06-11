package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory

internal class ActionPlanSessionsDTOTest {
  private val actionPlanSessionFactory = ActionPlanSessionFactory()
  @Test
  fun `Maps from a session`() {
    val session = actionPlanSessionFactory.createScheduled()
    val sessionDTO = ActionPlanSessionDTO.from(session)

    assertThat(sessionDTO.id).isEqualTo(session.id)
    assertThat(sessionDTO.sessionNumber).isEqualTo(session.sessionNumber)
    assertThat(sessionDTO.appointmentTime).isEqualTo(session.currentAppointment?.appointmentTime)
    assertThat(sessionDTO.durationInMinutes).isEqualTo(session.currentAppointment?.durationInMinutes)
  }

  @Test
  fun `Maps from a list of sessions`() {
    val session = actionPlanSessionFactory.createScheduled()
    val sessionsDTO = ActionPlanSessionDTO.from(listOf(session))

    assertThat(sessionsDTO.size).isEqualTo(1)
    assertThat(sessionsDTO.first().id).isEqualTo(session.id)
    assertThat(sessionsDTO.first().sessionNumber).isEqualTo(session.sessionNumber)
    assertThat(sessionsDTO.first().appointmentTime).isEqualTo(session.currentAppointment?.appointmentTime)
    assertThat(sessionsDTO.first().durationInMinutes).isEqualTo(session.currentAppointment?.durationInMinutes)
  }
}
